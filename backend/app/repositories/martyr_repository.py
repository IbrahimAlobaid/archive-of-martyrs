from __future__ import annotations

from sqlalchemy import extract, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.gallery_image import GalleryImage
from app.models.martyr import Martyr
from app.models.village import Village


class MartyrRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    @staticmethod
    def _filters(
        q: str | None,
        village_slug: str | None,
        year: int | None,
        featured: bool | None,
        include_unpublished: bool,
    ) -> list:
        conditions = []
        if not include_unpublished:
            conditions.append(Martyr.is_published.is_(True))
        if q:
            conditions.append(Martyr.full_name.ilike(f"%{q.strip()}%"))
        if village_slug:
            conditions.append(Village.slug == village_slug)
        if year:
            conditions.append(extract("year", Martyr.martyrdom_date) == year)
        if featured is not None:
            conditions.append(Martyr.is_featured.is_(featured))
        return conditions

    async def list_filtered(
        self,
        *,
        q: str | None,
        village_slug: str | None,
        year: int | None,
        featured: bool | None,
        page: int,
        page_size: int,
        sort: str,
        include_unpublished: bool,
    ) -> list[Martyr]:
        conditions = self._filters(q, village_slug, year, featured, include_unpublished)

        query = (
            select(Martyr)
            .join(Village, Village.id == Martyr.village_id)
            .options(selectinload(Martyr.village), selectinload(Martyr.gallery_images))
            .where(*conditions)
        )

        if sort == "oldest":
            query = query.order_by(Martyr.martyrdom_date.asc(), Martyr.created_at.asc())
        elif sort == "alphabetical":
            query = query.order_by(Martyr.full_name.asc())
        else:
            query = query.order_by(Martyr.martyrdom_date.desc(), Martyr.created_at.desc())

        query = query.offset((page - 1) * page_size).limit(page_size)

        result = await self.session.execute(query)
        return list(result.scalars().unique().all())

    async def count_filtered(
        self,
        *,
        q: str | None,
        village_slug: str | None,
        year: int | None,
        featured: bool | None,
        include_unpublished: bool,
    ) -> int:
        conditions = self._filters(q, village_slug, year, featured, include_unpublished)
        query = select(func.count(Martyr.id)).select_from(Martyr).join(Village).where(*conditions)
        result = await self.session.execute(query)
        return int(result.scalar_one())

    async def get_by_slug(self, slug: str, include_unpublished: bool = False) -> Martyr | None:
        query = (
            select(Martyr)
            .options(selectinload(Martyr.village), selectinload(Martyr.gallery_images))
            .where(Martyr.slug == slug)
        )
        if not include_unpublished:
            query = query.where(Martyr.is_published.is_(True))
        result = await self.session.execute(query)
        return result.scalar_one_or_none()

    async def get_by_id(self, martyr_id: int) -> Martyr | None:
        query = (
            select(Martyr)
            .options(selectinload(Martyr.village), selectinload(Martyr.gallery_images))
            .where(Martyr.id == martyr_id)
        )
        result = await self.session.execute(query)
        return result.scalar_one_or_none()

    async def list_slugs_like(self, base_slug: str) -> list[str]:
        query = select(Martyr.slug).where(Martyr.slug.like(f"{base_slug}%"))
        result = await self.session.execute(query)
        return list(result.scalars().all())

    async def save(self, martyr: Martyr) -> Martyr:
        self.session.add(martyr)
        await self.session.commit()
        await self.session.refresh(martyr)
        return martyr

    async def delete(self, martyr: Martyr) -> None:
        await self.session.delete(martyr)
        await self.session.commit()

    async def list_related(self, village_id: int, exclude_martyr_id: int, limit: int = 4) -> list[Martyr]:
        query = (
            select(Martyr)
            .options(selectinload(Martyr.village))
            .where(
                Martyr.village_id == village_id,
                Martyr.id != exclude_martyr_id,
                Martyr.is_published.is_(True),
            )
            .order_by(Martyr.martyrdom_date.desc())
            .limit(limit)
        )
        result = await self.session.execute(query)
        return list(result.scalars().all())

    async def get_gallery_image(self, martyr_id: int, image_id: int) -> GalleryImage | None:
        query = select(GalleryImage).where(
            GalleryImage.id == image_id,
            GalleryImage.martyr_id == martyr_id,
        )
        result = await self.session.execute(query)
        return result.scalar_one_or_none()

    async def get_next_gallery_sort_order(self, martyr_id: int) -> int:
        query = select(func.max(GalleryImage.sort_order)).where(GalleryImage.martyr_id == martyr_id)
        result = await self.session.execute(query)
        max_order = result.scalar_one()
        if max_order is None:
            return 0
        return int(max_order) + 1

    async def add_gallery_image(self, image: GalleryImage) -> GalleryImage:
        self.session.add(image)
        await self.session.commit()
        await self.session.refresh(image)
        return image

    async def delete_gallery_image(self, image: GalleryImage) -> None:
        await self.session.delete(image)
        await self.session.commit()

    async def count_published(self) -> int:
        query = select(func.count(Martyr.id)).where(Martyr.is_published.is_(True))
        result = await self.session.execute(query)
        return int(result.scalar_one())

    async def count_villages_represented(self) -> int:
        query = select(func.count(func.distinct(Martyr.village_id))).where(Martyr.is_published.is_(True))
        result = await self.session.execute(query)
        return int(result.scalar_one())

    async def latest_published(self) -> Martyr | None:
        query = select(Martyr).where(Martyr.is_published.is_(True)).order_by(Martyr.created_at.desc()).limit(1)
        result = await self.session.execute(query)
        return result.scalar_one_or_none()
