"""Color extraction endpoint using k-means++ algorithm."""

from io import BytesIO

import numpy as np
from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile
from numpy.typing import NDArray
from PIL import Image

from app.core.config import Settings
from app.core.logging import get_logger
from app.dependencies import get_settings_dependency
from app.schemas.colors import ColorExtractionResponse, ExtractedColor

router = APIRouter()
logger = get_logger(__name__)


def srgb_to_linear(rgb: NDArray[np.float64]) -> NDArray[np.float64]:
    """Convert sRGB to linear RGB."""
    return np.where(rgb <= 0.04045, rgb / 12.92, ((rgb + 0.055) / 1.055) ** 2.4)


def linear_to_srgb(rgb: NDArray[np.float64]) -> NDArray[np.float64]:
    """Convert linear RGB to sRGB."""
    return np.where(rgb <= 0.0031308, rgb * 12.92, 1.055 * (rgb ** (1 / 2.4)) - 0.055)


def rgb_to_oklab(rgb: NDArray[np.float64]) -> NDArray[np.float64]:
    """Convert RGB (0-255) to Oklab color space."""
    # Normalize to 0-1 and convert to linear RGB
    rgb_normalized = rgb / 255.0
    linear = srgb_to_linear(rgb_normalized)

    # Linear RGB to LMS
    lms_l = 0.4122214708 * linear[:, 0] + 0.5363325363 * linear[:, 1] + 0.0514459929 * linear[:, 2]
    lms_m = 0.2119034982 * linear[:, 0] + 0.6806995451 * linear[:, 1] + 0.1073969566 * linear[:, 2]
    lms_s = 0.0883024619 * linear[:, 0] + 0.2817188376 * linear[:, 1] + 0.6299787005 * linear[:, 2]

    # LMS to Oklab
    l_ = np.cbrt(lms_l)
    m_ = np.cbrt(lms_m)
    s_ = np.cbrt(lms_s)

    L = 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_
    a = 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_
    b = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_

    return np.column_stack([L, a, b])


def oklab_to_rgb(lab: NDArray[np.float64]) -> NDArray[np.float64]:
    """Convert Oklab to RGB (0-255)."""
    L, a, b = lab[:, 0], lab[:, 1], lab[:, 2]

    # Oklab to LMS
    l_ = L + 0.3963377774 * a + 0.2158037573 * b
    m_ = L - 0.1055613458 * a - 0.0638541728 * b
    s_ = L - 0.0894841775 * a - 1.2914855480 * b

    lms_l = l_**3
    lms_m = m_**3
    lms_s = s_**3

    # LMS to linear RGB
    r = 4.0767416621 * lms_l - 3.3077115913 * lms_m + 0.2309699292 * lms_s
    g = -1.2684380046 * lms_l + 2.6097574011 * lms_m - 0.3413193965 * lms_s
    b_out = -0.0041960863 * lms_l - 0.7034186147 * lms_m + 1.7076147010 * lms_s

    linear = np.column_stack([r, g, b_out])

    # Convert to sRGB and scale to 0-255
    srgb = linear_to_srgb(np.clip(linear, 0, 1))
    return srgb * 255.0


def kmeans_plusplus_init(
    pixels: NDArray[np.float64],
    n_clusters: int,
    rng: np.random.Generator,
) -> NDArray[np.float64]:
    """Initialize cluster centers using k-means++ algorithm."""
    n_samples = pixels.shape[0]
    centers: list[NDArray[np.float64]] = []

    # Choose first center randomly
    first_idx = rng.integers(n_samples)
    centers.append(pixels[first_idx])

    for _ in range(1, n_clusters):
        # Compute distances to nearest center
        distances = np.min(
            [np.sum((pixels - c) ** 2, axis=1) for c in centers],
            axis=0,
        )

        # Choose next center with probability proportional to distance squared
        total_dist = distances.sum()
        if total_dist == 0:
            # All pixels are identical to existing centers, pick randomly
            next_idx = rng.integers(n_samples)
        else:
            probabilities = distances / total_dist
            next_idx = rng.choice(n_samples, p=probabilities)
        centers.append(pixels[next_idx])

    return np.array(centers)


