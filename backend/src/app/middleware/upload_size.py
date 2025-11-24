"""Upload file size limiting middleware."""

from collections.abc import Awaitable, Callable
from typing import Any

from fastapi import Request, Response, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

from app.core.logging import get_logger

logger = get_logger(__name__)

# Maximum upload size: 10MB (matches frontend and API endpoint limits)
MAX_UPLOAD_SIZE = 10 * 1024 * 1024  # 10MB in bytes


class UploadSizeLimitMiddleware(BaseHTTPMiddleware):
    """
    Middleware to limit upload file size globally.

    Checks Content-Length header before processing request body.
    Prevents memory exhaustion from oversized uploads.
    """

    def __init__(self, app: Any, max_size: int = MAX_UPLOAD_SIZE) -> None:
        """
        Initialize upload size limit middleware.

        Args:
            app: The ASGI application
            max_size: Maximum upload size in bytes
        """
        super().__init__(app)
        self.max_size = max_size

    async def dispatch(
        self, request: Request, call_next: Callable[[Request], Awaitable[Response]]
    ) -> Response:
        """Process request and check upload size."""
        # Only check POST/PUT/PATCH requests (uploads)
        if request.method in ("POST", "PUT", "PATCH"):
            # Content-Length is required for upload size validation
            content_length = request.headers.get("Content-Length")

            if not content_length:
                logger.warning(
                    "Upload rejected: Content-Length header is missing"
                )
                return JSONResponse(
                    status_code=status.HTTP_411_LENGTH_REQUIRED,
                    content={
                        "error": "Length Required",
                        "message": "Content-Length header is required for uploads",
                    },
                )

            # Validate Content-Length value and check size limit
            try:
                size = int(content_length)
                if size > self.max_size:
                    max_mb = self.max_size / (1024 * 1024)
                    logger.warning(
                        "Upload size exceeded: %d bytes (limit: %d bytes)",
                        size,
                        self.max_size,
                    )
                    return JSONResponse(
                        status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                        content={
                            "error": "Request Entity Too Large",
                            "message": f"Upload size must be less than {max_mb:.0f}MB",
                        },
                    )
            except ValueError:
                logger.warning(
                    "Upload rejected: Invalid Content-Length header value: %s",
                    content_length,
                )
                return JSONResponse(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    content={
                        "error": "Bad Request",
                        "message": "Invalid Content-Length header",
                    },
                )

        return await call_next(request)
