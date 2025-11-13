export enum Priority {
  Low = 1,
  Medium = 2,
  High = 3,
}

export enum Difficulty {
  Easy = 1,
  Medium = 2,
  Hard = 3,
}

export enum Status {
  Added = 1,
  Completed = 2,
  Deleted = 3,
}

export interface Task {
  id: string
  name: string
  description?: string
  priority: Priority
  difficulty: Difficulty
  durationMinutes: number
  status: Status
}