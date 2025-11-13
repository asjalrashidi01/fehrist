"use client"

import { useTaskStore } from "../../store/store"
import { TaskItem } from "./TaskItem"

export function TaskList() {
  const { tasks } = useTaskStore()
  const totalMinutes = tasks.reduce((acc, t) => acc + t.durationMinutes, 0)

  return (
    <div className="flex flex-col gap-3 items-center w-full max-w-6xl">
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} />
      ))}
      <div className="flex justify-between w-full text-muted-foreground pt-2">
        <span>{tasks.length} tasks</span>
        <span>
          {Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m
        </span>
      </div>
    </div>
  )
}