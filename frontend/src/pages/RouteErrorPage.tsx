'use client'

import { AlertCircle, RefreshCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'

/**
 * Real error display used by React Router when a route's element throws.
 * Distinct from NotFoundPage so the user can tell the page exists but failed
 * to render (vs. the URL not matching any route).
 */
export function RouteErrorPage({ error }: { error?: unknown }) {
  const message =
    (error && typeof error === 'object' && 'message' in error
      ? String((error as { message?: string }).message)
      : null) || 'The page failed to load.'

  return (
    <div className="flex flex-col items-center justify-center text-center py-20 px-4">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-error-50 mb-4">
        <AlertCircle className="h-7 w-7 text-error-600" />
      </div>
      <h1 className="text-2xl font-bold text-foreground">This page could not be loaded</h1>
      <p className="text-foreground-muted mt-2 max-w-md">{message}</p>
      <Button
        className="mt-6"
        onClick={() => {
          if (typeof window !== 'undefined') window.location.reload()
        }}
      >
        <RefreshCcw className="h-4 w-4 mr-1" /> Reload
      </Button>
    </div>
  )
}
