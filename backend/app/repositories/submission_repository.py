from datetime import UTC, datetime

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.submission import Submission, SubmissionStatus


class SubmissionRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def create(self, submission: Submission) -> Submission:
        self.session.add(submission)
        await self.session.commit()
        await self.session.refresh(submission)
        return submission

    async def list_filtered(
        self,
        *,
        status: SubmissionStatus | None,
        page: int,
        page_size: int,
    ) -> list[Submission]:
        query = select(Submission)
        if status:
            query = query.where(Submission.status == status)

        query = query.order_by(Submission.created_at.desc()).offset((page - 1) * page_size).limit(page_size)
        result = await self.session.execute(query)
        return list(result.scalars().all())

    async def count_filtered(self, status: SubmissionStatus | None) -> int:
        query = select(func.count(Submission.id))
        if status:
            query = query.where(Submission.status == status)
        result = await self.session.execute(query)
        return int(result.scalar_one())

    async def get_by_id(self, submission_id: int) -> Submission | None:
        query = select(Submission).where(Submission.id == submission_id)
        result = await self.session.execute(query)
        return result.scalar_one_or_none()

    async def update_status(self, submission: Submission, status: SubmissionStatus) -> Submission:
        submission.status = status
        submission.reviewed_at = datetime.now(UTC)
        await self.session.commit()
        await self.session.refresh(submission)
        return submission