def kmeans(
    pixels: NDArray[np.float64],
    n_clusters: int,
    max_iterations: int = 100,
    random_state: int = 42,
    chroma_weight: float = 10,
) -> tuple[NDArray[np.float64], NDArray[np.intp]]:
    """K-means clustering with k-means++ initialization and chroma weighting.

    Args:
        pixels: Input pixels in Oklab space
        n_clusters: Number of clusters
        max_iterations: Maximum iterations
        random_state: Random seed
        chroma_weight: Weight factor for saturated colors (higher = more emphasis on vivid colors)
    """
    rng = np.random.default_rng(random_state)

    # Calculate chroma (saturation) for each pixel: sqrt(a² + b²)
    chroma = np.sqrt(pixels[:, 1] ** 2 + pixels[:, 2] ** 2)
    # Normalize chroma weights: 1 + chroma * factor
    pixel_weights = 1.0 + chroma * chroma_weight

    # Initialize centers using k-means++
    centers = kmeans_plusplus_init(pixels, n_clusters, rng)

    for _ in range(max_iterations):
        # Assign pixels to nearest center
        distances = np.array([np.sum((pixels - c) ** 2, axis=1) for c in centers])
        labels = np.argmin(distances, axis=0)

        # Update centers using weighted mean
        new_centers = []
        for k in range(n_clusters):
            mask = labels == k
            if np.any(mask):
                cluster_pixels = pixels[mask]
                cluster_weights = pixel_weights[mask]
                # Weighted mean: saturated colors have more influence
                weighted_sum = np.sum(cluster_pixels * cluster_weights[:, np.newaxis], axis=0)
                new_center = weighted_sum / cluster_weights.sum()
                new_centers.append(new_center)
            else:
                new_centers.append(centers[k])
        new_centers = np.array(new_centers)

        # Check convergence
        if np.allclose(centers, new_centers):
            break

        centers = new_centers

    return centers, labels


def mean_shift(
    pixels: NDArray[np.float64],
    bandwidth: float = 0.04,
    max_iterations: int = 50,
    convergence_threshold: float = 1e-4,
    max_clusters: int = 10,
    chroma_weight: float = 10,
) -> tuple[NDArray[np.float64], NDArray[np.intp]]:
    """Mean Shift clustering for automatic cluster detection.

    Args:
        pixels: Input pixels in Oklab space
        bandwidth: Kernel bandwidth (larger = fewer clusters)
        max_iterations: Maximum iterations per point
        convergence_threshold: Stop when shift is smaller than this
        max_clusters: Maximum number of clusters to return
        chroma_weight: Weight factor for saturated colors (higher = more emphasis on vivid colors)
    """
    n_samples = len(pixels)

    # Calculate chroma (saturation) for each pixel: sqrt(a² + b²)
    chroma = np.sqrt(pixels[:, 1] ** 2 + pixels[:, 2] ** 2)
    # Normalize chroma weights: 1 + chroma * factor
    pixel_weights = 1.0 + chroma * chroma_weight

    # Sample pixels for seed points (for performance)
    # Weight sampling by chroma to start from vivid colors
    n_seeds = min(200, n_samples)
    rng = np.random.default_rng(42)
    sample_probs = pixel_weights / pixel_weights.sum()
    seed_indices = rng.choice(n_samples, n_seeds, replace=False, p=sample_probs)
    seeds = pixels[seed_indices].copy()

    # Shift each seed to its mode
    modes = []
    for seed in seeds:
        point = seed.copy()

        for _ in range(max_iterations):
            # Calculate distances to all pixels
            distances = np.sqrt(np.sum((pixels - point) ** 2, axis=1))

            # Gaussian kernel weights combined with chroma weights
            kernel_weights = np.exp(-0.5 * (distances / bandwidth) ** 2)
            weights = kernel_weights * pixel_weights
            weights_sum = weights.sum()

            if weights_sum == 0:
                break

            # Shift towards weighted mean (saturated colors pull harder)
            new_point = np.sum(pixels * weights[:, np.newaxis], axis=0) / weights_sum

            # Check convergence
            shift = np.sqrt(np.sum((new_point - point) ** 2))
            point = new_point

            if shift < convergence_threshold:
                break

        modes.append(point)

    modes = np.array(modes)

    # Merge nearby modes
    merged_modes: list[NDArray[np.float64]] = []
    used = np.zeros(len(modes), dtype=bool)

    for i in range(len(modes)):
        if used[i]:
            continue

        # Find all modes within bandwidth
        distances = np.sqrt(np.sum((modes - modes[i]) ** 2, axis=1))
        nearby = distances < bandwidth

        # Average nearby modes
        merged_mode = modes[nearby].mean(axis=0)
        merged_modes.append(merged_mode)
        used[nearby] = True

    centers = np.array(merged_modes)

    # Limit to max_clusters by keeping largest clusters
    if len(centers) > max_clusters:
        # Assign pixels to get cluster sizes
        distances = np.array([np.sqrt(np.sum((pixels - c) ** 2, axis=1)) for c in centers])
        temp_labels = np.argmin(distances, axis=0)

        # Count pixels per cluster
        cluster_sizes = np.array([np.sum(temp_labels == k) for k in range(len(centers))])

        # Keep top max_clusters
        top_indices = np.argsort(cluster_sizes)[-max_clusters:]
        centers = centers[top_indices]

    # Assign all pixels to nearest center
    distances = np.array([np.sqrt(np.sum((pixels - c) ** 2, axis=1)) for c in centers])
    labels = np.argmin(distances, axis=0)

    logger.info(f"Mean Shift found {len(centers)} clusters (bandwidth={bandwidth})")

    return centers, labels


