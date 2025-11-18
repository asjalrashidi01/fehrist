import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-accent/20 dark:aria-invalid:ring-accent/40 aria-invalid:border-accent",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        accent: "bg-accent text-accent-foreground hover:bg-accent/90",
        outline:
          "border bg-background shadow-xs hover:bg-surface hover:text-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary: "bg-surface text-surface-foreground hover:bg-surface/80",
        ghost:
          "hover:bg-surface hover:text-foreground dark:hover:bg-surface/50",
        sidebar: "hover:bg-background hover:text-foreground",
        sidebaraccent: "hover:bg-background hover:text-accent",
        card: "hover:text-foreground",
        cardaccent: "hover:text-accent",
        ai: `
          relative
          text-highlight font-semibold
          transition-all duration-300

          /* Gradient — darker in light mode so it’s visible */
          bg-gradient-to-r
          from-ai-primary/40 to-ai-secondary/40
          dark:from-ai-primary/20 dark:to-ai-secondary/20

          /* Subtle glass */
          backdrop-blur-md
          border border-white/20 dark:border-white/10

          /* Base glow (same as before) */
          shadow-[0_0_6px_hsla(270,60%,55%,0.35),
                  0_0_10px_hsla(220,60%,60%,0.25)]

          /* Pulse glow (unchanged) */
          animate-[aiPulse_3s_ease-in-out_infinite]

          /* Hover — slightly brighter gradient */
          hover:from-ai-primary/55 hover:to-ai-secondary/55
          dark:hover:from-ai-primary/28 dark:hover:to-ai-secondary/28

          hover:shadow-[0_0_10px_hsla(270,60%,55%,0.45),
                        0_0_16px_hsla(220,60%,60%,0.35)]

          hover:scale-105
        `,
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
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
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
