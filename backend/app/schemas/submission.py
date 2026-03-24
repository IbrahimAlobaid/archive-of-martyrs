from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.models.submission import SubmissionStatus


class SubmissionCreate(BaseModel):
    martyr_id: int | None = None
    submitter_name: str | None = Field(default=None, max_length=120)
    submitter_email: EmailStr | None = None
    message: str = Field(min_length=10, max_length=3000)


class SubmissionReviewUpdate(BaseModel):
    status: SubmissionStatus


class SubmissionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    martyr_id: int | None
    submitter_name: str | None
    submitter_email: str | None
    message: str
    status: SubmissionStatus
    created_at: datetime
    reviewed_at: datetime | None
