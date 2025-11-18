"use client"

import { useState, useEffect } from "react"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { cn } from "@/lib/utils"

export function TimeInput({
  value,
  onChange,
  error,
  shake
}: {
  value: number | null
  onChange: (minutes: number) => void
  error?: boolean
  shake?: boolean
}) {
  const [hours, setHours] = useState<number | null>(null)
  const [minutes, setMinutes] = useState<number | null>(null)

  // 🔥 Reset hours/minutes when parent resets durationMinutes
  useEffect(() => {
    if (value === null) {
      setHours(null)
      setMinutes(null)
    }
  }, [value])

  // Compute value only when both fields chosen
  useEffect(() => {
    if (hours !== null && minutes !== null) {
      onChange(hours * 60 + minutes)
    }
  }, [hours, minutes])

  const minuteOptions = Array.from({ length: 12 }, (_, i) => i * 5)

  return (
    <div className="flex items-center gap-3">

      {/* Hours */}
      <Select
        value={hours !== null ? String(hours) : ""}
        onValueChange={(v) => setHours(Number(v))}
      >
        <SelectTrigger className={cn(
          "h-12 rounded-xl w-28",
          error && "border-accent",
          shake && "shake"
        )}>
          <SelectValue placeholder="Hours" />
        </SelectTrigger>
        <SelectContent className="bg-surface rounded-md border border-border shadow-md">
          {Array.from({ length: 13 }, (_, i) => (
            <SelectItem key={i} value={String(i)}>{i} hr</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Minutes */}
      <Select
        value={minutes !== null ? String(minutes) : ""}
        onValueChange={(v) => setMinutes(Number(v))}
      >
        <SelectTrigger className={cn(
          "h-12 rounded-xl w-28",
          error && "border-accent",
          shake && "shake"
        )}>
          <SelectValue placeholder="Minutes" />
        </SelectTrigger>
        <SelectContent className="bg-surface rounded-md border border-border shadow-md">
          {minuteOptions.map((m) => (
            <SelectItem key={m} value={String(m)}>{m} min</SelectItem>
          ))}
        </SelectContent>
      </Select>

    </div>
  )
}