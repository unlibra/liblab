"""Logging utilities with request ID support."""

import logging
from collections.abc import Sequence
from contextvars import ContextVar
from typing import Any

# Context variable to store request ID across async context
request_id_var: ContextVar[str | None] = ContextVar('request_id', default=None)


def _has_request_id_filter(filters: Sequence[Any]) -> bool:
    """Check if RequestIDFilter is already attached."""
    return any(isinstance(f, RequestIDFilter) for f in filters)


class RequestIDFilter(logging.Filter):
    """
    Logging filter that adds request_id to log records.

    This allows all logs within a request context to include the request ID,
    making it easy to trace all logs related to a specific request.
    """

    def filter(self, record: logging.LogRecord) -> bool:
        """Add request_id to log record."""
        record.request_id = request_id_var.get() or 'no-request-id'
        return True


def get_logger(name: str) -> logging.Logger:
    """
    Get a logger with request ID support.

    Args:
        name: Logger name (typically __name__)

    Returns:
        Logger instance with request ID filter
    """
    logger = logging.getLogger(name)

    # Add request ID filter if not already added
    if not _has_request_id_filter(logger.filters):
        logger.addFilter(RequestIDFilter())

    return logger


def set_request_id(request_id: str) -> None:
    """
    Set request ID for current context.

    Args:
        request_id: Unique request identifier
    """
    request_id_var.set(request_id)


def get_request_id() -> str | None:
    """
    Get request ID from current context.

    Returns:
        Request ID or None if not set
    """
    return request_id_var.get()


def configure_logging(level: str = 'INFO') -> None:
    """
    Configure application-wide logging with request ID support.

    Args:
        level: Log level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
    """
    logging.basicConfig(
        level=level,
        format='%(asctime)s - %(name)s - %(levelname)s - [%(request_id)s] - %(message)s',
        force=True,
    )

    # Ensure root logger and its handlers add request_id to all records, including
    # third-party loggers that don't use get_logger()
    root_logger = logging.getLogger()
    if not _has_request_id_filter(root_logger.filters):
        root_logger.addFilter(RequestIDFilter())

    for handler in root_logger.handlers:
        if not _has_request_id_filter(handler.filters):
            handler.addFilter(RequestIDFilter())
