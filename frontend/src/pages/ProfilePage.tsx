'use client'

import { User, Mail } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/components/feedback/States'
import { APP_NAME } from '@/lib/constants'

export function ProfilePage() {
  return (
    <div>
      <PageHeader
        title="Profile"
        description="Your account information"
      />

      <Card className="max-w-2xl">
        <div className="flex items-center gap-4 mb-6">
          <Avatar fallback="You" size="2xl" />
          <div>
            <h2 className="text-lg font-semibold text-foreground">Student</h2>
            <p className="text-sm text-foreground-muted">{APP_NAME} learner</p>
            <Badge variant="secondary" className="mt-2 gap-1">
              <User className="h-3 w-3" /> Student
            </Badge>
          </div>
        </div>

        <dl className="space-y-3 text-sm">
          <div className="flex items-center gap-3">
            <User className="h-4 w-4 text-foreground-muted" />
            <dt className="text-foreground-muted w-24">Name</dt>
            <dd className="text-foreground">Student</dd>
          </div>
          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-foreground-muted" />
            <dt className="text-foreground-muted w-24">Email</dt>
            <dd className="text-foreground">—</dd>
          </div>
        </dl>

        <p className="mt-6 text-xs text-foreground-muted">
          Profile editing is read-only here. Account management is handled outside of the
          frontend.
        </p>
      </Card>
    </div>
  )
}
