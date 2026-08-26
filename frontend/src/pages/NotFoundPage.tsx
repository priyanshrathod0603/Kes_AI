'use client'

import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted mb-4">
        <Compass className="h-7 w-7 text-foreground-muted" />
      </div>
      <h1 className="text-2xl font-bold text-foreground">Page not found</h1>
      <p className="text-foreground-muted mt-2 max-w-md">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Button asChild className="mt-6">
        <Link to="/dashboard">Back to Dashboard</Link>
      </Button>
    </div>
  )
}
