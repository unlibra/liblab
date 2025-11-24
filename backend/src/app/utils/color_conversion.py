"""Color space conversion utilities."""

import numpy as np
from numpy.typing import NDArray


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
