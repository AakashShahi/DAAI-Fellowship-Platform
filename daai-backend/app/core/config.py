from functools import lru_cache
from typing import Any

from pydantic import AliasChoices, Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_NAME: str = "DAAI Fellowship Platform"
    APP_ENV: str = "development"
    DEBUG: bool = False

    HOST: str = "127.0.0.1"
    PORT: int = 8000
    
    FRONTEND_URL: str = "http://localhost:5173"

    MONGODB_URL: str = Field(
        default="mongodb://localhost:27017",
        validation_alias=AliasChoices("MONGODB_URL", "MONGO_URI"),
    )
    DATABASE_NAME: str = "daai_fellowship"
    MONGODB_SERVER_SELECTION_TIMEOUT_MS: int = 5000

    JWT_SECRET: str = "change-me"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    SMTP_HOST: str | None = None
    SMTP_PORT: int = 587
    SMTP_USERNAME: str | None = None
    SMTP_PASSWORD: str | None = None
    SMTP_FROM_EMAIL: str = "no-reply@daai-fellowship.local"
    SMTP_FROM_NAME: str = "DAAI Fellowship"
    SMTP_USE_TLS: bool = True

    @field_validator("DEBUG", mode="before")
    @classmethod
    def parse_debug(cls, value: Any) -> bool:
        if isinstance(value, bool):
            return value

        if isinstance(value, str):
            normalized_value = value.strip().lower()
            if normalized_value in {"1", "true", "yes", "on", "debug", "development"}:
                return True
            if normalized_value in {"0", "false", "no", "off", "release", "production"}:
                return False

        return bool(value)

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
