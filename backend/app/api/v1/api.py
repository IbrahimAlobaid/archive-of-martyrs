from fastapi import APIRouter

from app.api.v1.endpoints import auth, health, martyrs, submissions, villages

api_router = APIRouter()
api_router.include_router(health.router, tags=["health"])
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(martyrs.router, prefix="/martyrs", tags=["martyrs"])
api_router.include_router(villages.router, prefix="/villages", tags=["villages"])
api_router.include_router(submissions.router, prefix="/submissions", tags=["submissions"])
