import * as React from "react"
import { cn } from "@/lib/utils"

const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-[var(--radius-common)] border-2 border-[var(--color-border)] bg-secondary-background px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-foreground/50 focus:outline-none focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-none shadow-[var(--shadow-x)_var(--shadow-y)_var(--shadow-blur)_var(--shadow-spread)_var(--color-shadow)] transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Input.displayName = "Input"

export { Input }
