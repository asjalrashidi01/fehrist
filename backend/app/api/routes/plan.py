import math
from typing import List
from fastapi import APIRouter
from models.plan import Task, PlanBlock, PlanGenerateRequest, PlanGenerateResponse, PlanRegenerateRequest, PlanRegenerateResponse

import re

def load_categories():
    try:
        from data.categories import CATEGORIES
        if isinstance(CATEGORIES, dict):
            return CATEGORIES
        return {}
    except Exception:
        # File missing / syntax error / invalid structure
        return {}

router = APIRouter(prefix="/plan", tags=["plan"])

@router.post("/generate", response_model=PlanGenerateResponse)
def generate_plan(payload: PlanGenerateRequest, preserve_order: bool = False):

    tasks = [t for t in payload.tasks if t.status != 2 and t.status != 3]  # exclude completed / deleted
    if not tasks:
        return PlanGenerateResponse(
            blocks=[],
            totalDurationMinutes=0,
            totalBlocks=0,
            quickTaskUsed=False
        )

    # Separate quick tasks
    quick_tasks = [t for t in tasks if is_quick_task(t)]
    normal_tasks = [t for t in tasks if not is_quick_task(t)]

    # Quick motivation task
    quick_task_used = False
    quick_motivation = None
    if quick_tasks:
        quick_motivation = sort_tasks(quick_tasks)[0]
        quick_tasks.remove(quick_motivation)
        quick_task_used = True

    # Sort remaining tasks
    if not preserve_order:
        normal_tasks = sort_tasks(normal_tasks)
        quick_tasks = sort_tasks(quick_tasks)

    # Apply context-aware grouping
    categories = load_categories()
    normal_tasks = apply_context_grouping(normal_tasks, categories)

    # Scheduling variables
    plan = []
    blockId = 1
    blockLength = 30
    shortBreak = 5
    longBreak = 15
    substantial_blocks = 0  # track blocks >=20 min for long-break logic

    # track split metadata per original task
    # format: task_split_meta[task_id] = {"totalParts": int, "nextPart": int}
    task_split_meta = {}

    # 🔹 RULE B4: No break at session end, helper inside loop
    def maybe_add_break(last_block_duration):
        nonlocal blockId, substantial_blocks

        # Skip if this was final block (we check later)
        # Skip if last block <20 minutes
        if last_block_duration < 20:
            return

        # Substantial block count
        substantial_blocks += 1

        # Long break every 4 substantial blocks
        if substantial_blocks % 4 == 0:
            append_break_block(plan, blockId, longBreak)
            blockId += 1
        else:
            append_break_block(plan, blockId, shortBreak)
            blockId += 1

    # -----------------------------------------------------------------
    # Step 1: Quick motivation task
    # -----------------------------------------------------------------
    if quick_motivation:
        dur = quick_motivation.durationMinutes
        append_work_block(plan, blockId, dur, [quick_motivation])
        blockId += 1
        # RULE B1: DO NOT ADD BREAK HERE

    # -----------------------------------------------------------------
    # Step 2: Anchor task
    # -----------------------------------------------------------------
    if normal_tasks:
        anchor = normal_tasks.pop(0)
        remaining = anchor.durationMinutes

        # Fill first block with anchor
        if remaining > blockLength:
            split_dur = blockLength
            remaining -= blockLength
        else:
            split_dur = remaining
            remaining = 0

        split_info = None
        if anchor.durationMinutes > blockLength:
            # compute totalParts from original duration BEFORE we mutate anything
            total_parts = math.ceil(anchor.durationMinutes / blockLength)
            if anchor.id not in task_split_meta:
                task_split_meta[anchor.id] = {"totalParts": total_parts, "nextPart": 1}
            meta = task_split_meta[anchor.id]

            split_info = {
                "originalTaskId": anchor.id,
                "part": meta["nextPart"],   # assigned chunk number
                "totalParts": meta["totalParts"]
            }
            meta["nextPart"] += 1

        append_work_block(plan, blockId, split_dur, [anchor], split_info)
        blockId += 1

        if remaining > 0:
            anchor.durationMinutes = remaining
            normal_tasks.insert(0, anchor)

        # Add break (only if the anchor block was substantial)
        maybe_add_break(split_dur)

    # -----------------------------------------------------------------
    # Step 3: Micro task batch
    # -----------------------------------------------------------------
    if quick_tasks:
        total_quick = sum(t.durationMinutes for t in quick_tasks)

        # Batch can span multiple blocks
        while quick_tasks:
            used = 0
            batch = []

            for t in list(quick_tasks):
                if used + t.durationMinutes <= blockLength:
                    batch.append(t)
                    used += t.durationMinutes
                    quick_tasks.remove(t)
                else:
                    break

            append_work_block(plan, blockId, used, batch)
            blockId += 1

            # RULE B2 & B3: No break after micro-block unless substantial
            maybe_add_break(used)

    # -----------------------------------------------------------------
    # Step 4: Remaining normal tasks
    # -----------------------------------------------------------------
    while normal_tasks:

        block_tasks = []
        used = 0

        while normal_tasks:
            t = normal_tasks.pop(0)

            if used + t.durationMinutes <= blockLength:
                # Fits fully
                block_tasks.append(t)
                used += t.durationMinutes
            else:
                # Split
                remaining = t.durationMinutes - (blockLength - used)
                split_dur = blockLength - used

                if split_dur > 0:
                    # compute totalParts based on current (original for this task)
                    total_parts = math.ceil(t.durationMinutes / blockLength)
                    if t.id not in task_split_meta:
                        task_split_meta[t.id] = {"totalParts": total_parts, "nextPart": 1}
                    meta = task_split_meta[t.id]

                    split_info = {
                        "originalTaskId": t.id,
                        "part": meta["nextPart"],
                        "totalParts": meta["totalParts"]
                    }
                    meta["nextPart"] += 1

                    block_tasks.append(t)  # same task id
                    append_work_block(plan, blockId, split_dur, [t], split_info)

                    blockId += 1

                # Put remainder back
                t.durationMinutes = remaining
                normal_tasks.insert(0, t)
                break

        if used > 0:
            append_work_block(plan, blockId, used, block_tasks)
            blockId += 1

            # Break rules
            maybe_add_break(used)

    # -----------------------------------------------------------------
    # SESSION END — No break added here
    # -----------------------------------------------------------------

    totalDuration = sum(block.durationMinutes for block in plan)

    return PlanGenerateResponse(
        blocks=plan,
        totalDurationMinutes=totalDuration,
        totalBlocks=len(plan),
        quickTaskUsed=quick_task_used
    )

