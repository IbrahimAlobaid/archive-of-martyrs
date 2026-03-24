from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class VillageCreate(BaseModel):
    name_ar: str = Field(min_length=2, max_length=120)
    name_en: str | None = Field(default=None, max_length=120)


class VillageRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name_ar: str
    name_en: str | None
    slug: str
    created_at: datetime
