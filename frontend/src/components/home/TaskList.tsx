"use client"

import { useTaskStore } from "../../store/store"
import { TaskItem } from "./TaskItem"

export function TaskList() {
  const { tasks } = useTaskStore()
  const totalMinutes = tasks.reduce((acc, t) => acc + t.durationMinutes, 0)

  return (
    <div className="flex flex-col gap-3 items-center w-full max-w-6xl mb-36">
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} />
      ))}
      {tasks.length > 1 && (
        <div className="flex justify-between w-full text-muted-foreground pt-2">
          <span>{tasks.length} tasks</span>
          <span>
            {Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m
          </span>
        </div>
      )}
      {tasks.length === 1 && (
        <div className="flex justify-between w-full text-muted-foreground pt-2">
          <span>{tasks.length} task</span>
          <span>
            {Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m
          </span>
        </div>
      )}
      {tasks.length === 0 && (
        <div className="flex items-center pt-2">
          <p className="text-md font-light text-muted-foreground/50 text-shadow-sm text-center mt-24 mb-12">
            Uh oh! It looks like you haven't added any tasks yet. Start by adding a task above to see it appear here.
          </p>
        </div>
        
      )}
    </div>
  )
}