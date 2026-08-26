'use client'

import { Bell, Palette, Shield, Info } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { PageHeader } from '@/components/feedback/States'
import { APP_NAME } from '@/lib/constants'

export function SettingsPage() {
  return (
    <div>
      <PageHeader
        title="Settings"
        description="App information"
      />

      <div className="grid gap-4 sm:grid-cols-2 max-w-3xl">
        <Card>
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
              <Info className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">About {APP_NAME}</h3>
              <p className="text-sm text-foreground-muted mt-1">
                {APP_NAME} is an AI-powered student learning platform built by{' '}
                <span className="text-foreground">Krishna Software Solution</span>.
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Notifications</h3>
              <p className="text-sm text-foreground-muted mt-1">
                Notification preferences will appear here once the backend exposes them.
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
              <Palette className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Appearance</h3>
              <p className="text-sm text-foreground-muted mt-1">
                Theme preferences will appear here.
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Privacy</h3>
              <p className="text-sm text-foreground-muted mt-1">
                Data and privacy controls will appear here.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
