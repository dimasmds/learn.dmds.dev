import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap font-medium transition-all duration-150 rounded-[var(--radius-common)] border-2 border-[var(--color-border)] cursor-pointer disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-main text-main-foreground shadow-[var(--shadow-x)_var(--shadow-y)_var(--shadow-blur)_var(--shadow-spread)_var(--color-shadow)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:translate-x-[4px] active:translate-y-[4px] active:shadow-none",
        outline:
          "bg-secondary-background text-foreground shadow-[var(--shadow-x)_var(--shadow-y)_var(--shadow-blur)_var(--shadow-spread)_var(--color-shadow)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:translate-x-[4px] active:translate-y-[4px] active:shadow-none",
        ghost:
          "border-transparent shadow-none hover:border-2 hover:border-[var(--color-border)] hover:bg-secondary-background",
        destructive:
          "bg-red-600 text-white shadow-[var(--shadow-x)_var(--shadow-y)_var(--shadow-blur)_var(--shadow-spread)_var(--color-shadow)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:translate-x-[4px] active:translate-y-[4px] active:shadow-none",
      },
      size: {
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
