"use client"

import { useTaskStore } from "../../store/store"
import { Status, Task } from "../../lib/types/task"
import { Trash } from "lucide-react"
import { Button } from "../ui/button"

export function TaskItem({ task }: { task: Task }) {
  const { toggleComplete, deleteTask } = useTaskStore()

  return (
    <div className="flex justify-between items-center w-full max-w-6xl bg-surface/35 rounded-xl p-4">
      <div>
        <h3
          className={`font-semibold ${
            task.status === Status.Completed ? "line-through text-muted-foreground" : ""
          }`}
        >
          {task.name}
        </h3>
        <p className="text-sm text-muted-foreground">{task.description}</p>
      </div>
      <div className="flex items-center gap-4">
        <span className="capitalize">{task.priority}</span>
        <button
          onClick={() => toggleComplete(task.id)}
          className="border rounded-full p-1 text-xs"
        >
          {task.status === Status.Completed ? "✓" : "○"}
        </button>
        {/* <Trash
          className="cursor-pointer opacity-60 hover:opacity-100 hover:"
          onClick={() => deleteTask(task.id)}
        /> */}
        <Button
          variant="cardaccent"
          size="icon"
          className="cursor-pointer transition-colors duration-200 rounded-2xl"
          aria-label="Logout"
        >
          <Trash
          className="cursor-pointer opacity-60 hover:opacity-100 hover:"
          onClick={() => deleteTask(task.id)}
        />
        </Button>
      </div>
    </div>
  )
}