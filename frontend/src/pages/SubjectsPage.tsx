'use client'

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, ArrowRight, FileText, Plus, Edit2, Trash2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PageHeader, EmptyState, ErrorState, LoadingState } from '@/components/feedback/States'
import { CreateSubjectDialog, FeatureNoticeDialog } from '@/components/management'
import { useSubjects, useChapters, useClasses, useDocuments } from '@/hooks'

export function SubjectsPage() {
  const [createOpen, setCreateOpen] = useState(false)
  const [noticeState, setNoticeState] = useState<{ open: boolean; title: string; feature: string } | null>(null)

  const { data: subjects = [], isLoading, error, refetch } = useSubjects()
  const { data: classes = [] } = useClasses()

  const errorMessage =
    error && typeof error === 'object' && 'message' in error
      ? String((error as { message: string }).message)
      : 'Could not load subjects.'

  const handleUnsupportedAction = (action: 'edit' | 'delete', name: string) => {
    if (action === 'edit') {
      setNoticeState({
        open: true,
        title: 'Subject Update Notice',
        feature: `Editing "${name}"`,
      })
    } else {
      setNoticeState({
        open: true,
        title: 'Subject Deletion Notice',
        feature: `Deleting "${name}"`,
      })
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Subjects"
        description="Browse and manage subjects across all classes"
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-1.5" /> Add Subject
          </Button>
        }
      />

      {isLoading ? (
        <LoadingState label="Loading subjects…" />
      ) : error ? (
        <ErrorState description={errorMessage} onRetry={() => refetch()} />
      ) : subjects.length === 0 ? (
        <EmptyState
          title="No subjects yet"
          description="Create your first subject and assign it to a class."
          action={
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-1.5" /> Add Subject
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.map((s) => {
            const cls = classes.find((c) => c.id === s.classId)
            return (
              <SubjectCard
                key={s.id}
                subject={s}
                className={cls?.name}
                onAction={handleUnsupportedAction}
              />
            )
          })}
        </div>
      )}

      <CreateSubjectDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />

      {noticeState && (
        <FeatureNoticeDialog
          open={noticeState.open}
          onClose={() => setNoticeState(null)}
          title={noticeState.title}
          featureName={noticeState.feature}
          description="The backend API currently exposes subject creation and querying. Update/Delete endpoints for subjects are not exposed yet."
        />
      )}
    </div>
  )
}

function SubjectCard({
  subject,
  className,
  onAction,
}: {
  subject: { id: string; name: string; classId: string }
  className?: string
  onAction: (action: 'edit' | 'delete', name: string) => void
}) {
  const { data: chapters = [] } = useChapters({ subjectId: subject.id }, { enabled: !!subject.id })
  const { data: docs } = useDocuments({ subjectId: subject.id, limit: 1 })

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.15 }}>
      <Card className="h-full flex flex-col p-5 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-950/40 shrink-0">
              <BookOpen className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-foreground truncate">{subject.name}</h3>
              {className && (
                <Badge variant="secondary" className="text-xs mt-1">
                  {className}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onAction('edit', subject.name)}
              className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-foreground-muted hover:bg-muted hover:text-foreground transition-colors"
              title="Edit Subject"
              aria-label={`Edit ${subject.name}`}
            >
              <Edit2 className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onAction('delete', subject.name)}
              className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-foreground-muted hover:bg-error-50 hover:text-error-600 transition-colors"
              title="Delete Subject"
              aria-label={`Delete ${subject.name}`}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div className="text-xs text-foreground-muted space-y-1 my-2">
          <p>{chapters.length} chapter{chapters.length !== 1 ? 's' : ''}</p>
          <p className="flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5" />
            {docs?.total ?? 0} document{(docs?.total ?? 0) !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="mt-auto pt-3">
          <Button asChild variant="outline" size="sm" className="w-full">
            <Link to={`/subjects/${subject.id}`}>
              Open subject <ArrowRight className="h-4 w-4 ml-1.5" />
            </Link>
          </Button>
        </div>
      </Card>
    </motion.div>
  )
}
