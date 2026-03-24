from __future__ import annotations

from fastapi import HTTPException, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.models.gallery_image import GalleryImage
from app.models.martyr import Martyr
from app.repositories.martyr_repository import MartyrRepository
from app.repositories.village_repository import VillageRepository
from app.schemas.martyr import MartyrCreate, MartyrUpdate
from app.services.cloudinary_service import CloudinaryService
from app.utils.image_validation import validate_image_file
from app.utils.slug import build_unique_slug, slugify


class MartyrService:
    def __init__(self, session: AsyncSession) -> None:
        self.settings = get_settings()
        self.repo = MartyrRepository(session)
        self.village_repo = VillageRepository(session)
        self.cloudinary = CloudinaryService()

    async def list_martyrs(
        self,
        *,
        q: str | None,
        village: str | None,
        year: int | None,
        featured: bool | None,
        page: int,
        page_size: int,
        sort: str,
        include_unpublished: bool,
    ) -> tuple[list[Martyr], int]:
        items = await self.repo.list_filtered(
            q=q,
            village_slug=village,
            year=year,
            featured=featured,
            page=page,
            page_size=page_size,
            sort=sort,
            include_unpublished=include_unpublished,
        )
        total = await self.repo.count_filtered(
            q=q,
            village_slug=village,
            year=year,
            featured=featured,
            include_unpublished=include_unpublished,
        )
        return items, total

    async def get_martyr_by_slug(self, slug: str, include_unpublished: bool = False) -> Martyr:
        martyr = await self.repo.get_by_slug(slug, include_unpublished=include_unpublished)
        if not martyr:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Martyr not found")
        return martyr

    async def get_martyr_by_id(self, martyr_id: int) -> Martyr:
        martyr = await self.repo.get_by_id(martyr_id)
        if not martyr:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Martyr not found")
        return martyr

    async def create_martyr(self, payload: MartyrCreate, main_image: UploadFile | None = None) -> Martyr:
        village = await self.village_repo.get_by_id(payload.village_id)
        if not village:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Village does not exist")

        base_slug = slugify(payload.full_name)
        existing_slugs = set(await self.repo.list_slugs_like(base_slug))
        slug = build_unique_slug(base_slug, existing_slugs)

        main_image_url = None
        main_image_public_id = None
        if main_image:
            await validate_image_file(main_image, self.settings.MAX_IMAGE_SIZE_MB)
            uploaded = self.cloudinary.upload_image(main_image, "main")
            main_image_url = uploaded.secure_url
            main_image_public_id = uploaded.public_id

        martyr = Martyr(
            full_name=payload.full_name.strip(),
            slug=slug,
            village_id=payload.village_id,
            birth_date=payload.birth_date,
            martyrdom_date=payload.martyrdom_date,
            age=payload.age,
            short_bio=payload.short_bio,
            full_story=payload.full_story,
            is_published=payload.is_published,
            is_featured=payload.is_featured,
            main_image_url=main_image_url,
            main_image_public_id=main_image_public_id,
        )
        created = await self.repo.save(martyr)
        return await self.get_martyr_by_id(created.id)

    async def update_martyr(
        self,
        martyr_id: int,
        payload: MartyrUpdate,
        main_image: UploadFile | None = None,
    ) -> Martyr:
        martyr = await self.get_martyr_by_id(martyr_id)

        if payload.village_id is not None:
            village = await self.village_repo.get_by_id(payload.village_id)
            if not village:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Village does not exist")
            martyr.village_id = payload.village_id

        if payload.full_name is not None and payload.full_name.strip() != martyr.full_name:
            base_slug = slugify(payload.full_name)
            existing = set(await self.repo.list_slugs_like(base_slug))
            existing.discard(martyr.slug)
            martyr.slug = build_unique_slug(base_slug, existing)
            martyr.full_name = payload.full_name.strip()

        if payload.birth_date is not None:
            martyr.birth_date = payload.birth_date
        if payload.martyrdom_date is not None:
            martyr.martyrdom_date = payload.martyrdom_date
        if payload.age is not None:
            martyr.age = payload.age
        if payload.short_bio is not None:
            martyr.short_bio = payload.short_bio
        if payload.full_story is not None:
            martyr.full_story = payload.full_story
        if payload.is_published is not None:
            martyr.is_published = payload.is_published
        if payload.is_featured is not None:
            martyr.is_featured = payload.is_featured

        if main_image:
            await validate_image_file(main_image, self.settings.MAX_IMAGE_SIZE_MB)
            uploaded = self.cloudinary.upload_image(main_image, "main")
            self.cloudinary.delete_image(martyr.main_image_public_id)
            martyr.main_image_url = uploaded.secure_url
            martyr.main_image_public_id = uploaded.public_id

        updated = await self.repo.save(martyr)
        return await self.get_martyr_by_id(updated.id)

    async def delete_martyr(self, martyr_id: int) -> None:
        martyr = await self.get_martyr_by_id(martyr_id)
        self.cloudinary.delete_image(martyr.main_image_public_id)
        for gallery in martyr.gallery_images:
            self.cloudinary.delete_image(gallery.public_id)
        await self.repo.delete(martyr)

    async def add_gallery_image(
        self,
        martyr_id: int,
        file: UploadFile,
        alt_text: str | None = None,
        sort_order: int | None = None,
    ) -> GalleryImage:
        martyr = await self.get_martyr_by_id(martyr_id)
        await validate_image_file(file, self.settings.MAX_IMAGE_SIZE_MB)
        uploaded = self.cloudinary.upload_image(file, "gallery")

        if sort_order is None:
            sort_order = await self.repo.get_next_gallery_sort_order(martyr.id)

        image = GalleryImage(
            martyr_id=martyr.id,
            image_url=uploaded.secure_url,
            public_id=uploaded.public_id,
            alt_text=alt_text,
            sort_order=sort_order,
        )
        return await self.repo.add_gallery_image(image)

    async def delete_gallery_image(self, martyr_id: int, image_id: int) -> None:
        image = await self.repo.get_gallery_image(martyr_id, image_id)
        if not image:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Gallery image not found")
        self.cloudinary.delete_image(image.public_id)
        await self.repo.delete_gallery_image(image)

    async def list_related(self, martyr: Martyr) -> list[Martyr]:
        return await self.repo.list_related(village_id=martyr.village_id, exclude_martyr_id=martyr.id)

    async def get_stats(self) -> dict:
        total = await self.repo.count_published()
        villages = await self.repo.count_villages_represented()
        latest = await self.repo.latest_published()
        return {
            "total_martyrs": total,
            "villages_represented": villages,
            "latest_added_name": latest.full_name if latest else None,
            "latest_added_date": latest.created_at.date() if latest else None,
        }