def extract_colors_from_image(
    image: Image.Image,
    num_colors: int,
    resize_width: int = 150,
    similarity_threshold: float = 0.15,
) -> list[ExtractedColor]:
    """Extract dominant colors from image using k-means++ in Oklab color space.

    Uses oversampling (3x clusters) then greedy selection to avoid similar colors.
    """
    # Resize for performance
    aspect_ratio = image.height / image.width
    new_size = (resize_width, int(resize_width * aspect_ratio))
    image = image.resize(new_size, Image.Resampling.LANCZOS)

    # Get pixels as numpy array, handling transparency
    img_array = np.array(image)

    if image.mode == "RGBA":
        # Filter out transparent pixels (alpha < 128)
        alpha = img_array[:, :, 3]
        mask = alpha.flatten() >= 128
        pixels_rgb = img_array[:, :, :3].reshape(-1, 3).astype(np.float64)
        pixels_rgb = pixels_rgb[mask]
    else:
        # Convert to RGB if needed
        if image.mode != "RGB":
            image = image.convert("RGB")
            img_array = np.array(image)
        pixels_rgb = img_array.reshape(-1, 3).astype(np.float64)

    # Check if we have any pixels to process
    if len(pixels_rgb) == 0:
        return []

    # Convert to Oklab for perceptually uniform clustering
    pixels_oklab = rgb_to_oklab(pixels_rgb)

    # Oversample: use 3x clusters to find more color variations
    n_oversample = num_colors * 3
    centers_oklab, labels = kmeans(pixels_oklab, n_clusters=n_oversample)

    # Calculate cluster sizes
    unique, counts = np.unique(labels, return_counts=True)
    total_pixels = len(labels)

    # Build cluster info: (center_oklab, center_rgb, size, percentage)
    cluster_info = []
    for i in range(len(centers_oklab)):
        if i in unique:
            idx = np.where(unique == i)[0][0]
            size = counts[idx]
            percentage = float((size / total_pixels) * 100)
        else:
            size = 0
            percentage = 0.0

        rgb = oklab_to_rgb(centers_oklab[i : i + 1])[0]
        r = max(0, min(255, int(rgb[0])))
        g = max(0, min(255, int(rgb[1])))
        b = max(0, min(255, int(rgb[2])))
        hex_color = f"#{r:02x}{g:02x}{b:02x}"

        cluster_info.append(
            {
                "oklab": centers_oklab[i],
                "hex": hex_color,
                "size": size,
                "percentage": percentage,
            }
        )

    # Sort by cluster size (descending)
    cluster_info.sort(key=lambda x: x["size"], reverse=True)

    # Greedy selection: pick largest, skip similar colors
    selected: list[ExtractedColor] = []
    selected_oklab: list[NDArray[np.float64]] = []

    for cluster in cluster_info:
        if len(selected) >= num_colors:
            break

        # Check if too similar to already selected colors
        is_similar = False
        for sel_oklab in selected_oklab:
            distance = np.sqrt(np.sum((cluster["oklab"] - sel_oklab) ** 2))
            if distance < similarity_threshold:
                is_similar = True
                break

        if not is_similar:
            selected.append(ExtractedColor(hex=cluster["hex"], percentage=cluster["percentage"]))
            selected_oklab.append(cluster["oklab"])

    return selected


@router.post("/extract", response_model=ColorExtractionResponse)
async def extract_colors(
    settings: Settings = Depends(get_settings_dependency),
    file: UploadFile = File(..., description="Image file to analyze"),
    num_colors: int = Query(default=4, ge=2, le=10, description="Number of colors to extract"),
) -> ColorExtractionResponse:
    """
    Extract dominant colors from an uploaded image using k-means++ algorithm.

    This endpoint analyzes an uploaded image and extracts the most dominant colors
    using k-means++ clustering algorithm for optimal color selection.

    Parameters:
        file: Image file (JPEG, PNG, WebP, etc.)
        num_colors: Number of colors to extract (2-10, default: 4)

    Returns:
        List of extracted colors with hex codes and percentages

    Example:
        POST /api/colors/extract?num_colors=4
        Content-Type: multipart/form-data
        -> {"colors": [{"hex": "#2563eb", "percentage": 35.2}, ...]}
    """
    logger.info("Color extraction endpoint called")
    logger.debug("API version: %s", settings.API_VERSION)

    # Validate file type
    if not file.content_type or not file.content_type.startswith("image/"):
        logger.warning("Invalid file type: %s", file.content_type)
        raise HTTPException(status_code=400, detail="File must be an image")

    try:
        # Read image
        contents = await file.read()
        image = Image.open(BytesIO(contents))

        logger.info(
            "Extracting %d colors from image (%dx%d)", num_colors, image.width, image.height
        )

        # Extract colors
        colors = extract_colors_from_image(image, num_colors)

        return ColorExtractionResponse(colors=colors)

    except HTTPException:
        raise
    except Exception as e:
        logger.error("Color extraction failed: %s", str(e), exc_info=e)
        raise HTTPException(status_code=400, detail="Failed to process image") from e
