from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.village import Village


class VillageRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def list_all(self) -> list[Village]:
        query = select(Village).order_by(Village.name_ar.asc())
        result = await self.session.execute(query)
        return list(result.scalars().all())

    async def get_by_slug(self, slug: str) -> Village | None:
        query = select(Village).where(Village.slug == slug)
        result = await self.session.execute(query)
        return result.scalar_one_or_none()

    async def get_by_id(self, village_id: int) -> Village | None:
        query = select(Village).where(Village.id == village_id)
        result = await self.session.execute(query)
        return result.scalar_one_or_none()

    async def list_slugs_like(self, base_slug: str) -> list[str]:
        query = select(Village.slug).where(Village.slug.like(f"{base_slug}%"))
        result = await self.session.execute(query)
        return list(result.scalars().all())

    async def create(self, village: Village) -> Village:
        self.session.add(village)
        await self.session.commit()
        await self.session.refresh(village)
        return village
