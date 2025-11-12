import { ThemeToggle } from "@/components/theme-toggle"

export default function HomePage() {
  return (
    <main className="flex flex-col items-center justify-start min-h-screen px-4 py-12 space-y-10 text-foreground font-[family-name:var(--font-dm-sans)]">
      <div className="flex justify-between items-center w-full max-w-6xl">
        <h1 className="text-5xl font-bold text-primary-foreground tracking-tighter">Your Tasks</h1>
        <h1 className="text-5xl font-light text-primary-foreground">Your Tasks</h1>
        <ThemeToggle />
      </div>

      <p className="text-center font-black text-muted-foreground">
        Focus on what matters most
      </p>
      <p className="text-center font-semibold text-muted-foreground">
        Focus on what matters most
      </p>
    </main>
  )
}