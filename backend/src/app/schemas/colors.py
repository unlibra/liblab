from pydantic import BaseModel, Field


class ExtractedColor(BaseModel):
    """A single extracted color."""

    hex: str = Field(..., description='Hex color code')
    percentage: float = Field(..., description='Percentage of image pixels')


class ColorExtractionResponse(BaseModel):
    """Color extraction result."""

    colors: list[ExtractedColor]
