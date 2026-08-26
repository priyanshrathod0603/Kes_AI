import { Link } from 'react-router-dom'
import { AlertCircle, Inbox, Loader2, RefreshCcw, ArrowLeft, type LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function LoadingState({ label = 'Loading…', className }: { label?: string; className?: string }) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 text-foreground-muted', className)}>
      <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      <p className="mt-3 text-sm">{label}</p>
    </div>
  )
}

export function EmptyState({
  title,
  description,
  icon: Icon = Inbox,
  action,
  className,
}: {
  title: string
  description?: string
  icon?: LucideIcon
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex flex-col items-center justify-center text-center py-12 px-4', className)}>
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted mb-4">
        <Icon className="h-6 w-6 text-foreground-muted" />
      </div>
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      {description && <p className="text-sm text-foreground-muted mt-1 max-w-md">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

export function ErrorState({
  title = 'Something went wrong',
  description,
  icon: Icon = AlertCircle,
  onRetry,
  className,
}: {
  title?: string
  description?: string
  icon?: LucideIcon
  onRetry?: () => void
  className?: string
}) {
  return (
    <div className={cn('flex flex-col items-center justify-center text-center py-12 px-4', className)}>
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-error-50 mb-4">
        <Icon className="h-6 w-6 text-error-600" />
      </div>
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      {description && <p className="text-sm text-foreground-muted mt-1 max-w-md">{description}</p>}
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="mt-4">
          <RefreshCcw className="h-4 w-4 mr-1" /> Try again
        </Button>
      )}
    </div>
  )
}

export function PageHeader({
  title,
  description,
  back,
  actions,
}: {
  title?: string
  description?: string
  back?: { to: string; label?: string }
  actions?: React.ReactNode
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        {back && (
          <Link
            to={back.to}
            className="inline-flex items-center text-sm text-foreground-muted hover:text-foreground mb-1"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            {back.label ?? 'Back'}
          </Link>
        )}
        {title && <h1 className="text-2xl font-bold text-foreground">{title}</h1>}
        {description && <p className="text-foreground-muted mt-1">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  )
}
