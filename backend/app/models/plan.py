from pydantic import BaseModel
from typing import Literal, Optional, List

class Task(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    priority: int
    difficulty: int
    durationMinutes: int
    status: int

class PlanBlock(BaseModel):
    blockId: int
    type: Literal["work", "break"]
    durationMinutes: int
    tasks: List[str]
    splitInfo: Optional[dict] = None

class PlanGenerateRequest(BaseModel):
    tasks: List[Task]

class PlanGenerateResponse(BaseModel):
    blocks: List[PlanBlock]
    totalDurationMinutes: int
    totalBlocks: int
    quickTaskUsed: bool

class PlanRegenerateRequest(BaseModel):
    tasks: List[Task]
    seed: Optional[int] = None
    randomness: float = 0.3   # 0 = deterministic, 1 = very random
    allowDifferentQuickTask: bool = True
    allowReverseAnchor: bool = True

class PlanRegenerateResponse(BaseModel):
    blocks: List[PlanBlock]
    totalDurationMinutes: int
    totalBlocks: int
    quickTaskUsed: bool
    seedUsed: int
    variationExplanation: str