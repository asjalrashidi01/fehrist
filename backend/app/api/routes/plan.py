import math
from dataclasses import dataclass
from typing import List, Optional, Any, Union
from fastapi import APIRouter
from models.plan import (
    Task,
    SplitInfo,
    PlanBlock,
    PlanGenerateRequest,
    PlanGenerateResponse,
    PlanRegenerateRequest,
    PlanRegenerateResponse,
)

import re
import random

def load_categories():
    try:
        from data.categories import CATEGORIES
        if isinstance(CATEGORIES, dict):
            return CATEGORIES
        return {}
    except Exception:
        return {}

router = APIRouter(prefix="/plan", tags=["plan"])

# Internal helper: represents a chunk of a Task (so we always carry split metadata)
@dataclass
class TaskChunk:
    task: Task          # original task object (for id, priority, ... read-only)
    remaining: int      # remaining minutes in this chunk (duration of this chunk)
    total_parts: int    # how many parts the original task is split into
    next_part: int      # 1-based index for this chunk (which part it is)

# -------------------------
# Generate route
# -------------------------
@router.post("/generate", response_model=PlanGenerateResponse)
def generate_plan(payload: PlanGenerateRequest, preserve_order: bool = False):

    # -----------------------
    # 1) Prepare tasks: filter completed/deleted
    # -----------------------
    tasks: List[Task] = [t for t in payload.tasks if t.status not in (2, 3)]
    if not tasks:
        return PlanGenerateResponse(blocks=[], totalDurationMinutes=0, totalBlocks=0, quickTaskUsed=False)

    # split quick vs normal
    quick_tasks: List[Task] = [t for t in tasks if is_quick_task(t)]
    normal_tasks: List[Union[Task, TaskChunk]] = [t for t in tasks if not is_quick_task(t)]

    # quick motivation selection
    quick_task_used = False
    quick_motivation: Optional[Task] = None
    if quick_tasks:
        quick_motivation = sort_tasks(quick_tasks)[0]
        quick_tasks.remove(quick_motivation)
        quick_task_used = True

    # sorting
    if not preserve_order:
        # sort_tasks expects List[Task]; normal_tasks currently contains Task only at this point
        normal_tasks = sort_tasks([t for t in normal_tasks if isinstance(t, Task)])  # type: ignore[assignment]
        quick_tasks = sort_tasks(quick_tasks)

    # context grouping
    categories = load_categories()
    # apply_context_grouping expects Task list; operate on the pure-Task list and then rebuild normal_tasks
    task_only = [t for t in normal_tasks if isinstance(t, Task)]
    grouped = apply_context_grouping(task_only, categories)
    # rebuild normal_tasks from grouped tasks (there are no TaskChunk yet at this point)
    normal_tasks = grouped[:]  # now contains Task instances initially

    # -----------------------
    # Scheduling variables
    # -----------------------
    plan: List[PlanBlock] = []
    blockId = 1
    current_work_block: Optional[dict] = None

    blockLength = 30
    shortBreak = 5
    longBreak = 15

    substantial_blocks = 0
    work_since_last_break = 0
    CONTINUOUS_WORK_THRESHOLD = 40

    # -----------------------
    # Helpers
    # -----------------------
    def _start_work_block_if_needed():
        nonlocal current_work_block, blockId
        if current_work_block is None:
            current_work_block = {
                "blockId": blockId,
                "durationMinutes": 0,
                "tasks": [],
                # store dict entries for splitInfos while building: {"originalTaskId","part","totalParts"}
                "splitInfos": []
            }

    def add_to_work_block(duration: int, items: List[Union[Task, TaskChunk]]):
        """
        Add duration and items to the current work block.
        If adding would overflow the block, finalize the current block and start a new one.
        After adding, if the block exactly reaches or exceeds blockLength, finalize it immediately
        so subsequent additions go to a fresh block.
        """
        nonlocal current_work_block, blockId

        # If current block exists and this addition would overflow it -> finalize current block first.
        if current_work_block and (current_work_block["durationMinutes"] + duration > blockLength):
            finalize_current_work_block()

        # Ensure a block exists now
        if current_work_block is None:
            current_work_block = {
                "blockId": blockId,
                "durationMinutes": 0,
                "tasks": [],
                "splitInfos": []
            }

        # Add duration
        current_work_block["durationMinutes"] += duration

        # Add tasks + splitInfos
        for it in items:
            if isinstance(it, TaskChunk):
                tid = it.task.id
                entry = {
                    "originalTaskId": tid,
                    "part": it.next_part,
                    "totalParts": it.total_parts
                }
                # avoid duplicates by key
                if not any(
                    si.get("originalTaskId") == entry["originalTaskId"] and
                    si.get("part") == entry["part"] and
                    si.get("totalParts") == entry["totalParts"]
                    for si in current_work_block["splitInfos"]
                ):
                    current_work_block["splitInfos"].append(entry)
            else:
                tid = it.id

            current_work_block["tasks"].append(tid)

        # If block is full (reached length) finalize it immediately to avoid accidental mixing later
        if current_work_block["durationMinutes"] >= blockLength:
            finalize_current_work_block()

    def finalize_current_work_block():
        nonlocal current_work_block, plan, blockId
        if not current_work_block:
            return

        si_list: Optional[List[SplitInfo]] = None
        if current_work_block.get("splitInfos"):
            si_list = [SplitInfo(**s) for s in current_work_block["splitInfos"]]

        plan.append(
            PlanBlock(
                blockId=current_work_block["blockId"],
                type="work",
                durationMinutes=current_work_block["durationMinutes"],
                tasks=current_work_block["tasks"],
                splitInfos=si_list,
            )
        )
        blockId += 1
        current_work_block = None

    def add_break(duration: int):
        nonlocal plan, blockId
        plan.append(
            PlanBlock(
                blockId=blockId,
                type="break",
                durationMinutes=duration,
                tasks=[],
                splitInfos=None,
            )
        )
        blockId += 1

    def maybe_add_break(last_block_duration: int):
        """
        Update continuous-work and add a break if threshold passed.
        Always finalizes the current work block before adding a break.
        """
        nonlocal work_since_last_break, substantial_blocks

        work_since_last_break += last_block_duration
        if last_block_duration >= 20:
            substantial_blocks += 1

        if work_since_last_break < CONTINUOUS_WORK_THRESHOLD:
            return

        # finalize and add break
        finalize_current_work_block()

        # long break every 4 substantial_blocks (only when >0)
        if substantial_blocks > 0 and (substantial_blocks % 4 == 0):
            add_break(longBreak)
        else:
            add_break(shortBreak)

        work_since_last_break = 0

    # -----------------------
    # Step 1: Quick motivation
    # -----------------------
    if quick_motivation:
        dur = quick_motivation.durationMinutes
        add_to_work_block(dur, [quick_motivation])
        maybe_add_break(dur)

    # -----------------------
    # Step 2: Anchor task (first normal)
    # -----------------------
    if normal_tasks:
        first = normal_tasks.pop(0)
        # ensure we operate on Task (not TaskChunk) for anchor initial split
        if isinstance(first, TaskChunk):
            # defensive: if a chunk somehow exists here
            t_obj = first.task
            remaining_total = first.remaining
            start_part = first.next_part
            total_parts = first.total_parts
        else:
            t_obj = first
            remaining_total = t_obj.durationMinutes
            total_parts = math.ceil(remaining_total / blockLength)
            start_part = 1

        dur = min(remaining_total, blockLength)
        chunk = TaskChunk(task=t_obj, remaining=dur, total_parts=total_parts, next_part=start_part)
        add_to_work_block(dur, [chunk])

        leftover = remaining_total - dur
        if leftover > 0:
            # insert leftover as TaskChunk with updated part index
            leftover_chunk = TaskChunk(
                task=t_obj,
                remaining=leftover,
                total_parts=total_parts,
                next_part=start_part + 1
            )
            normal_tasks.insert(0, leftover_chunk)

        # If the current block somehow exceeded blockLength (anchor+quick motivation), finalize it now.
        if current_work_block and current_work_block["durationMinutes"] > blockLength:
            finalize_current_work_block()

        maybe_add_break(dur)

    # -----------------------
    # Step 3: Micro-task batch (quick_tasks)
    # -----------------------
    # Ensure any overfull block is finalized before batching micro tasks (defensive)
    if current_work_block and current_work_block["durationMinutes"] > blockLength:
        finalize_current_work_block()

    while quick_tasks:
        used = 0
        batch: List[Task] = []
        for t in list(quick_tasks):
            if used + t.durationMinutes <= blockLength:
                batch.append(t)
                used += t.durationMinutes
                quick_tasks.remove(t)
            else:
                break

        if not batch:
            # defensive fallback
            t = quick_tasks.pop(0)
            batch = [t]
            used = t.durationMinutes

        add_to_work_block(used, batch)
        maybe_add_break(used)

    # -----------------------
    # Step 4: Remaining normal tasks (handle Task or TaskChunk)
    # -----------------------
    while normal_tasks:
        item = normal_tasks.pop(0)
        if isinstance(item, TaskChunk):
            t_obj = item.task
            remaining = item.remaining
            total_parts = item.total_parts
            part_index = item.next_part
        else:
            t_obj = item
            remaining = t_obj.durationMinutes
            total_parts = math.ceil(remaining / blockLength)
            part_index = 1

        while remaining > 0:
            dur = min(remaining, blockLength)
            chunk = TaskChunk(task=t_obj, remaining=dur, total_parts=total_parts, next_part=part_index)

            add_to_work_block(dur, [chunk])

            # update continuous counters
            work_since_last_break += dur
            if dur >= 20:
                substantial_blocks += 1

            remaining -= dur

            if remaining > 0:
                # forced break between chunks
                finalize_current_work_block()
                add_break(shortBreak)
                work_since_last_break = 0
            else:
                # last chunk for this task: follow threshold logic
                maybe_add_break(dur)

            part_index += 1

    # finalize any open work block
    finalize_current_work_block()

    # remove trailing break
    if plan and plan[-1].type == "break":
        plan.pop()

    totalDuration = sum(b.durationMinutes for b in plan)

    return PlanGenerateResponse(
        blocks=plan,
        totalDurationMinutes=totalDuration,
        totalBlocks=len(plan),
        quickTaskUsed=quick_task_used,
    )

