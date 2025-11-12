"use client"

import { Sidebar } from "@/components/layout/Sidebar"

export default function HomePage() {
  return (
    <div className="flex h-screen overflow-hidden transition-colors duration-300">
      <Sidebar />
      <main className="flex flex-col overflow-y-auto items-center justify-start min-h-screen w-screen px-4 py-12 space-y-10 bg-background font-(family-name:--font-dm-sans)">
        <div className="flex flex-col justify-between items-start w-full max-w-6xl">
          <h1 className="text-5xl font-bold text-highlight tracking-tighter">
            Your Tasks
          </h1>
          <h1 className="text-5xl font-light text-highlight">
            Your Tasks
          </h1>
        </div>

        <p className="text-center font-black text-muted-foreground">
          Focus on what matters most
        </p>
        <p className="text-center font-semibold text-muted-foreground">
          Focus on what matters most
        </p>
      </main>
    </div>
  )
}