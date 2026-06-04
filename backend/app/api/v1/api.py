from fastapi import APIRouter
from .endpoints import auth, websites, tests, analytics, reports

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(websites.router, prefix="/websites", tags=["websites"])
api_router.include_router(tests.router, prefix="/tests", tags=["tests"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
api_router.include_router(reports.router, prefix="/reports", tags=["reports"])
