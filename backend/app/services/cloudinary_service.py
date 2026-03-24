from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from uuid import uuid4

import cloudinary
import cloudinary.uploader
from fastapi import HTTPException, UploadFile, status

from app.core.config import get_settings


@dataclass
class UploadedAsset:
    secure_url: str
    public_id: str


class CloudinaryService:
    def __init__(self) -> None:
        self.settings = get_settings()
        self.enabled = bool(
            self.settings.CLOUDINARY_CLOUD_NAME
            and self.settings.CLOUDINARY_API_KEY
            and self.settings.CLOUDINARY_API_SECRET
        )

        environment = self.settings.APP_ENV.lower().strip()
        is_deployed_environment = environment in {"production", "prod", "staging"}
        self.allow_local_fallback = self.settings.ALLOW_LOCAL_MEDIA_FALLBACK and not is_deployed_environment
        self.local_media_root = Path(self.settings.LOCAL_MEDIA_DIR)

        if self.enabled:
            cloudinary.config(
                cloud_name=self.settings.CLOUDINARY_CLOUD_NAME,
                api_key=self.settings.CLOUDINARY_API_KEY,
                api_secret=self.settings.CLOUDINARY_API_SECRET,
                secure=True,
            )
        elif self.allow_local_fallback:
            self.local_media_root.mkdir(parents=True, exist_ok=True)

    @staticmethod
    def _extension_from_upload(file: UploadFile) -> str:
        content_type = file.content_type or ""
        if content_type in {"image/jpeg", "image/jpg"}:
            return ".jpg"
        if content_type == "image/png":
            return ".png"
        if content_type == "image/webp":
            return ".webp"
        return ".jpg"

    def _local_upload(self, file: UploadFile, folder: str) -> UploadedAsset:
        extension = self._extension_from_upload(file)
        filename = f"{uuid4().hex}{extension}"
        public_id = f"local/{folder}/{filename}"
        file_path = self.local_media_root / public_id
        file_path.parent.mkdir(parents=True, exist_ok=True)

        try:
            with file_path.open("wb") as destination:
                destination.write(file.file.read())
            file.file.seek(0)
        except OSError as exc:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to store image locally",
            ) from exc

        media_base = self.settings.MEDIA_BASE_URL.rstrip("/")
        secure_url = f"{media_base}/media/{public_id}"
        return UploadedAsset(secure_url=secure_url, public_id=public_id)

    def upload_image(self, file: UploadFile, folder: str) -> UploadedAsset:
        if not self.enabled:
            if self.allow_local_fallback:
                return self._local_upload(file, folder)
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Cloudinary is required in this environment",
            )

        try:
            result = cloudinary.uploader.upload(
                file.file,
                folder=f"{self.settings.CLOUDINARY_FOLDER}/{folder}",
                resource_type="image",
                transformation=[{"quality": "auto", "fetch_format": "auto"}],
            )
        except Exception as exc:  # pragma: no cover - third-party boundary
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Failed to upload image",
            ) from exc

        secure_url = result.get("secure_url")
        public_id = result.get("public_id")

        if not secure_url or not public_id:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Cloudinary returned invalid upload payload",
            )

        return UploadedAsset(secure_url=secure_url, public_id=public_id)

    def delete_image(self, public_id: str | None) -> None:
        if not public_id:
            return

        if public_id.startswith("local/"):
            local_path = self.local_media_root / public_id
            try:
                local_path.unlink(missing_ok=True)
            except OSError:
                return
            return

        if not self.enabled:
            return

        try:
            cloudinary.uploader.destroy(public_id, resource_type="image")
        except Exception:
            return
