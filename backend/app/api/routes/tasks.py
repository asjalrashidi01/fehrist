from fastapi import APIRouter
from app.models import Task
from sqlmodel import Session, select
from app.core.database import engine

router = APIRouter(prefix="/tasks")

@router.get("/")
def get_tasks():
    with Session(engine) as session:
        tasks = session.exec(select(Task)).all()
        return tasks