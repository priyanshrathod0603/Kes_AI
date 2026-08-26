'use client'

import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  BookOpen,
  Clock,
  Target,
  Flame,
  TrendingUp,
  Sparkles,
  Bot,
  ArrowRight,
  FileText,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/components/feedback/States'
import { useClasses, useSubjects, useDocuments } from '@/hooks'
import { APP_NAME } from '@/lib/constants'
import { cn } from '@/lib/utils'

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export function DashboardPage() {
  const { data: classes = [] } = useClasses()
  const { data: subjects = [] } = useSubjects()
  const { data: docs } = useDocuments({ limit: 1 })
  const totalDocuments = docs?.total ?? 0

  return (
    <div>
      <PageHeader
        title={`${getGreeting()} 👋`}
        description="Ready to learn something new today?"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Flame}
          color="warning"
          title="Study streak"
          value="—"
          subtitle="Backend doesn't expose this yet"
        />
        <StatCard
          icon={Clock}
          color="primary"
          title="Total study time"
          value="—"
          subtitle="Backend doesn't expose this yet"
        />
        <StatCard
          icon={Target}
          color="success"
          title="Questions solved"
          value="—"
          subtitle="Backend doesn't expose this yet"
        />
        <StatCard
          icon={TrendingUp}
          color="violet"
          title="Quiz accuracy"
          value="—"
          subtitle="Backend doesn't expose this yet"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-semibold text-foreground">Continue learning</h2>
                <p className="text-sm text-foreground-muted">Pick a subject to keep going</p>
              </div>
              <Button asChild variant="ghost" size="sm">
                <Link to="/subjects">
                  View all <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>
            {subjects.length === 0 ? (
              <p className="text-sm text-foreground-muted py-4 text-center">
                No subjects yet. They'll show up here once added on the backend.
              </p>
            ) : (
              <div className="space-y-2">
                {subjects.slice(0, 4).map((s) => {
                  const cls = classes.find((c) => c.id === s.classId)
                  return (
                    <Link
                      key={s.id}
                      to={`/subjects/${s.id}`}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/60 transition-colors"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600 shrink-0">
                        <BookOpen className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">{s.name}</p>
                        <p className="text-xs text-foreground-muted truncate">
                          {cls?.name ?? 'Subject'}
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-foreground-muted" />
                    </Link>
                  )
                })}
              </div>
            )}
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-semibold text-foreground">Today's snapshot</h2>
                <p className="text-sm text-foreground-muted">At a glance</p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <SnapshotTile
                label="Classes"
                value={classes.length}
                to="/classes"
                icon={BookOpen}
              />
              <SnapshotTile
                label="Subjects"
                value={subjects.length}
                to="/subjects"
                icon={BookOpen}
              />
              <SnapshotTile
                label="Documents"
                value={totalDocuments}
                to="/study-material"
                icon={FileText}
              />
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-indigo-600 to-violet-600 text-white">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.2),_transparent_50%)]" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold">KES AI Tutor</h3>
                  <p className="text-xs text-white/80">Your personal learning companion</p>
                </div>
              </div>
              <p className="text-sm text-white/90 mb-4">
                Ask anything — explanations, examples, quizzes, summaries.
              </p>
              <Button asChild variant="secondary" className="w-full">
                <Link to="/ai-tutor">
                  <Sparkles className="h-4 w-4 mr-1" /> Open AI Tutor
                </Link>
              </Button>
            </div>
          </Card>

          <Card>
            <h3 className="font-semibold text-foreground mb-3">Quick actions</h3>
            <div className="space-y-2">
              <QuickAction to="/study-material" icon={FileText} label="Browse study material" />
              <QuickAction to="/ai-tutor" icon={Sparkles} label="Ask AI Tutor" />
              <QuickAction to="/quizzes" icon={Target} label="Take a quiz" />
            </div>
          </Card>

          <Card>
            <h3 className="font-semibold text-foreground mb-2">About {APP_NAME}</h3>
            <p className="text-sm text-foreground-muted">
              {APP_NAME} is an AI-powered student learning platform by Krishna Software Solution.
            </p>
          </Card>
        </div>
      </div>
    </div>
  )
}

const COLOR_CLASSES: Record<string, string> = {
  primary: 'bg-primary-100 text-primary-600',
  success: 'bg-success-100 text-success-600',
  warning: 'bg-warning-100 text-warning-600',
  violet: 'bg-violet-100 text-violet-600',
}

function StatCard({
  icon: Icon,
  color,
  title,
  value,
  subtitle,
}: {
  icon: React.ComponentType<{ className?: string }>
  color: 'primary' | 'success' | 'warning' | 'violet'
  title: string
  value: string | number
  subtitle?: string
}) {
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-foreground-muted">{title}</p>
          <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
          {subtitle && <p className="text-xs text-foreground-muted mt-1">{subtitle}</p>}
        </div>
        <div
          className={cn(
            'flex h-11 w-11 items-center justify-center rounded-xl',
            COLOR_CLASSES[color]
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Card>
  )
}

function SnapshotTile({
  label,
  value,
  to,
  icon: Icon,
}: {
  label: string
  value: number
  to: string
  icon: React.ComponentType<{ className?: string }>
}) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3 hover:bg-muted/60 transition-colors"
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-foreground-muted">{label}</p>
        <p className="text-xl font-bold text-foreground">{value}</p>
      </div>
    </Link>
  )
}

function QuickAction({
  to,
  icon: Icon,
  label,
}: {
  to: string
  icon: React.ComponentType<{ className?: string }>
  label: string
}) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
    >
      <Icon className="h-4 w-4 text-foreground-muted" />
      <span>{label}</span>
      <ArrowRight className="h-3.5 w-3.5 ml-auto text-foreground-muted" />
    </Link>
  )
}
