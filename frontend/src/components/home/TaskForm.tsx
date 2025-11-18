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
import { TimeInput } from "./TimeInput"
import { cn } from "@/lib/utils"

export function TaskForm() {
  const { addTask } = useTaskStore()

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState("")
  const [difficulty, setDifficulty] = useState("")
  const [durationMinutes, setDurationMinutes] = useState<number | null>(null)
  const [showDescription, setShowDescription] = useState(false)

  const [showErrors, setShowErrors] = useState(false)
  const [shakes, setShakes] = useState({
    name: false,
    duration: false,
    priority: false,
    difficulty: false,
  })

  const triggerShake = (field: keyof typeof shakes) => {
    setShakes(prev => ({ ...prev, [field]: false })) // reset
    requestAnimationFrame(() => {
      setShakes(prev => ({ ...prev, [field]: true })) // retrigger
    })
    setTimeout(() => {
      setShakes(prev => ({ ...prev, [field]: false })) // cleanup
    }, 350)
  }

  const handleAdd = () => {

    const missingName = !name.trim()
    const missingDuration = durationMinutes == null
    const missingPriority = priority === ""
    const missingDifficulty = difficulty === ""

    if (missingName || missingDuration || missingPriority || missingDifficulty) {

      if (missingName) triggerShake("name")
      if (missingDuration) triggerShake("duration")
      if (missingPriority) triggerShake("priority")
      if (missingDifficulty) triggerShake("difficulty")

      setShowErrors(true)
      return
    }

    setShowErrors(false)
    
    addTask({
      name,
      description,
      priority: Number(priority) as Priority,
      difficulty: Number(difficulty) as Difficulty,
      durationMinutes: Number(durationMinutes),
    })

    setName("")
    setDescription("")
    setPriority("")
    setDifficulty("")
    setDurationMinutes(null)
    setShowDescription(false)
  }

  return (
    <div className="w-full max-w-6xl mx-auto bg-surface/20 shadow-xl backdrop-blur-sm border border-border/60 rounded-2xl p-5 flex flex-col gap-4 mb-12">

      {/* ================= HERO ROW ================= */}
      <div className="flex gap-3 items-center">
        <Input
          placeholder="Write a task… anything that’s on your mind."
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={cn(
            "flex-grow h-9 rounded-xl text-foreground bg-surface ",
            showErrors && !name.trim() && "border-accent",
            shakes.name && "shake"
          )}
        />

        {/* Duration */}
        <TimeInput
          value={durationMinutes}
          onChange={setDurationMinutes}
          error={showErrors && durationMinutes == null}
          shake={shakes.duration}
        />
      </div>

      {/* ================= REQUIRED FIELDS ================= */}
      <div className="flex items-center justify-center gap-3">

        {/* Priority */}
        <Select value={priority} onValueChange={setPriority}>
          <SelectTrigger
            className={cn(
              "h-12 rounded-xl",
              showErrors && priority === "" && "border-accent",
              shakes.priority && "shake"
            )}
          >
            <SelectValue placeholder="How important is this?" />
          </SelectTrigger>
          <SelectContent className="bg-surface rounded-md border border-border shadow-md">
            <SelectItem value={String(Priority.Low)}>Can wait</SelectItem>
            <SelectItem value={String(Priority.Medium)}>Important</SelectItem>
            <SelectItem value={String(Priority.High)}>Essential</SelectItem>
          </SelectContent>
        </Select>

        {/* Difficulty */}
        <Select value={difficulty} onValueChange={setDifficulty}>
          <SelectTrigger
            className={cn(
              "h-12 rounded-xl",
              showErrors && difficulty === "" && "border-accent",
              shakes.difficulty && "shake"
            )}
          >
            <SelectValue placeholder="How challenging is this?" />
          </SelectTrigger>
          <SelectContent className="bg-surface rounded-md border border-border shadow-md">
            <SelectItem value={String(Difficulty.Easy)}>Easy</SelectItem>
            <SelectItem value={String(Difficulty.Medium)}>Moderate</SelectItem>
            <SelectItem value={String(Difficulty.Hard)}>Challenging</SelectItem>
          </SelectContent>
        </Select>
        
      </div>

      <div className="flex items-center justify-center gap-3">

        <Input
          placeholder="Add some details… or don’t"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="h-9 rounded-xl"
        />

        <div className="flex justify-center">
          <Button 
            className="h-9 px-16 w-40 rounded-xl font-medium text-sm cursor-pointer"
            onClick={handleAdd}
          >
            Add
          </Button>
        </div>
      </div>

    </div>
  )
}