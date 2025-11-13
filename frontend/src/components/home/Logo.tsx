"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

import image from "../../../public/logo_light.svg"

export function LogoHeader() {
  const { theme, systemTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch
  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return (
      <div className="w-screen border-b border-border py-4 flex justify-center">
        <div className="flex items-center gap-3">
          <div className="h-8 w-24 bg-muted rounded animate-pulse" />
        </div>
      </div>
    )
  }

  // Use system theme if theme === "system"
  const currentTheme = theme === "system" ? systemTheme : theme

  const light_logo_src = "/logo_light.svg"
  const dark_logo_src = "/logo_dark.svg"
  const logoSrc =
    currentTheme === "dark" ? dark_logo_src : light_logo_src

  return (
    <div className="w-screen px-8 py-4 mb-48 border-b border-border flex justify-start">
      <img
          src={logoSrc}
          alt="Fehrist logo"
          className="h-13 w-auto transition-opacity duration-300"
        />
    </div>
  )
}