import pytest


@pytest.mark.asyncio
async def test_submission_review_flow(client, admin_token):
    create_resp = await client.post(
        "/api/v1/submissions",
        json={
            "submitter_name": "مستخدم",
            "submitter_email": "user@example.com",
            "message": "يرجى تصحيح تاريخ الاستشهاد في السجل المنشور.",
        },
    )
    assert create_resp.status_code == 201
    submission_id = create_resp.json()["id"]

    headers = {"Authorization": f"Bearer {admin_token}"}
    list_resp = await client.get("/api/v1/submissions", headers=headers)
    assert list_resp.status_code == 200
    assert list_resp.json()["total"] == 1

    review_resp = await client.patch(
        f"/api/v1/submissions/{submission_id}/review",
        json={"status": "approved"},
        headers=headers,
    )
    assert review_resp.status_code == 200
    assert review_resp.json()["status"] == "approved"
