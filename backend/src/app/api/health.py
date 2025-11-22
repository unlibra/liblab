"""Health check endpoint.

No authentication required - used by load balancers and monitoring systems.
"""

from datetime import datetime, timezone

from fastapi import APIRouter, Depends

from app.core.config import Settings
from app.core.logging import get_logger
from app.dependencies import get_settings_dependency
from app.schemas.health import HealthResponse

router = APIRouter()
logger = get_logger(__name__)


@router.get('/', response_model=HealthResponse)
async def health_check(
    settings: Settings = Depends(get_settings_dependency),
) -> HealthResponse:
    """
    Health check endpoint.

    Returns basic service status and metadata. This endpoint does not
    require authentication and should be used by monitoring systems
    to verify the API is operational.
    """
    logger.debug('Health check called')

    return HealthResponse(
        status='healthy',
        timestamp=datetime.now(timezone.utc).isoformat(),
        version=settings.API_VERSION,
        environment=settings.ENVIRONMENT,
    )
