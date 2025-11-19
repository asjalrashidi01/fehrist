"use client"

import React, { useEffect, useMemo } from "react"
import { Sidebar } from "../../components/home/Sidebar"
import { LogoHeader } from "../../components/home/LogoHeader"
import { Button } from "../../components/ui/button"
import { RefreshCw, Play } from "lucide-react"
import { useRouter } from "next/navigation"
import { useTaskStore } from "../../store/store"
import { PlanBlock } from "../../components/plan/PlanBlock"

export default function PlanPage() {
  const router = useRouter()
  const {
    plan,
    setPlan,
    setPlanError,
    setRegenerating,
    setSecureLoadingToken,
    tasks: localTasks,
  } = useTaskStore()

  // Redirect if page loaded without a plan
  useEffect(() => {
    if (!plan) {
      router.replace("/")
    }
  }, [plan, router])

  if (!plan) return null

  // Map taskId -> Task
  const tasksById = useMemo(() => {
    return localTasks.reduce<Record<string, any>>((map, t) => {
      map[t.id] = t
      return map
    }, {})
  }, [localTasks])

  // Work-only numbering for Focus Sprints
  const numberedBlocks = useMemo(() => {
    let sprintIndex = 1
    return plan.blocks.map((block) => {
      if (block.type === "work") {
        return { ...block, displayIndex: sprintIndex++ }
      }
      return block
    })
  }, [plan.blocks])

  const hours = Math.floor(plan.totalDurationMinutes / 60)
  const minutes = plan.totalDurationMinutes % 60
  const durationLabel = `${hours > 0 ? `${hours}h ` : ""}${minutes}m total`

  // Regenerate handler
  async function handleRegenerate() {
    setRegenerating(true)

    const token = crypto.randomUUID()
    setSecureLoadingToken(token)
    router.replace(`/loading?type=regenerate&key=${token}`)

    try {
      const res = await fetch("/api/plan/regenerate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tasks: localTasks,
          randomness: 0.35,
        }),
      })

      if (!res.ok) throw new Error("Regenerate error")
      const data = await res.json()

      setPlan(data)
    } catch (err) {
      console.error(err)
      setPlanError("Unable to regenerate plan")
    } finally {
      setRegenerating(false)
    }
  }

  return (
    <div className="flex h-screen">
      <Sidebar />

      <main className="flex flex-col w-screen px-8 pb-12 bg-background overflow-y-auto">
        <LogoHeader />

        <div className="w-full max-w-6xl mx-auto mt-10">
          <h1 className="text-4xl font-semibold text-highlight tracking-tight mt-32">
            Your Game Plan
          </h1>

          <p className="mt-2 text-muted-foreground">
            A personalized workflow designed to help you focus, flow, and finish strong.  
            {plan.totalBlocks} steps • {durationLabel}
          </p>

          <div className="flex items-center gap-4 mt-6">
            <Button
              variant="default"
              size="lg"
              className="cursor-pointer h-10"
              onClick={() => {}}
            >
              <Play className="w-4 h-4" />
              Start Plan
            </Button>

            <Button
              variant="ai"
              size="lg"
              className="cursor-pointer h-10"
              onClick={handleRegenerate}
            >
              <RefreshCw className="h-4 w-4" />
              Regenerate
            </Button>
          </div>

          {/* Blocks */}
          <div className="mt-8 space-y-6">
            {numberedBlocks.map((block) => (
              <PlanBlock
                key={block.blockId}
                block={block}
                tasksById={tasksById}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}