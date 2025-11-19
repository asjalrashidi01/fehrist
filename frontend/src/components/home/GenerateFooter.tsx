"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { Button } from "../ui/button"
import { Sparkles } from "lucide-react"
import { useTaskStore } from "../../store/store"
import { useRouter } from "next/navigation"

export function GenerateFooter() {
  const { theme, systemTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  const {
    tasks,
    setGenerating,
    setPlan,
    setPlanError,
    setSecureLoadingToken,
  } = useTaskStore()

  useEffect(() => setMounted(true), [])

  // ------------------------
  // HANDLE GENERATE CLICK
  // ------------------------
  async function handleGenerate() {
  if (tasks.length === 0) return

  const token = crypto.randomUUID()
  setSecureLoadingToken(token)

  // open loading screen with replace
  router.replace(`/loading?type=generate&key=${token}`)

  setGenerating(true)

  try {
    const res = await fetch("/api/plan/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tasks }),
    })

    const data = await res.json()
    setPlan(data)   // only set plan, do NOT redirect
  } catch (err) {
    setPlanError("Could not generate plan.")
  } finally {
    setGenerating(false)
  }
}

  // ------------------------
  // SKELETON (same as before)
  // ------------------------
  if (!mounted) {
    return (
      <div
        className="
          fixed bottom-0 left-[4.5rem] right-0
          border-t border-border 
          px-12 py-4
          bg-background/95
          z-40
        "
      >
        <div className="flex justify-between items-center">
          <div className="h-6 w-48 bg-muted rounded animate-pulse" />
          <div className="h-10 w-32 bg-muted rounded animate-pulse" />
        </div>
      </div>
    )
  }

  const currentTheme = theme === "system" ? systemTheme : theme

  return (
    <div
      className="
        fixed bottom-0 left-[4.5rem] right-0
        px-6 py-2
        border-t border-border
        bg-background/95
        z-40
      "
    >
      <div className="flex max-w-6xl mx-auto items-center justify-between">
        <span className="text-foreground text-md font-normal">
          Add your tasks, no matter how big or small. When you're ready, we'll curate a game plan you can follow.
        </span>

        <Button
          variant="ai"
          size="lg"
          className="cursor-pointer h-8"
          onClick={handleGenerate}
        >
          <Sparkles className="h-3 w-4" />
          Create My Game Plan
        </Button>
      </div>
    </div>
  )
}