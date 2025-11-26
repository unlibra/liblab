"""Application configuration using Pydantic Settings."""

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings."""

    # API Metadata
    API_TITLE: str = '8px.app API'
    API_DESCRIPTION: str = 'Web Development Toolkit API'
    API_VERSION: str = '1.0.0'

    # Environment
    ENVIRONMENT: str = 'production'
    DEBUG: bool = False

    # CORS
    ALLOWED_ORIGINS: str = 'http://localhost:3000'

    # Logging
    LOG_LEVEL: str = 'INFO'

    model_config = SettingsConfigDict(
        env_file='.env',
        env_file_encoding='utf-8',
        case_sensitive=True,
    )

    @property
    def allowed_origins_list(self) -> list[str]:
        """Convert comma-separated origins to list."""
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(',')]

    @property
    def docs_enabled(self) -> bool:
        """Enable API docs only in development."""
        return self.ENVIRONMENT != 'production'


@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
