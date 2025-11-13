"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue
} from "@/components/ui/select"

import { useTaskStore } from "../../store/store"
import { Priority, Difficulty } from "@/lib/types/task"

export function TaskForm() {
  const { addTask } = useTaskStore()

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState<Priority>(Priority.Medium)
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.Medium)
  const [durationMinutes, setDurationMinutes] = useState(60)

  const handleAdd = () => {
    if (!name.trim()) return

    addTask({
      name,
      description,
      priority,
      difficulty,
      durationMinutes,
      status: undefined!, // store sets Status.Added
    })

    // Reset fields
    setName("")
    setDescription("")
    setPriority(Priority.Medium)
    setDifficulty(Difficulty.Medium)
    setDurationMinutes(60)
  }

  return (
    <div className="w-full max-w-6xl flex flex-col gap-4 rounded-xl p-6 bg-surface/20 border border-border mb-24">

      {/* Top: Name + Duration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Input
          placeholder="Task name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <Input
          placeholder="Duration (minutes)"
          type="number"
          value={durationMinutes}
          onChange={(e) => setDurationMinutes(Number(e.target.value))}
        />
      </div>

      {/* Description */}
      <Input
        placeholder="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      {/* Dropdown Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

        {/* Priority Dropdown */}
        <Select
          value={String(priority)}
          onValueChange={(v) => setPriority(Number(v) as Priority)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={String(Priority.Low)}>Low</SelectItem>
            <SelectItem value={String(Priority.Medium)}>Medium</SelectItem>
            <SelectItem value={String(Priority.High)}>High</SelectItem>
          </SelectContent>
        </Select>

        {/* Difficulty Dropdown */}
        <Select
          value={String(difficulty)}
          onValueChange={(v) => setDifficulty(Number(v) as Difficulty)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={String(Difficulty.Easy)}>Easy</SelectItem>
            <SelectItem value={String(Difficulty.Medium)}>Medium</SelectItem>
            <SelectItem value={String(Difficulty.Hard)}>Hard</SelectItem>
          </SelectContent>
        </Select>

        {/* Add Task Button */}
        <Button
          className="col-span-2 md:col-span-1"
          onClick={handleAdd}
        >
          Add Task
        </Button>

        {/* Generate Button */}
        <Button
          variant="secondary"
          className="col-span-2 md:col-span-1"
        >
          Generate
        </Button>
      </div>
    </div>
  )
}