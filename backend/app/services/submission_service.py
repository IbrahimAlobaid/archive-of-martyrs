from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.submission import Submission, SubmissionStatus
from app.repositories.submission_repository import SubmissionRepository
from app.schemas.submission import SubmissionCreate


class SubmissionService:
    def __init__(self, session: AsyncSession) -> None:
        self.repo = SubmissionRepository(session)

    async def create_submission(self, payload: SubmissionCreate) -> Submission:
        submission = Submission(
            martyr_id=payload.martyr_id,
            submitter_name=payload.submitter_name,
            submitter_email=str(payload.submitter_email) if payload.submitter_email else None,
            message=payload.message,
            status=SubmissionStatus.PENDING,
        )
        return await self.repo.create(submission)

    async def list_submissions(
        self,
        *,
        status: SubmissionStatus | None,
        page: int,
        page_size: int,
    ) -> tuple[list[Submission], int]:
        items = await self.repo.list_filtered(status=status, page=page, page_size=page_size)
        total = await self.repo.count_filtered(status=status)
        return items, total

    async def review_submission(self, submission_id: int, status_value: SubmissionStatus) -> Submission:
        submission = await self.repo.get_by_id(submission_id)
        if not submission:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Submission not found")
        return await self.repo.update_status(submission, status_value)
