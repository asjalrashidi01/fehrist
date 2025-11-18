"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import { nanoid } from "nanoid"
import { Task, Priority, Difficulty, Status } from "../lib/types/task"

interface TaskState {
  tasks: Task[]
  addTask: (task: Omit<Task, "id" | "status">) => void
  toggleComplete: (id: string) => void
  deleteTask: (id: string) => void
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [],

      addTask: (task) =>
        set((state) => ({
          tasks: [
            ...state.tasks,
            {
              ...task,
              id: nanoid(),
              status: Status.Added,
            },
          ],
        })),

      toggleComplete: (id) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id
              ? {
                  ...t,
                  status:
                    t.status === Status.Completed
                      ? Status.Added
                      : Status.Completed,
                }
              : t
          ),
        })),

      deleteTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id),
        })),
      }),

    {
      name: "fehrist-tasks",
    }
  )
)