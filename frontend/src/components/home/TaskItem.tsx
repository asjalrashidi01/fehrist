"use client"

import { useTaskStore } from "../../store/store"
import { Status, Task, Priority, Difficulty } from "../../lib/types/task"
import { Trash, Circle, CheckCircle } from "lucide-react"
import { Button } from "../ui/button"
import { cn } from "@/lib/utils"

const priorityLabels = {
  [Priority.Low]: "Can wait",
  [Priority.Medium]: "Important",
  [Priority.High]: "Essential",
}

const difficultyLabels = {
  [Difficulty.Easy]: "Easy",
  [Difficulty.Medium]: "Moderate",
  [Difficulty.Hard]: "Challenging",
}

export function TaskItem({ task }: { task: Task }) {
  const { toggleComplete, deleteTask } = useTaskStore()

  const isDone = task.status === Status.Completed

  return (
    <div
      className="
        grid
        [grid-template-columns:1fr_16fr_2fr_2fr_1fr]
        items-center
        w-full max-w-6xl
        bg-surface/60
        rounded-xl
        p-4
        gap-2
        min-h-[80px]
        shadow-md
      "
    >
      {/* Column 1 — Completion (center) */}
      <button
        onClick={() => toggleComplete(task.id)}
        className="justify-self-center cursor-pointer transition-all duration-200 hover:scale-110"
      >
        {isDone ? (
          <CheckCircle className="w-6 h-6 text-primary animate-check-pop" />
        ) : (
          <Circle className="w-6 h-6 text-muted-foreground animate-check-idle" />
        )}
      </button>

      {/* Column 2 — Task Title + Description (left) */}
      <div className="flex flex-col justify-self-start">
        <h3
          className={cn(
            "font-semibold",
            isDone && "line-through text-muted-foreground"
          )}
        >
          {task.name}
        </h3>

        {task.description && (
          <p className="text-sm text-muted-foreground">{task.description}</p>
        )}
      </div>

      {/* Column 3 — Priority (left) */}
      <span className="text-sm text-muted-foreground justify-self-start">
        {priorityLabels[task.priority]}
      </span>

      {/* Column 4 — Difficulty (left) */}
      <span className="text-sm text-muted-foreground justify-self-start">
        {difficultyLabels[task.difficulty]}
      </span>

      {/* Column 5 — Delete (center) */}
      <Button
        variant="cardaccent"
        size="icon"
        onClick={() => deleteTask(task.id)}
        className="justify-self-center cursor-pointer transition-colors duration-200 rounded-2xl"
      >
        <Trash className="opacity-60 hover:opacity-100" />
      </Button>
    </div>
  )
}