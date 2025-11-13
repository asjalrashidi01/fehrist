"use client"

import { Sidebar } from "../components/home/Sidebar"
import { LogoHeader } from "../components/home/Logo"
import { TaskForm } from "../components/home/TaskForm"
import { TaskList } from "../components/home/TaskList"

export default function HomePage() {
  return (
    <div className="flex h-screen overflow-hidden transition-colors duration-300">
      <Sidebar />
      <main className="flex flex-col items-center w-screen px-8 space-y-10 bg-background">
        <LogoHeader />

        <h1 className="text-5xl font-semibold text-highlight tracking-tight text-center mb-24">
          What do you want to accomplish today?
        </h1>

        <TaskForm />
        <TaskList />
      </main>
    </div>
  )
}