@router.post("/regenerate", response_model=PlanRegenerateResponse)
def regenerate_plan(payload: PlanRegenerateRequest):

    import random

    # ---------------------------------------------------------
    # 1. Prepare randomness + seed
    # ---------------------------------------------------------
    seed = payload.seed if payload.seed is not None else random.randint(1, 999999)
    random.seed(seed)

    tasks = payload.tasks[:]  # shallow copy
    randomness = payload.randomness
    explanation = []

    # ---------------------------------------------------------
    # Load categories safely
    # ---------------------------------------------------------
    categories = load_categories()

    # ---------------------------------------------------------
    # 2. NOISY SCORE — proportional noise, affects ALL tasks  
    # This allows reordering even when scores differ by 1 point.
    # ---------------------------------------------------------
    def noisy_score(task):
        base = compute_score(task)
        # noise scaled by base, so higher score → more potential movement
        noise = random.uniform(-randomness, randomness) * base
        return base + noise

    # Sort all tasks by noisy score
    tasks = sorted(tasks, key=lambda t: noisy_score(t), reverse=True)
    explanation.append("Applied proportional noisy scoring to reorder tasks.")

    # ---------------------------------------------------------
    # 3. Optional: pick a different quick-start task
    # ---------------------------------------------------------
    if payload.allowDifferentQuickTask:
        quick_candidates = [t for t in tasks if is_quick_task(t)]
        if len(quick_candidates) > 1:
            random.shuffle(quick_candidates)
            explanation.append("Shuffled quick-task candidates for variation.")

    # ---------------------------------------------------------
    # 4. Random small swaps inside same-category neighbors
    #    (preserves heuristics but creates meaningful variants)
    # ---------------------------------------------------------
    def random_category_swaps(task_list):
        new_list = task_list[:]
        for i in range(len(new_list) - 1):
            catA = get_task_category(new_list[i], categories)
            catB = get_task_category(new_list[i+1], categories)

            # Only swap if same category AND randomness threshold met
            if catA == catB and random.random() < (randomness * 0.5):
                new_list[i], new_list[i+1] = new_list[i+1], new_list[i]
                explanation.append(f"Swapped two '{catA}' tasks for variation.")
        return new_list

    tasks = random_category_swaps(tasks)

    # ---------------------------------------------------------
    # 5. Micro-task shuffle preparation
    #    (your /generate logic does batching internally)
    # ---------------------------------------------------------
    # Here we simply shuffle all quick tasks BEFORE generate uses them.
    # generate_plan will still form proper micro batches.
    quick_ts = [t for t in tasks if is_quick_task(t)]
    if len(quick_ts) > 1:
        random.shuffle(quick_ts)
        explanation.append("Shuffled micro-task order to vary batch arrangement.")

    # Reinsert shuffled quick tasks in place
    shuffled_tasks = []
    q_index = 0
    for t in tasks:
        if is_quick_task(t):
            shuffled_tasks.append(quick_ts[q_index])
            q_index += 1
        else:
            shuffled_tasks.append(t)
    tasks = shuffled_tasks

    # ---------------------------------------------------------
    # 6. Re-run the original generate logic on modified task list
    # ---------------------------------------------------------
    regenerated_plan = generate_plan(PlanGenerateRequest(tasks=tasks), preserve_order=True)

    # ---------------------------------------------------------
    # 7. Return extended regenerate response
    # ---------------------------------------------------------
    return PlanRegenerateResponse(
        blocks=regenerated_plan.blocks,
        totalDurationMinutes=regenerated_plan.totalDurationMinutes,
        totalBlocks=regenerated_plan.totalBlocks,
        quickTaskUsed=regenerated_plan.quickTaskUsed,

        seedUsed=seed,
        variationExplanation=", ".join(explanation)
    )

