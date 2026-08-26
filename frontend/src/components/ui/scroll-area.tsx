'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
}

const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('relative overflow-auto scrollbar-hide', className)}
      {...props}
    >
      {children}
      <div className="h-px w-px" aria-hidden="true" />
    </div>
  )
)
ScrollArea.displayName = 'ScrollArea'

interface ScrollBarProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'vertical' | 'horizontal'
}

const ScrollBar = React.forwardRef<HTMLDivElement, ScrollBarProps>(
  ({ className, orientation = 'vertical', ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex touch-none select-none transition-opacity',
        orientation === 'vertical' ? 'h-full w-1.5' : 'h-1.5 w-full',
        className
      )}
      {...props}
    >
      <div
        className={cn(
          'relative rounded-full bg-border',
          orientation === 'vertical' ? 'h-20 w-full' : 'h-full w-20'
        )}
      />
    </div>
  )
)
ScrollBar.displayName = 'ScrollBar'

export { ScrollArea, ScrollBar }