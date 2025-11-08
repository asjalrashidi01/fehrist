from fastapi import APIRouter

router = APIRouter(prefix="/plan", tags=["plan"])

@router.post("/generate")
def generate_plan():
    """Return a mock plan based on tasks."""
    return {
        "plan_id": "mock-plan-123",
        "steps": [
            {"step": 1, "task": "Setup repo", "duration": 25},
            {"step": 2, "task": "Write mock backend", "duration": 30},
            {"step": 3, "task": "Build task UI", "duration": 45},
        ],
        "reasoning": "Tasks are ordered from setup to implementation for optimal flow.",
    }

@router.post("/regenerate")
def regenerate_plan():
    """Mock regeneration of plan."""
    return {
        "plan_id": "mock-plan-456",
        "steps": [
            {"step": 1, "task": "Review requirements", "duration": 20},
            {"step": 2, "task": "Code initial routes", "duration": 40},
        ],
        "reasoning": "Reordered tasks based on updated priorities.",
    }