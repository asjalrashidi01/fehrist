"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useTaskStore } from "../../store/store"
import { motion, AnimatePresence } from "framer-motion"

export default function LoadingScreen() {
  const params = useSearchParams()
  const router = useRouter()

  const type = params.get("type") // "generate" or "regenerate"
  const key = params.get("key")

  const {
    secureLoadingToken,
    clearSecureLoadingToken,
    plan,
  } = useTaskStore()

  // 1 — Protection: block direct access
  useEffect(() => {
    if (!secureLoadingToken || secureLoadingToken !== key) {
      router.replace("/")
    }
  }, [secureLoadingToken, key, router])

  const [index, setIndex] = useState(0)
  const [minimumTimePassed, setMinimumTimePassed] = useState(false)

  // ----------------------------------------
  // PHRASES
  // ----------------------------------------
  const generatePhrases = [
    "Analyzing your tasks…",
    "Optimizing your day…",
    "Creating your plan…",
  ]

  const regeneratePhrase = ["Getting a new plan for you…"]

  const phrases = type === "regenerate" ? regeneratePhrase : generatePhrases

  // ----------------------------------------
  // PHRASE CYCLING
  // ----------------------------------------
  useEffect(() => {
    // Regeneration → no cycling
    if (type === "regenerate") return

    // Generation → cycle every 2.5s
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % phrases.length)
    }, 2500)

    return () => clearInterval(interval)
  }, [type, phrases.length])

  // ----------------------------------------
  // MINIMUM LOADING TIME
  // ----------------------------------------
  useEffect(() => {
    const delay = type === "regenerate" ? 3000 : 7500

    const timer = setTimeout(() => {
      setMinimumTimePassed(true)
    }, delay)

    return () => clearTimeout(timer)
  }, [type])

  // ----------------------------------------
  // REDIRECT WHEN READY
  // ----------------------------------------
  useEffect(() => {
    if (!plan) return
    if (!minimumTimePassed) return

    router.replace("/plan")

    // Clear token AFTER navigation completes
    setTimeout(() => {
      clearSecureLoadingToken()
    }, 500)
  }, [plan, minimumTimePassed, clearSecureLoadingToken, router])

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-background text-highlight">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.6 }}
          className="text-2xl sm:text-3xl font-semibold text-center px-6 max-w-lg"
        >
          {phrases[index]}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}