"""File validation utilities for image files."""

SUPPORTED_FORMATS = ["PNG", "JPEG", "GIF", "WebP", "AVIF", "HEIF", "HEIC", "TIFF", "BMP"]


def validate_image_magic_number(data: bytes) -> str | None:
    """
    Validate that the file is a real image by checking magic numbers.
    Returns:
        None if valid, otherwise an error message.
    """

    if len(data) < 2:
        return "File is too small to be a valid image"

    # PNG ---------------------------------------------------
    if len(data) >= 8 and data[:8] == b"\x89PNG\r\n\x1a\n":
        return None

    # JPEG (SOI = FF D8) -------------------------------------
    if data.startswith(b"\xff\xd8"):
        return None

    # GIF ----------------------------------------------------
    if len(data) >= 4 and data[:4] == b"GIF8":
        return None

    # WebP (RIFF....WEBP) ------------------------------------
    if len(data) >= 12 and data[:4] == b"RIFF" and data[8:12] == b"WEBP":
        return None

    # AVIF / HEIF / HEIC (ISOBMFF) ---------------------------
    if len(data) >= 12 and data[4:8] == b"ftyp":
        brand = data[8:12]

        # AVIF
        if brand == b"avif":
            return None

        # HEIF / HEIC variants (including HEVC-branded)
        heif_brands = {b"heif", b"heic", b"heix", b"hevc", b"hevx", b"heim", b"heis"}
        if brand in heif_brands:
            return None

        # HEIF Image Sequence (general brands)
        if brand in {b"mif1", b"msf1"}:
            return None

    # TIFF ---------------------------------------------------
    if len(data) >= 4:
        if data[:4] == b"II*\x00":  # Little-endian
            return None
        if data[:4] == b"MM\x00*":  # Big-endian
            return None

    # BMP ----------------------------------------------------
    if len(data) >= 2 and data[:2] == b"BM":
        return None

    # ----------------------------------------------------------
    supported = ", ".join(SUPPORTED_FORMATS)
    return f"File is not a valid image format (expected one of: {supported})"
