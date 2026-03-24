from __future__ import annotations

from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.village import VillageRead

MartyrSort = Literal["newest", "oldest", "alphabetical"]


class MartyrCreate(BaseModel):
    full_name: str = Field(min_length=2, max_length=255)
    village_id: int
    birth_date: date | None = None
    martyrdom_date: date
    age: int | None = Field(default=None, ge=0, le=120)
    short_bio: str | None = Field(default=None, max_length=500)
    full_story: str | None = None
    is_published: bool = False
    is_featured: bool = False


class MartyrUpdate(BaseModel):
    full_name: str | None = Field(default=None, min_length=2, max_length=255)
    village_id: int | None = None
    birth_date: date | None = None
    martyrdom_date: date | None = None
    age: int | None = Field(default=None, ge=0, le=120)
    short_bio: str | None = Field(default=None, max_length=500)
    full_story: str | None = None
    is_published: bool | None = None
    is_featured: bool | None = None


class GalleryImageRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    image_url: str
    public_id: str
    alt_text: str | None
    sort_order: int
    created_at: datetime


class MartyrListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    full_name: str
    slug: str
    main_image_url: str | None
    martyrdom_date: date
    age: int | None
    short_bio: str | None
    is_featured: bool
    is_published: bool
    village: VillageRead


class MartyrRead(MartyrListItem):
    birth_date: date | None
    full_story: str | None
    is_published: bool
    created_at: datetime
    updated_at: datetime
    gallery_images: list[GalleryImageRead]


class MartyrStats(BaseModel):
    total_martyrs: int
    villages_represented: int
    latest_added_name: str | None
    latest_added_date: date | None
