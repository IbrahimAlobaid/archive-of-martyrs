import pytest


@pytest.mark.asyncio
async def test_login_success(client, create_admin_user):
    await create_admin_user(username="root", password="strongpass")
    response = await client.post(
        "/api/v1/auth/login",
        json={"username": "root", "password": "strongpass"},
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload["token_type"] == "bearer"
    assert payload["access_token"]


@pytest.mark.asyncio
async def test_login_invalid_credentials(client):
    response = await client.post(
        "/api/v1/auth/login",
        json={"username": "missing", "password": "wrongpass"},
    )
    assert response.status_code == 401
