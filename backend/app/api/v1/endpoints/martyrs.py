from datetime import date

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile, status
from pydantic import ValidationError
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_admin, get_current_admin_optional
from app.db.session import get_db_session
from app.models.admin_user import AdminUser
from app.schemas.common import PaginatedResponse
from app.schemas.martyr import (
    GalleryImageRead,
    MartyrCreate,
    MartyrListItem,
    MartyrRead,
    MartyrSort,
    MartyrStats,
    MartyrUpdate,
)
from app.services.martyr_service import MartyrService
from app.utils.pagination import total_pages

router = APIRouter()


def normalize_optional_text(value: str | None) -> str | None:
    if value is None:
        return None
    stripped = value.strip()
    return stripped or None


@router.get("/stats", response_model=MartyrStats)
async def get_stats(session: AsyncSession = Depends(get_db_session)) -> MartyrStats:
    service = MartyrService(session)
    return MartyrStats(**await service.get_stats())


@router.get("", response_model=PaginatedResponse[MartyrListItem])
async def list_martyrs(
    q: str | None = Query(default=None),
    village: str | None = Query(default=None),
    year: int | None = Query(default=None, ge=1900, le=2100),
    featured: bool | None = Query(default=None),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=12, ge=1, le=100),
    sort: MartyrSort = Query(default="newest"),
    include_unpublished: bool = Query(default=False),
    admin_user: AdminUser | None = Depends(get_current_admin_optional),
    session: AsyncSession = Depends(get_db_session),
) -> PaginatedResponse[MartyrListItem]:
    if include_unpublished and not admin_user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Admin token required")

    service = MartyrService(session)
    items, total = await service.list_martyrs(
        q=q,
        village=village,
        year=year,
        featured=featured,
        page=page,
        page_size=page_size,
        sort=sort,
        include_unpublished=include_unpublished,
    )

    return PaginatedResponse[MartyrListItem](
        items=[MartyrListItem.model_validate(item) for item in items],
        total=total,
        page=page,
        page_size=page_size,
        pages=total_pages(total, page_size),
    )


@router.get("/by-id/{martyr_id}", response_model=MartyrRead)
async def get_martyr_by_id(
    martyr_id: int,
    _: AdminUser = Depends(get_current_admin),
    session: AsyncSession = Depends(get_db_session),
) -> MartyrRead:
    service = MartyrService(session)
    martyr = await service.get_martyr_by_id(martyr_id)
    return MartyrRead.model_validate(martyr)


@router.get("/{slug}", response_model=MartyrRead)
async def get_martyr(
    slug: str,
    admin_user: AdminUser | None = Depends(get_current_admin_optional),
    session: AsyncSession = Depends(get_db_session),
) -> MartyrRead:
    service = MartyrService(session)
    martyr = await service.get_martyr_by_slug(slug, include_unpublished=bool(admin_user))
    return MartyrRead.model_validate(martyr)


@router.post("", response_model=MartyrRead, status_code=status.HTTP_201_CREATED)
async def create_martyr(
    full_name: str = Form(...),
    village_id: int = Form(...),
    martyrdom_date: date = Form(...),
    birth_date: date | None = Form(default=None),
    age: int | None = Form(default=None),
    short_bio: str | None = Form(default=None),
    full_story: str | None = Form(default=None),
    is_published: bool = Form(default=False),
    is_featured: bool = Form(default=False),
    main_image: UploadFile | None = File(default=None),
    _: AdminUser = Depends(get_current_admin),
    session: AsyncSession = Depends(get_db_session),
) -> MartyrRead:
    try:
        payload = MartyrCreate(
            full_name=full_name,
            village_id=village_id,
            martyrdom_date=martyrdom_date,
            birth_date=birth_date,
            age=age,
            short_bio=normalize_optional_text(short_bio),
            full_story=normalize_optional_text(full_story),
            is_published=is_published,
            is_featured=is_featured,
        )
    except ValidationError as exc:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=exc.errors()) from exc

    service = MartyrService(session)
    martyr = await service.create_martyr(payload, main_image=main_image)
    return MartyrRead.model_validate(martyr)


@router.patch("/{martyr_id}", response_model=MartyrRead)
async def update_martyr(
    martyr_id: int,
    full_name: str | None = Form(default=None),
    village_id: int | None = Form(default=None),
    martyrdom_date: date | None = Form(default=None),
    birth_date: date | None = Form(default=None),
    age: int | None = Form(default=None),
    short_bio: str | None = Form(default=None),
    full_story: str | None = Form(default=None),
    is_published: bool | None = Form(default=None),
    is_featured: bool | None = Form(default=None),
    main_image: UploadFile | None = File(default=None),
    _: AdminUser = Depends(get_current_admin),
    session: AsyncSession = Depends(get_db_session),
) -> MartyrRead:
    try:
        payload = MartyrUpdate(
            full_name=normalize_optional_text(full_name),
            village_id=village_id,
            martyrdom_date=martyrdom_date,
            birth_date=birth_date,
            age=age,
            short_bio=normalize_optional_text(short_bio),
            full_story=normalize_optional_text(full_story),
            is_published=is_published,
            is_featured=is_featured,
        )
    except ValidationError as exc:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=exc.errors()) from exc

    service = MartyrService(session)
    martyr = await service.update_martyr(martyr_id, payload, main_image=main_image)
    return MartyrRead.model_validate(martyr)


@router.delete("/{martyr_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_martyr(
    martyr_id: int,
    _: AdminUser = Depends(get_current_admin),
    session: AsyncSession = Depends(get_db_session),
) -> None:
    service = MartyrService(session)
    await service.delete_martyr(martyr_id)


@router.post("/{martyr_id}/gallery", response_model=GalleryImageRead, status_code=status.HTTP_201_CREATED)
async def add_gallery_image(
    martyr_id: int,
    image: UploadFile = File(...),
    alt_text: str | None = Form(default=None),
    sort_order: int | None = Form(default=None),
    _: AdminUser = Depends(get_current_admin),
    session: AsyncSession = Depends(get_db_session),
) -> GalleryImageRead:
    service = MartyrService(session)
    gallery = await service.add_gallery_image(
        martyr_id=martyr_id,
        file=image,
        alt_text=normalize_optional_text(alt_text),
        sort_order=sort_order,
    )
    return GalleryImageRead.model_validate(gallery)


@router.delete("/{martyr_id}/gallery/{image_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_gallery_image(
    martyr_id: int,
    image_id: int,
    _: AdminUser = Depends(get_current_admin),
    session: AsyncSession = Depends(get_db_session),
) -> None:
    service = MartyrService(session)
    await service.delete_gallery_image(martyr_id, image_id)
