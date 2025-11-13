import { create } from "zustand"
import { nanoid } from "nanoid"
import { Task, Priority, Difficulty, Status } from "../lib/types/task"

interface TaskState {
  tasks: Task[]
  addTask: (task: Omit<Task, "id" | "completed">) => void
  toggleComplete: (id: string) => void
  deleteTask: (id: string) => void
}

export const useTaskStore = create<TaskState>((set) => ({
  tasks: [
    {
      id: nanoid(),
      name: "Review quarterly budget report",
      description: "Analyze Q3 expenses and prepare presentation for stakeholders",
      priority: Priority.High,
      difficulty: Difficulty.Medium,
      durationMinutes: 150,
      status: Status.Added,
    },
    {
      id: nanoid(),
      name: "Research AI integration options",
      description: "Explore potential tools for workflow automation",
      priority: Priority.Low,
      difficulty: Difficulty.Hard,
      durationMinutes: 180,
      status: Status.Added,
    },
  ],
  addTask: (task) =>
    set((state) => ({
      tasks: [...state.tasks, { ...task, id: nanoid(), status: Status.Added }],
    })),
  toggleComplete: (id) =>
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id ? { ...t, status: Status.Completed } : t
      ),
    })),
  deleteTask: (id) =>
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id ? { ...t, status: Status.Deleted } : t
      ),
    }))
}))