# -----------------------
# Regenerate route (unchanged heuristics, uses generate_plan)
# -----------------------
@router.post("/regenerate", response_model=PlanRegenerateResponse)
def regenerate_plan(payload: PlanRegenerateRequest):
    seed = payload.seed if payload.seed is not None else random.randint(1, 999999)
    random.seed(seed)

    tasks = payload.tasks[:]  # shallow copy
    randomness = payload.randomness
    explanation: List[str] = []

    categories = load_categories()

    def noisy_score(task: Task):
        base = compute_score(task)
        noise = random.uniform(-randomness, randomness) * base
        return base + noise

    tasks = sorted(tasks, key=lambda t: noisy_score(t), reverse=True)
    explanation.append("Applied proportional noisy scoring to reorder tasks.")

    if payload.allowDifferentQuickTask:
        quick_candidates = [t for t in tasks if is_quick_task(t)]
        if len(quick_candidates) > 1:
            random.shuffle(quick_candidates)
            explanation.append("Shuffled quick-task candidates for variation.")

    def random_category_swaps(task_list: List[Task]) -> List[Task]:
        new_list = task_list[:]
        for i in range(len(new_list) - 1):
            catA = get_task_category(new_list[i], categories)
            catB = get_task_category(new_list[i + 1], categories)
            if catA == catB and random.random() < (randomness * 0.5):
                new_list[i], new_list[i + 1] = new_list[i + 1], new_list[i]
                explanation.append(f"Swapped two '{catA}' tasks for variation.")
        return new_list

    tasks = random_category_swaps(tasks)

    quick_ts = [t for t in tasks if is_quick_task(t)]
    if len(quick_ts) > 1:
        random.shuffle(quick_ts)
        explanation.append("Shuffled micro-task order to vary batch arrangement.")

    # reinsert shuffled quick tasks
    shuffled_tasks = []
    q_index = 0
    for t in tasks:
        if is_quick_task(t):
            shuffled_tasks.append(quick_ts[q_index])
            q_index += 1
        else:
            shuffled_tasks.append(t)
    tasks = shuffled_tasks

    regenerated_plan = generate_plan(PlanGenerateRequest(tasks=tasks), preserve_order=True)

    return PlanRegenerateResponse(
        blocks=regenerated_plan.blocks,
        totalDurationMinutes=regenerated_plan.totalDurationMinutes,
        totalBlocks=regenerated_plan.totalBlocks,
        quickTaskUsed=regenerated_plan.quickTaskUsed,
        seedUsed=seed,
        variationExplanation=", ".join(explanation),
    )

