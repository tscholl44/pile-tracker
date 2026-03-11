from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Supabase (optional defaults for development)
    supabase_url: str = ""
    supabase_service_key: str = ""

    # CORS
    frontend_url: str = "http://localhost:3000"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

    @property
    def is_supabase_configured(self) -> bool:
        """Check if Supabase credentials are configured."""
        return bool(self.supabase_url and self.supabase_service_key)


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
