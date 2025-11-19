"use client"

import React, { useEffect, useState } from "react"
import { Clock, Leaf } from "lucide-react"
import { cn } from "@/lib/utils"
import { Task } from "@/lib/types/task"
import { useTheme } from "next-themes"

interface PlanBlockProps {
  block: {
    blockId: number
    type: "work" | "break"
    durationMinutes: number
    tasks: string[]
    splitInfo?: any
    displayIndex?: number
  }
  tasksById: Record<string, Task | undefined>
}

export function PlanBlock({ block, tasksById }: PlanBlockProps) {
  const isWork = block.type === "work"

  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  const Icon = isWork ? Clock : Leaf
  const title = isWork
    ? `Focus Sprint ${block.displayIndex}`
    : "Recharge Break"

  const breakSubtitle = "Take a moment to reset."

  const breakTint = "bg-surface/40 dark:bg-surface/50"
  const workTint = "bg-surface/60 dark:bg-surface"

  return (
    <div
      className={cn(
        "w-full max-w-6xl rounded-xl p-5 shadow-md relative",
        isWork ? workTint : breakTint
      )}
    >
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-muted/40 flex items-center justify-center">
            <Icon className="w-5 h-5 text-muted-foreground" />
          </div>

          <div className="flex flex-col">
            <h4 className="font-semibold text-lg">{title}</h4>
          </div>
        </div>

        <span className="text-sm text-muted-foreground font-medium">
          {block.durationMinutes} min
        </span>
      </div>

      {/* 🟪 Divider under header */}
      <div className="h-px bg-muted/30 mt-4 mb-3" />

      {/* BREAK BLOCK → subtitle shown like a task row */}
      {!isWork && (
        <div className="flex flex-col gap-3 mt-1">
          <div className="flex items-center justify-between bg-background/5 px-3 py-2 rounded-md">
            <span className="text-sm font-medium text-muted-foreground">
              {breakSubtitle}
            </span>
          </div>
        </div>
      )}

      {/* WORK BLOCK */}
      {isWork && (
        <div className="mt-1 flex flex-col gap-3">
          {block.tasks.map((taskId) => {
            const t = tasksById[taskId]
            if (!t) return null

            let partBadge = ""
            if (
              block.splitInfo &&
              block.splitInfo.originalTaskId === taskId
            ) {
              partBadge = `Part ${block.splitInfo.part} of ${block.splitInfo.totalParts}`
            }

            return (
              <div
                key={taskId}
                className="flex flex-col bg-background/5 px-3 py-2 rounded-md text-muted-foreground"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{t.name}</span>

                  {partBadge && (
                    <span
                      className={cn(
                        "text-xs px-2 py-1 rounded-md font-medium",
                        theme === "light" &&
                          "bg-[#b280e8]/40 text-[#351757]",
                        theme === "dark" &&
                          "bg-[#7449a1]/40 text-[#baaec5]"
                      )}
                    >
                      {partBadge}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}