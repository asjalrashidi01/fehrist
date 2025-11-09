import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  // Base styles
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-sm font-medium transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 \
   [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 \
   outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-secondary text-secondary-foreground hover:bg-secondary/90",
        destructive:
          "bg-accent text-accent-foreground hover:bg-accent/90 focus-visible:ring-accent/30 dark:focus-visible:ring-accent/50",
        outline:
          "border border-border bg-background text-foreground shadow-xs hover:bg-muted/70 dark:hover:bg-muted/30",
        secondary:
          "bg-muted text-foreground border border-border hover:bg-muted/80",
        ghost:
          "hover:bg-accent/10 hover:text-accent-foreground dark:hover:bg-accent/20",
        link: "text-primary underline-offset-4 hover:underline",

        // ✨ Fehrist gradient magic button (AI)
        gradient:
          "relative overflow-hidden bg-gradient-to-r from-[#E2D3A2] via-[#9E2105] to-[#24381A] text-white shadow-[0_0_20px_rgba(158,33,5,0.4)] hover:shadow-[0_0_30px_rgba(158,33,5,0.6)] \
           bg-[length:200%_auto] hover:bg-[position:100%_center] transition-[background-position,shadow] duration-500 ease-out",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-xl px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }