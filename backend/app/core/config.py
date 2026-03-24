from __future__ import annotations

from functools import lru_cache
from typing import Annotated
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

from pydantic import field_validator
from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    PROJECT_NAME: str = "Martyrs Archive API"
    API_V1_PREFIX: str = "/api/v1"
    APP_ENV: str = "development"

    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/martyrs_archive"

    JWT_SECRET_KEY: str = "change-me"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 120

    CORS_ORIGINS: Annotated[list[str], NoDecode] = ["http://localhost:3000"]

    CLOUDINARY_CLOUD_NAME: str | None = None
    CLOUDINARY_API_KEY: str | None = None
    CLOUDINARY_API_SECRET: str | None = None
    CLOUDINARY_FOLDER: str = "martyrs-archive"
    ALLOW_LOCAL_MEDIA_FALLBACK: bool = True
    MEDIA_BASE_URL: str = "http://localhost:8000"
    LOCAL_MEDIA_DIR: str = "media"

    MAX_IMAGE_SIZE_MB: int = 5

    ADMIN_USERNAME: str = "admin"
    ADMIN_PASSWORD: str = "admin12345"

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, value: str | list[str]) -> list[str]:
        if isinstance(value, str):
            return [item.strip() for item in value.split(",") if item.strip()]
        return value

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def normalize_database_url(cls, value: str) -> str:
        raw_value = value.strip()

        if raw_value.startswith("postgres://"):
            raw_value = raw_value.replace("postgres://", "postgresql://", 1)

        if raw_value.startswith("postgresql://"):
            raw_value = raw_value.replace("postgresql://", "postgresql+asyncpg://", 1)

        if raw_value.startswith("postgresql+psycopg://"):
            raw_value = raw_value.replace("postgresql+psycopg://", "postgresql+asyncpg://", 1)

        if raw_value.startswith("postgresql+psycopg2://"):
            raw_value = raw_value.replace("postgresql+psycopg2://", "postgresql+asyncpg://", 1)

        if not raw_value.startswith("postgresql+asyncpg://"):
            return raw_value

        parsed_url = urlsplit(raw_value)
        hostname = (parsed_url.hostname or "").lower()

        if "neon.tech" not in hostname:
            return raw_value

        query = dict(parse_qsl(parsed_url.query, keep_blank_values=True))
        if "ssl" in query or "sslmode" in query:
            return raw_value

        query["sslmode"] = "require"
        return urlunsplit(
            (
                parsed_url.scheme,
                parsed_url.netloc,
                parsed_url.path,
                urlencode(query),
                parsed_url.fragment,
            )
        )


@lru_cache
def get_settings() -> Settings:
    return Settings()
