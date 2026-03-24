from fastapi import HTTPException, UploadFile, status

ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/webp", "image/jpg"}


async def validate_image_file(file: UploadFile, max_size_mb: int) -> None:
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid image format. Allowed: jpeg, jpg, png, webp",
        )

    payload = await file.read()
    await file.seek(0)

    max_size_bytes = max_size_mb * 1024 * 1024
    if len(payload) > max_size_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Image size exceeds {max_size_mb} MB",
        )
