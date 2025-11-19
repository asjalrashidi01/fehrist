"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import { nanoid } from "nanoid"
import { Task, Priority, Difficulty, Status } from "../lib/types/task"

// New interfaces
interface PlanBlock {
  blockId: number
  type: "work" | "break"
  durationMinutes: number
  tasks: string[]
  splitInfo?: any
}

interface Plan {
  blocks: PlanBlock[]
  totalDurationMinutes: number
  totalBlocks: number
  quickTaskUsed: boolean
  seedUsed?: number
  variationExplanation?: string
}

interface TaskState {
  tasks: Task[]
  addTask: (task: Omit<Task, "id" | "status">) => void
  toggleComplete: (id: string) => void
  deleteTask: (id: string) => void

  // PLAN
  plan: Plan | null
  setPlan: (plan: Plan) => void
  clearPlan: () => void

  // LOADING STATES
  isGenerating: boolean
  isRegenerating: boolean
  setGenerating: (v: boolean) => void
  setRegenerating: (v: boolean) => void

  // PROTECTED LOADING TOKEN
  secureLoadingToken: string | null
  setSecureLoadingToken: (token: string) => void
  clearSecureLoadingToken: () => void

  // ERRORS
  planError: string | null
  setPlanError: (msg: string | null) => void
  clearPlanError: () => void
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      // -----------------------------
      // TASKS (Persisted)
      // -----------------------------
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

      // -----------------------------
      // PLAN (Not persisted)
      // -----------------------------
      plan: null,
      setPlan: (plan) => set({ plan }),
      clearPlan: () => set({ plan: null }),

      // -----------------------------
      // GENERATION STATES
      // -----------------------------
      isGenerating: false,
      isRegenerating: false,

      setGenerating: (v) => set({ isGenerating: v }),
      setRegenerating: (v) => set({ isRegenerating: v }),

      // -----------------------------
      // PROTECTED LOADING TOKEN
      // -----------------------------
      secureLoadingToken: null,

      setSecureLoadingToken: (token: string) =>
        set({ secureLoadingToken: token }),

      clearSecureLoadingToken: () =>
        set({ secureLoadingToken: null }),

      // -----------------------------
      // ERROR HANDLING
      // -----------------------------
      planError: null,
      setPlanError: (msg) => set({ planError: msg }),
      clearPlanError: () => set({ planError: null }),
    }),

    {
      name: "fehrist-tasks", // ONLY tasks persist
      partialize: (state) => ({
        tasks: state.tasks, // only persist tasks
      }),
    }
  )
)