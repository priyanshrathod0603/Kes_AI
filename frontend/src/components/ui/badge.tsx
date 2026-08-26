import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary-100 text-primary-700 hover:bg-primary-100/80',
        secondary: 'border-transparent bg-muted text-foreground hover:bg-muted/80',
        destructive: 'border-transparent bg-error-100 text-error-700 hover:bg-error-100/80',
        success: 'border-transparent bg-success-100 text-success-700 hover:bg-success-100/80',
        warning: 'border-transparent bg-warning-100 text-warning-700 hover:bg-warning-100/80',
        outline: 'border-border bg-transparent hover:bg-muted',
        ghost: 'border-transparent bg-transparent hover:bg-muted',
        gradient: 'border-transparent bg-gradient-to-r from-primary-600 via-indigo-600 to-violet-600 text-white',
      },
      size: {
        default: 'px-2.5 py-0.5 text-xs',
        sm: 'px-2 py-0.5 text-[11px]',
        lg: 'px-3 py-1 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant, size, className }))} {...props} />
}

export { Badge, badgeVariants }