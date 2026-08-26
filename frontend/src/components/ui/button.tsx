import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
  {
    variants: {
      variant: {
        default: 'bg-primary-600 text-white hover:bg-primary-700 shadow-sm hover:shadow-md',
        destructive: 'bg-error-500 text-white hover:bg-error-600 shadow-sm hover:shadow-md',
        outline: 'border-2 border-border bg-transparent hover:bg-muted hover:border-border-strong',
        secondary: 'bg-muted text-foreground hover:bg-muted/80',
        ghost: 'hover:bg-muted hover:text-foreground',
        link: 'text-primary-600 underline-offset-4 hover:underline',
        gradient: 'bg-gradient-to-r from-primary-600 via-indigo-600 to-violet-600 text-white hover:from-primary-700 hover:via-indigo-700 hover:to-violet-700 shadow-lg hover:shadow-xl',
      },
      size: {
        default: 'h-11 px-4 py-2',
        sm: 'h-9 rounded-lg px-3 text-xs',
        lg: 'h-12 rounded-xl px-8 text-base',
        xl: 'h-14 rounded-2xl px-10 text-lg',
        icon: 'h-11 w-11',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

const LoadingSpinner = () => (
  <svg
    className="mr-2 h-4 w-4 animate-spin"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
)

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, disabled, children, ...props }, ref) => {
    // When `asChild` is true, the Radix `Slot` requires EXACTLY ONE React element
    // child. We must not render the loading spinner as a sibling of that element,
    // because passing a `false` sibling to the Slot triggers:
    //   "Slot failed to slot onto its children. Expected a single React element
    //   child or `Slottable`."
    // So the asChild path renders only the user-supplied element and skips the
    // spinner (callers using asChild should disable the button via the `loading`
    // prop or render their own spinner inside their child element).
    if (asChild) {
      if (!React.isValidElement(children)) {
        // Throwing here surfaces the misuse at the call site instead of letting
        // the Slot throw an opaque error later in the tree.
        throw new Error(
          'Button with `asChild` requires a single React element child (e.g. <a>, <Link>).'
        )
      }
      return (
        <Slot
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          aria-busy={loading || undefined}
          {...props}
        >
          {children}
        </Slot>
      )
    }

    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading}
        {...props}
      >
        {loading && <LoadingSpinner />}
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
