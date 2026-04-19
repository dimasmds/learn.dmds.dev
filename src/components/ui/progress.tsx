import * as React from "react"
import { cn } from "@/lib/utils"

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "relative h-4 w-full overflow-hidden rounded-[var(--radius-common)] border-2 border-[var(--color-border)] bg-secondary-background shadow-[var(--shadow-x)_var(--shadow-y)_var(--shadow-blur)_var(--shadow-spread)_var(--color-shadow)]",
        className
      )}
      {...props}
    >
      <div
        className="h-full bg-main transition-all duration-300 ease-in-out rounded-sm"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  )
)
Progress.displayName = "Progress"

export { Progress }
