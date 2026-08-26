'use client'

import { Link } from 'react-router-dom'
import { BarChart2, BookOpen, FileText, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/feedback/States'
import { useClasses, useSubjects, useChapters, useTopics, useDocuments } from '@/hooks'

export function ProgressPage() {
  const { data: classes = [] } = useClasses()
  const { data: subjects = [] } = useSubjects()
  const chaptersQueries = useChapters()
  const topicsQueries = useTopics()
  const { data: docs } = useDocuments({ limit: 1 })

  const totalChapters = (chaptersQueries.data ?? []).length
  const totalTopics = (topicsQueries.data ?? []).length
  const totalDocuments = docs?.total ?? 0

  return (
    <div>
      <PageHeader
        title="Progress"
        description="An overview of your learning library"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          icon={BookOpen}
          color="primary"
          label="Classes"
          value={classes.length}
        />
        <MetricCard
          icon={BookOpen}
          color="indigo"
          label="Subjects"
          value={subjects.length}
        />
        <MetricCard
          icon={FileText}
          color="violet"
          label="Chapters"
          value={totalChapters}
        />
        <MetricCard
          icon={BarChart2}
          color="success"
          label="Topics"
          value={totalTopics}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="font-semibold text-foreground mb-2">Study activity</h3>
          <p className="text-sm text-foreground-muted mb-4">
            Detailed study analytics (streak, time, accuracy) will appear here once the
            backend exposes them.
          </p>
          <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-foreground-muted">
            No learning activity data available yet.
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold text-foreground mb-2">Resources at a glance</h3>
          <p className="text-sm text-foreground-muted mb-4">
            You have <strong className="text-foreground">{totalDocuments}</strong>{' '}
            document{totalDocuments !== 1 ? 's' : ''} in your study material library.
          </p>
          <div className="flex gap-2">
            <Button asChild>
              <Link to="/study-material">
                <FileText className="h-4 w-4 mr-1" /> Browse material
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/ai-tutor">
                <Sparkles className="h-4 w-4 mr-1" /> Ask AI Tutor
              </Link>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}

const COLOR_CLASSES: Record<string, string> = {
  primary: 'bg-primary-100 text-primary-600',
  success: 'bg-success-100 text-success-600',
  warning: 'bg-warning-100 text-warning-600',
  violet: 'bg-violet-100 text-violet-600',
  indigo: 'bg-indigo-100 text-indigo-600',
}

function MetricCard({
  icon: Icon,
  color,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>
  color: 'primary' | 'success' | 'warning' | 'violet' | 'indigo'
  label: string
  value: number
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
      <Card>
        <div className="flex items-center gap-3">
          <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${COLOR_CLASSES[color]}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm text-foreground-muted">{label}</p>
            <p className="text-2xl font-bold text-foreground">{value}</p>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
