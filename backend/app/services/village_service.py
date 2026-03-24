from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.village import Village
from app.repositories.village_repository import VillageRepository
from app.schemas.village import VillageCreate
from app.utils.slug import build_unique_slug, slugify


class VillageService:
    def __init__(self, session: AsyncSession) -> None:
        self.repo = VillageRepository(session)

    async def list_villages(self) -> list[Village]:
        return await self.repo.list_all()

    async def create_village(self, payload: VillageCreate) -> Village:
        base_slug = slugify(payload.name_en or payload.name_ar)
        existing_slugs = set(await self.repo.list_slugs_like(base_slug))
        slug = build_unique_slug(base_slug, existing_slugs)

        village = Village(name_ar=payload.name_ar.strip(), name_en=payload.name_en, slug=slug)
        try:
            return await self.repo.create(village)
        except Exception as exc:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Unable to create village",
            ) from exc
