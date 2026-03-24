import pytest


@pytest.mark.asyncio
async def test_create_and_fetch_martyr(client, admin_token):
    headers = {"Authorization": f"Bearer {admin_token}"}

    village_resp = await client.post(
        "/api/v1/villages",
        json={"name_ar": "الحاضر", "name_en": "Al-Hader"},
        headers=headers,
    )
    assert village_resp.status_code == 201
    village_id = village_resp.json()["id"]

    create_resp = await client.post(
        "/api/v1/martyrs",
        data={
            "full_name": "أحمد سالم",
            "village_id": str(village_id),
            "martyrdom_date": "2024-01-10",
            "age": "27",
            "short_bio": "سيرة موجزة",
            "is_published": "true",
            "is_featured": "true",
        },
        headers=headers,
    )
    assert create_resp.status_code == 201
    martyr = create_resp.json()
    assert martyr["slug"]
    assert martyr["full_name"] == "أحمد سالم"

    list_resp = await client.get("/api/v1/martyrs")
    assert list_resp.status_code == 200
    payload = list_resp.json()
    assert payload["total"] == 1
    assert payload["items"][0]["full_name"] == "أحمد سالم"

    detail_resp = await client.get(f"/api/v1/martyrs/{martyr['slug']}")
    assert detail_resp.status_code == 200
    assert detail_resp.json()["village"]["name_ar"] == "الحاضر"


@pytest.mark.asyncio
async def test_martyr_filters(client, admin_token):
    headers = {"Authorization": f"Bearer {admin_token}"}
    village1 = await client.post(
        "/api/v1/villages",
        json={"name_ar": "العيس", "name_en": "Al-Eis"},
        headers=headers,
    )
    village2 = await client.post(
        "/api/v1/villages",
        json={"name_ar": "الزربة", "name_en": "Al-Zirbah"},
        headers=headers,
    )

    village1_id = village1.json()["id"]
    village2_id = village2.json()["id"]

    await client.post(
        "/api/v1/martyrs",
        data={
            "full_name": "محمد رمضان",
            "village_id": str(village1_id),
            "martyrdom_date": "2023-06-10",
            "is_published": "true",
        },
        headers=headers,
    )
    await client.post(
        "/api/v1/martyrs",
        data={
            "full_name": "سليم خالد",
            "village_id": str(village2_id),
            "martyrdom_date": "2024-04-10",
            "is_published": "true",
        },
        headers=headers,
    )

    filtered = await client.get("/api/v1/martyrs", params={"village": "al-eis"})
    assert filtered.status_code == 200
    assert filtered.json()["total"] == 1