# -----------------------
# Helper functions (unchanged)
# -----------------------
def compute_score(task: Task):
    return (task.priority * 2) + task.difficulty

def sort_tasks(tasks: List[Task]) -> List[Task]:
    return sorted(tasks, key=lambda t: (compute_score(t), t.durationMinutes), reverse=True)

def is_quick_task(task: Task):
    return task.durationMinutes <= 10

def append_break_block(plan, blockId, duration):
    plan.append(PlanBlock(blockId=blockId, type="break", durationMinutes=duration, tasks=[], splitInfos=None))

def split_task(task: Task, chunk: int):
    if task.durationMinutes <= chunk:
        return task.durationMinutes, None

    return chunk, Task(
        id=task.id,
        name=task.name,
        description=task.description,
        priority=task.priority,
        difficulty=task.difficulty,
        durationMinutes=task.durationMinutes - chunk,
        status=task.status,
    )

def get_task_category(task: Task, categories):
    text = (task.name + " " + (task.description or "")).lower()
    tokens = re.findall(r"\w+", text)

    if not categories:
        return "other"

    scores = {cat: 0 for cat in categories.keys()}
    for token in tokens:
        for cat, keywords in categories.items():
            if token in keywords:
                scores[cat] += 1

    best_cat = max(scores, key=scores.get)
    if scores[best_cat] == 0:
        return "other"
    return best_cat

def apply_context_grouping(tasks: List[Task], categories):
    if not categories:
        return tasks
    if len(tasks) < 3:
        return tasks

    new_tasks = tasks[:]
    for i in range(len(new_tasks) - 2):
        current = new_tasks[i]
        next1 = new_tasks[i + 1]
        next2 = new_tasks[i + 2]

        cat0 = get_task_category(current, categories)
        cat1 = get_task_category(next1, categories)
        cat2 = get_task_category(next2, categories)

        if cat0 == cat2 and cat0 != cat1:
            new_tasks[i + 1], new_tasks[i + 2] = new_tasks[i + 2], new_tasks[i + 1]

    return new_tasks