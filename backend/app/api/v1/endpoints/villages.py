from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_admin
from app.db.session import get_db_session
from app.models.admin_user import AdminUser
from app.schemas.village import VillageCreate, VillageRead
from app.services.village_service import VillageService

router = APIRouter()


@router.get("", response_model=list[VillageRead])
async def list_villages(session: AsyncSession = Depends(get_db_session)) -> list[VillageRead]:
    service = VillageService(session)
    return [VillageRead.model_validate(village) for village in await service.list_villages()]


@router.post("", response_model=VillageRead, status_code=status.HTTP_201_CREATED)
async def create_village(
    payload: VillageCreate,
    _: AdminUser = Depends(get_current_admin),
    session: AsyncSession = Depends(get_db_session),
) -> VillageRead:
    service = VillageService(session)
    village = await service.create_village(payload)
    return VillageRead.model_validate(village)
