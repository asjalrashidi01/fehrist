"use client"

import { Sidebar } from "../components/home/Sidebar"
import { LogoHeader } from "../components/home/LogoHeader"
import { TaskForm } from "../components/home/TaskForm"
import { TaskList } from "../components/home/TaskList"
import { GenerateFooter } from "../components/home/GenerateFooter"
import { useTaskStore } from "../store/store"

export default function HomePage() {
  const { tasks } = useTaskStore()

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex flex-col items-center w-screen px-8 space-y-10 bg-background overflow-y-auto">
        <LogoHeader />

        <h1 className="text-5xl font-semibold text-highlight text-shadow tracking-tight text-center mb-6 mt-40">
          Feeling overwhelmed by everything you need to do?
        </h1>

        <p className="text-lg italic font-light text-highlight/70 drop-shadow-sm text-center mb-12">
          Let us know what’s on your mind. Our optimized Fehrist (from Urdu, meaning “list”) organizes the rest for you.
        </p>

        <TaskForm />
        <TaskList />

        <GenerateFooter />
      </main>
    </div>
  )
}