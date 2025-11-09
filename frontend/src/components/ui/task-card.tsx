import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface TaskCardProps {
  title: string
  description?: string
  status?: "default" | "urgent" | "complete"
}

export function TaskCard({ title, description, status = "default" }: TaskCardProps) {
  const colorStyles = {
    urgent: "bg-[#9E2105]/20 border-[#9E2105]/40",
    complete: "bg-[#24381A]/25 border-[#24381A]/40 line-through opacity-80",
    default: "bg-muted/30 border-border/40",
  }

  return (
    <Card
      className={cn(
        "w-full transition-all duration-300 hover:translate-y-[-2px] hover:shadow-[0_6px_20px_rgba(0,0,0,0.2)]",
        colorStyles[status]
      )}
    >
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
    </Card>
  )
}