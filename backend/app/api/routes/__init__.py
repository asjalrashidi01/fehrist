from fastapi import APIRouter
from api.routes import tasks

router = APIRouter()
router.include_router(tasks.router)