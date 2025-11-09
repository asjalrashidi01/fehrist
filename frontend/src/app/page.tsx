import { Button } from "@/components/ui/button"
import { TaskCard } from "@/components/ui/task-card"
import { ThemeToggle } from "@/components/theme-toggle"

export default function HomePage() {
  return (
    <main className="flex flex-col items-center justify-start min-h-screen px-4 py-12 space-y-10 bg-background text-foreground font-[family-name:var(--font-dm-sans)]">
      <div className="flex justify-between items-center w-full max-w-2xl">
        <h1 className="text-4xl font-bold text-primary-foreground">Your Tasks</h1>
        <ThemeToggle />
      </div>

      <p className="text-center font-bold text-muted-foreground">
        Focus on what matters most
      </p>
      <p className="text-center font-semibold text-muted-foreground">
        Focus on what matters most
      </p>

      <div className="flex gap-4">
        <Button variant="outline">+ Add Task</Button>
        <Button variant="gradient">✨ Generate Plan</Button>
      </div>

      <div className="flex flex-col w-full max-w-2xl space-y-4">
        <TaskCard
          title="Review quarterly budget report"
          description="Analyze Q3 expenses and prepare presentation for stakeholders"
          status="urgent"
        />
        <TaskCard
          title="Update project documentation"
          description="Include new API endpoints and deployment procedures"
          status="complete"
        />
        <TaskCard
          title="Team sync meeting preparation"
          description="Prepare agenda items and gather feedback from last sprint"
        />
        <TaskCard
          title="Research AI integration options"
          description="Explore potential tools for workflow automation"
        />
      </div>
    </main>
  )
}