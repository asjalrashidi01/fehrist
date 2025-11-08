from fastapi import APIRouter

router = APIRouter(prefix="/session", tags=["session"])

@router.get("")
def get_session():
    """Return mock session data."""
    return {
        "session_id": "mock-session-789",
        "status": "active",
        "current_step": 1,
        "total_steps": 3,
        "progress": 33,
    }