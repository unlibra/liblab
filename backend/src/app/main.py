"""FastAPI application entry point."""

from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api import colors, health, ping
from app.core.config import get_settings
from app.core.logging import configure_logging, get_logger
from app.middleware.request_id import RequestIDMiddleware
from app.middleware.upload_size import UploadSizeLimitMiddleware

logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    """Application lifespan events."""
    # Startup
    settings = get_settings()
    configure_logging(level=settings.LOG_LEVEL)
    logger.info('Starting %s %s', settings.API_TITLE, settings.API_VERSION)
    logger.info('Environment: %s', settings.ENVIRONMENT)

    yield

    # Shutdown
    logger.info('Shutting down application')


# Initialize FastAPI application
settings = get_settings()

app = FastAPI(
    title=settings.API_TITLE,
    description=settings.API_DESCRIPTION,
    version=settings.API_VERSION,
    lifespan=lifespan,
    docs_url='/docs' if settings.docs_enabled else None,
    redoc_url='/redoc' if settings.docs_enabled else None,
)


# Exception handlers
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(
    request: Request, exc: RequestValidationError
) -> JSONResponse:
    """
    Handle request validation errors.

    Returns a simplified error response with request ID for tracking.
    Logs detailed validation errors for debugging.
    """
    request_id = getattr(request.state, 'request_id', 'unknown')
    logger.warning(
        'Request validation failed: %s',
        exc.errors(),
        extra={'request_id': request_id},
    )

    return JSONResponse(
        status_code=422,
        content={
            'error': 'Validation Error',
            'message': 'Invalid request data',
            'request_id': request_id,
        },
    )


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """
    Handle all unhandled exceptions.

    Returns a generic error response to avoid leaking internal details.
    Logs the full exception with stack trace for debugging.
    """
    request_id = getattr(request.state, 'request_id', 'unknown')
    logger.error(
        'Unhandled exception: %s',
        str(exc),
        exc_info=exc,
        extra={'request_id': request_id},
    )

    return JSONResponse(
        status_code=500,
        content={
            'error': 'Internal Server Error',
            'message': 'An unexpected error occurred',
            'request_id': request_id,
        },
    )


# Add middleware (order matters - first added = outermost layer)
app.add_middleware(RequestIDMiddleware)
app.add_middleware(UploadSizeLimitMiddleware)  # Check upload size before processing
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=False,
    allow_methods=['GET', 'POST'],
    allow_headers=['Content-Type', 'x-vercel-protection-bypass'],
)

# Include routers
app.include_router(health.router, prefix='', tags=['health'])
app.include_router(ping.router, prefix='/api/ping', tags=['ping'])
app.include_router(colors.router, prefix='/api/colors', tags=['colors'])
