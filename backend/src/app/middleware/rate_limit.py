"""Rate limiting middleware using Upstash Redis."""

import time
from collections.abc import Awaitable, Callable
from typing import Any

from fastapi import Request, Response, status
from fastapi.responses import JSONResponse
from redis import Redis
from starlette.middleware.base import BaseHTTPMiddleware

from app.core.config import get_settings
from app.core.logging import get_logger

logger = get_logger(__name__)


class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    Rate limiting middleware using sliding window algorithm with Redis.

    Excludes health check and documentation endpoints.
    Applies different limits based on endpoint:
    - /api/colors/extract: 10 requests/minute (heavy image processing)
    - Other API endpoints: 60 requests/minute
    """

    def __init__(self, app: Any, redis_client: Redis | None = None) -> None:
        """
        Initialize rate limit middleware.

        Args:
            app: The ASGI application
            redis_client: Optional Redis client (for testing)
        """
        super().__init__(app)
        settings = get_settings()

        # Disable rate limiting in development environment
        if settings.ENVIRONMENT == "development":
            self.redis = None
            logger.info("Rate limiting disabled in development environment")
        # Initialize Redis client for production
        elif redis_client is not None:
            self.redis = redis_client
        else:
            redis_url = getattr(settings, "UPSTASH_REDIS_REST_URL", None)
            redis_token = getattr(settings, "UPSTASH_REDIS_REST_TOKEN", None)

            if redis_url and redis_token:
                # Upstash Redis with HTTP-based connection
                self.redis = Redis.from_url(
                    redis_url,
                    password=redis_token,
                    decode_responses=True,
                    socket_connect_timeout=5,
                    socket_timeout=5,
                )
                logger.info("Rate limiting enabled with Upstash Redis")
            else:
                self.redis = None
                logger.warning(
                    "Rate limiting disabled: UPSTASH_REDIS_REST_URL or "
                    "UPSTASH_REDIS_REST_TOKEN not configured"
                )

        # Paths that should bypass rate limiting
        self.excluded_paths = {"/", "/docs", "/redoc", "/openapi.json"}

    async def dispatch(
        self, request: Request, call_next: Callable[[Request], Awaitable[Response]]
    ) -> Response:
        """Process request and apply rate limiting."""
        # Skip rate limiting if Redis is not configured
        if self.redis is None:
            return await call_next(request)

        # Skip rate limiting for excluded paths
        if request.url.path in self.excluded_paths:
            return await call_next(request)

        # Get client IP address
        client_ip = self._get_client_ip(request)

        # Determine rate limit based on endpoint
        if request.url.path == "/api/colors/extract":
            limit = 10  # 10 requests per minute for heavy endpoint
            window = 60  # 60 seconds
        else:
            limit = 60  # 60 requests per minute for other endpoints
            window = 60  # 60 seconds

        # Check rate limit
        allowed, retry_after = self._check_rate_limit(client_ip, request.url.path, limit, window)

        if not allowed:
            logger.warning(
                "Rate limit exceeded for %s on %s", client_ip, request.url.path
            )
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={
                    "error": "Too Many Requests",
                    "message": f"Rate limit exceeded. Please try again in {retry_after} seconds.",
                },
                headers={"Retry-After": str(retry_after)},
            )

        return await call_next(request)

    def _get_client_ip(self, request: Request) -> str:
        """
        Extract client IP address from request.

        Checks X-Forwarded-For header first (Vercel proxy), falls back to client host.
        """
        forwarded_for = request.headers.get("X-Forwarded-For")
        if forwarded_for:
            # X-Forwarded-For can contain multiple IPs, take the first one
            return forwarded_for.split(",")[0].strip()
        return request.client.host if request.client else "unknown"

    def _check_rate_limit(
        self, client_ip: str, path: str, limit: int, window: int
    ) -> tuple[bool, int]:
        """
        Check if request is within rate limit using sliding window algorithm.

        Args:
            client_ip: Client IP address
            path: Request path
            limit: Maximum requests allowed
            window: Time window in seconds

        Returns:
            Tuple of (allowed, retry_after_seconds)
        """
        if self.redis is None:
            return True, 0

        try:
            current_time = int(time.time())
            window_start = current_time - window

            # Create unique key for this client + path
            key = f"ratelimit:{client_ip}:{path}"

            # Remove old entries outside the window
            self.redis.zremrangebyscore(key, 0, window_start)

            # Count requests in current window
            request_count: int = self.redis.zcard(key)  # type: ignore[assignment]

            if request_count >= limit:
                # Get oldest request timestamp to calculate retry time
                oldest: Any = self.redis.zrange(key, 0, 0, withscores=True)
                if oldest:
                    oldest_timestamp = int(oldest[0][1])
                    retry_after = max(1, oldest_timestamp + window - current_time)
                    return False, retry_after
                return False, window

            # Add current request
            self.redis.zadd(key, {str(current_time): current_time})

            # Set expiry on the key (cleanup)
            self.redis.expire(key, window)

            return True, 0

        except Exception as e:
            # Log error but allow request through (fail open)
            logger.error("Rate limit check failed: %s", str(e), exc_info=e)
            return True, 0
