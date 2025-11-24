"""Rate limiting middleware using Upstash Redis."""

import time
import uuid
from collections.abc import Awaitable, Callable
from typing import Any

from fastapi import Request, Response, status
from fastapi.responses import JSONResponse
from starlette.concurrency import run_in_threadpool
from starlette.middleware.base import BaseHTTPMiddleware
from upstash_redis import Redis

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
            redis_url = settings.UPSTASH_REDIS_REST_URL
            redis_token = settings.UPSTASH_REDIS_REST_TOKEN

            if redis_url and redis_token:
                # Upstash Redis REST API client (non-blocking HTTP-based)
                self.redis = Redis(url=redis_url, token=redis_token)
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

        # Check rate limit (run in threadpool to avoid blocking event loop)
        allowed, retry_after = await self._check_rate_limit(
            client_ip, request.url.path, limit, window
        )

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

        When TRUST_PROXY_HEADERS=True (behind trusted proxy):
        - Use X-Real-IP if available (set by Nginx, Vercel, etc.)
        - Otherwise use leftmost IP from X-Forwarded-For
          (trusted proxies like Vercel/Cloudflare sanitize this header)

        When TRUST_PROXY_HEADERS=False (direct connection):
        - Use direct client connection only
        """
        settings = get_settings()

        if settings.TRUST_PROXY_HEADERS:
            # X-Real-IP: Standard header set by reverse proxies
            real_ip = request.headers.get("X-Real-IP")
            if real_ip:
                return real_ip.strip()

            # X-Forwarded-For: Leftmost IP is the client
            # (trusted proxies sanitize/overwrite client-provided values)
            forwarded_for = request.headers.get("X-Forwarded-For")
            if forwarded_for:
                return forwarded_for.split(",")[0].strip()

        # Direct connection (no proxy trusted)
        return request.client.host if request.client else "unknown"

    async def _check_rate_limit(
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
            # Run Redis operations in threadpool to avoid blocking event loop
            return await run_in_threadpool(
                self._check_rate_limit_sync, client_ip, path, limit, window
            )
        except Exception as e:
            # Log error but allow request through (fail open)
            logger.error("Rate limit check failed: %s", str(e), exc_info=e)
            return True, 0

    def _check_rate_limit_sync(
        self, client_ip: str, path: str, limit: int, window: int
    ) -> tuple[bool, int]:
        """Synchronous rate limit check (runs in threadpool)."""
        if self.redis is None:
            return True, 0

        try:
            current_time = int(time.time())
            window_start = current_time - window

            # Create unique key for this client + path
            key = f"ratelimit:{client_ip}:{path}"

            # Lua script for atomic rate limit check
            # Returns: {allowed (0/1), retry_after, oldest_timestamp}
            lua_script = """
            local key = KEYS[1]
            local current_time = tonumber(ARGV[1])
            local window_start = tonumber(ARGV[2])
            local limit = tonumber(ARGV[3])
            local window = tonumber(ARGV[4])
            local member = ARGV[5]

            -- Remove old entries outside the window
            redis.call('ZREMRANGEBYSCORE', key, 0, window_start)

            -- Count requests in current window
            local request_count = redis.call('ZCARD', key)

            if request_count >= limit then
                -- Get oldest request timestamp to calculate retry time
                local oldest = redis.call('ZRANGE', key, 0, 0, 'WITHSCORES')
                if #oldest > 0 then
                    return {0, oldest[2]}
                end
                return {0, -1}
            end

            -- Add current request with unique member (timestamp:uuid)
            redis.call('ZADD', key, current_time, member)

            -- Set expiry on the key (cleanup)
            redis.call('EXPIRE', key, window)

            return {1, 0}
            """

            # Generate unique member to avoid collisions in same second
            unique_member = f"{current_time}:{uuid.uuid4()}"

            # Execute Lua script atomically
            result: Any = self.redis.eval(
                lua_script,
                keys=[key],
                args=[
                    str(current_time),
                    str(window_start),
                    str(limit),
                    str(window),
                    unique_member,
                ],
            )

            allowed = bool(result[0])
            if not allowed:
                oldest_timestamp = result[1]
                if oldest_timestamp != -1:
                    retry_after = max(1, int(oldest_timestamp) + window - current_time)
                else:
                    retry_after = window
                return False, retry_after

            return True, 0

        except Exception as e:
            # Log error but allow request through (fail open)
            logger.error("Rate limit check failed: %s", str(e), exc_info=e)
            return True, 0
