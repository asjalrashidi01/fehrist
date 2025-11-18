"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export function LogoHeader() {
  const { theme, systemTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return (
      <div
        className="
          fixed top-0 left-[4.5rem]  /* sidebar width = 18 = 4.5rem */
          right-0 z-30               /* stays behind sidebar */
          border-b border-border
          bg-background/80 backdrop-blur-xl
          px-12 py-4 flex justify-start
        "
      >
        <div className="h-8 w-24 bg-muted rounded animate-pulse" />
      </div>
    )
  }

  const currentTheme = theme === "system" ? systemTheme : theme

  const light_logo_src = "/logo_light.svg"
  const dark_logo_src = "/logo_dark.svg"
  const logoSrc = currentTheme === "dark" ? dark_logo_src : light_logo_src

  return (
    <>
      {/* FIXED HEADER BAR */}
      <div
        className="
          fixed top-0 left-[4.5rem] right-0 /* offset for sidebar */
          z-30                             /* stays behind sidebar */
          border-b border-border
          bg-background/80 backdrop-blur-xl
          px-2 py-2 flex justify-start items-center
        "
      >
        <img
          src={logoSrc}
          alt="Fehrist logo"
          className="h-13 w-auto transition-opacity duration-300"
        />
      </div>
    </>
  )
}