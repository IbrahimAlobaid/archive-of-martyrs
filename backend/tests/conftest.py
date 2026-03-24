from __future__ import annotations

import os
from collections.abc import AsyncGenerator, Awaitable, Callable

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy import delete
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

os.environ["DATABASE_URL"] = "sqlite+aiosqlite:///./test.db"
os.environ["JWT_SECRET_KEY"] = "test-secret-key"
os.environ["ACCESS_TOKEN_EXPIRE_MINUTES"] = "30"

from app.api.deps import get_db_session
from app.core.security import hash_password
from app.db.base import Base
from app.main import app
from app.models.admin_user import AdminUser
from app.models.gallery_image import GalleryImage
from app.models.martyr import Martyr
from app.models.submission import Submission
from app.models.village import Village
from app.repositories.admin_user_repository import AdminUserRepository

TEST_DATABASE_URL = "sqlite+aiosqlite:///./test.db"

test_engine = create_async_engine(TEST_DATABASE_URL, future=True)
TestingSessionLocal = async_sessionmaker(bind=test_engine, class_=AsyncSession, expire_on_commit=False)


async def override_get_db_session() -> AsyncGenerator[AsyncSession, None]:
    async with TestingSessionLocal() as session:
        yield session


@pytest.fixture(scope="session", autouse=True)
async def create_test_database() -> AsyncGenerator[None, None]:
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

    app.dependency_overrides[get_db_session] = override_get_db_session
    yield

    app.dependency_overrides.clear()
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await test_engine.dispose()


@pytest.fixture(autouse=True)
async def clean_db() -> AsyncGenerator[None, None]:
    async with TestingSessionLocal() as session:
        await session.execute(delete(GalleryImage))
        await session.execute(delete(Submission))
        await session.execute(delete(Martyr))
        await session.execute(delete(Village))
        await session.execute(delete(AdminUser))
        await session.commit()
    yield


@pytest.fixture
async def client() -> AsyncGenerator[AsyncClient, None]:
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as async_client:
        yield async_client


@pytest.fixture
async def create_admin_user() -> Callable[[str, str], Awaitable[AdminUser]]:
    async def _create(username: str = "admin", password: str = "password123") -> AdminUser:
        async with TestingSessionLocal() as session:
            repo = AdminUserRepository(session)
            user = await repo.create(username=username, hashed_password=hash_password(password))
            return user

    return _create


@pytest.fixture
async def admin_token(client: AsyncClient, create_admin_user) -> str:
    await create_admin_user()
    response = await client.post(
        "/api/v1/auth/login",
        json={"username": "admin", "password": "password123"},
    )
    assert response.status_code == 200
    return response.json()["access_token"]
