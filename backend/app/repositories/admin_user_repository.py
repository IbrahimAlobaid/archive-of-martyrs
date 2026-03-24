from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.admin_user import AdminUser


class AdminUserRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get_by_username(self, username: str) -> AdminUser | None:
        query = select(AdminUser).where(AdminUser.username == username)
        result = await self.session.execute(query)
        return result.scalar_one_or_none()

    async def get_by_id(self, user_id: int) -> AdminUser | None:
        query = select(AdminUser).where(AdminUser.id == user_id)
        result = await self.session.execute(query)
        return result.scalar_one_or_none()

    async def create(self, username: str, hashed_password: str) -> AdminUser:
        user = AdminUser(username=username, hashed_password=hashed_password)
        self.session.add(user)
        await self.session.commit()
        await self.session.refresh(user)
        return user