# Helper functions

def compute_score(task: Task):
    return (task.priority * 2) + task.difficulty


def sort_tasks(tasks: List[Task]) -> List[Task]:
    return sorted(
        tasks,
        key=lambda t: (compute_score(t), t.durationMinutes),
        reverse=True
    )


def is_quick_task(task: Task):
    return task.durationMinutes <= 10


def append_work_block(plan, blockId, duration, tasks, split_info=None):
    plan.append(
        PlanBlock(
            blockId=blockId,
            type="work",
            durationMinutes=duration,
            tasks=[t.id for t in tasks],
            splitInfo=split_info,
        )
    )


def append_break_block(plan, blockId, duration):
    plan.append(
        PlanBlock(
            blockId=blockId,
            type="break",
            durationMinutes=duration,
            tasks=[],
            splitInfo=None,
        )
    )


def split_task(task: Task, chunk: int):
    """Return (split_duration, remaining_task_or_None)"""
    if task.durationMinutes <= chunk:
        return task.durationMinutes, None

    return chunk, Task(
        id=task.id,
        name=task.name,
        description=task.description,
        priority=task.priority,
        difficulty=task.difficulty,
        durationMinutes=task.durationMinutes - chunk,
        status=task.status
    )

def get_task_category(task, categories):
    """
    Returns the highest-scoring category for this task.
    If no match => 'other'
    """

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

def apply_context_grouping(tasks, categories):
    """
    Allows a task to move DOWN by 1 position if category matches task below it.
    Never moves tasks upward.
    """

    if not categories:
        return tasks  # still safe if nothing loaded

    if len(tasks) < 3:
        return tasks  # too small to matter

    new_tasks = tasks[:]  # copy

    for i in range(len(new_tasks) - 2):
        current = new_tasks[i]
        next1 = new_tasks[i + 1]
        next2 = new_tasks[i + 2]

        cat0 = get_task_category(current, categories)
        cat1 = get_task_category(next1, categories)
        cat2 = get_task_category(next2, categories)

        # If next1 doesn't match but next2 DOES -> swap next1 <-> next2
        if cat0 == cat2 and cat0 != cat1:
            new_tasks[i + 1], new_tasks[i + 2] = new_tasks[i + 2], new_tasks[i + 1]

    return new_tasks