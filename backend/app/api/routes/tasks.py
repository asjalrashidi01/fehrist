from fastapi import APIRouter

router = APIRouter(prefix="/tasks", tags=["tasks"])

@router.get("")
def get_tasks():
    """Return a mock list of tasks."""
    return [
        {"id": 1, "title": "Write project README", "completed": True},
        {"id": 2, "title": "Setup backend routes", "completed": False},
        {"id": 3, "title": "Initialize frontend project", "completed": False},
    ]

@router.post("")
def create_task():
    """Mock create task response."""
    return {"id": 4, "title": "New Task", "completed": False}