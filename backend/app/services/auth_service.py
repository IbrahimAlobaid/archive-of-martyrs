from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import create_access_token, verify_password
from app.repositories.admin_user_repository import AdminUserRepository


class AuthService:
    def __init__(self, session: AsyncSession) -> None:
        self.repo = AdminUserRepository(session)

    async def login(self, username: str, password: str) -> str:
        user = await self.repo.get_by_username(username)
        if not user or not user.is_active or not verify_password(password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid username or password",
            )
        return create_access_token(subject=str(user.id))
