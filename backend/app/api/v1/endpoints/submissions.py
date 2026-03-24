from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_admin
from app.db.session import get_db_session
from app.models.admin_user import AdminUser
from app.models.submission import SubmissionStatus
from app.schemas.common import PaginatedResponse
from app.schemas.submission import SubmissionCreate, SubmissionRead, SubmissionReviewUpdate
from app.services.submission_service import SubmissionService
from app.utils.pagination import total_pages

router = APIRouter()


@router.post("", response_model=SubmissionRead, status_code=status.HTTP_201_CREATED)
async def create_submission(
    payload: SubmissionCreate,
    session: AsyncSession = Depends(get_db_session),
) -> SubmissionRead:
    service = SubmissionService(session)
    submission = await service.create_submission(payload)
    return SubmissionRead.model_validate(submission)


@router.get("", response_model=PaginatedResponse[SubmissionRead])
async def list_submissions(
    _: AdminUser = Depends(get_current_admin),
    session: AsyncSession = Depends(get_db_session),
    status_filter: SubmissionStatus | None = Query(default=None, alias="status"),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=10, ge=1, le=100),
) -> PaginatedResponse[SubmissionRead]:
    service = SubmissionService(session)
    items, total = await service.list_submissions(status=status_filter, page=page, page_size=page_size)
    return PaginatedResponse[SubmissionRead](
        items=[SubmissionRead.model_validate(item) for item in items],
        total=total,
        page=page,
        page_size=page_size,
        pages=total_pages(total, page_size),
    )


@router.patch("/{submission_id}/review", response_model=SubmissionRead)
async def review_submission(
    submission_id: int,
    payload: SubmissionReviewUpdate,
    _: AdminUser = Depends(get_current_admin),
    session: AsyncSession = Depends(get_db_session),
) -> SubmissionRead:
    service = SubmissionService(session)
    submission = await service.review_submission(submission_id, payload.status)
    return SubmissionRead.model_validate(submission)
