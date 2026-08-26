'use client'

import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { BookOpen, ArrowRight, Plus, Edit2, Trash2, FileText } from 'lucide-react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PageHeader, EmptyState, ErrorState, LoadingState } from '@/components/feedback/States'
import { CreateChapterDialog, FeatureNoticeDialog } from '@/components/management'
import { useSubjects, useChapters, useDocuments } from '@/hooks'

export function SubjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [createChapterOpen, setCreateChapterOpen] = useState(false)
  const [noticeState, setNoticeState] = useState<{ open: boolean; title: string; feature: string } | null>(null)

  const { data: subjects = [], isLoading: subjectsLoading } = useSubjects()
  const { data: chapters = [], isLoading: chaptersLoading, error: chaptersError } = useChapters(
    id ? { subjectId: id } : undefined,
    { enabled: !!id }
  )
  const { data: docs } = useDocuments(id ? { subjectId: id, limit: 1 } : undefined)

  const subject = subjects.find((s) => s.id === id)

  if (subjectsLoading || chaptersLoading) return <LoadingState label="Loading subject…" />

  if (chaptersError) {
    const msg = (chaptersError as { message?: string }).message
    return <ErrorState description={msg} />
  }

  if (!subject) {
    return (
      <EmptyState
        title="Subject not found"
        description="This subject does not exist or has been removed."
        action={
          <Button asChild>
            <Link to="/subjects">Back to Subjects</Link>
          </Button>
        }
      />
    )
  }

  const handleUnsupportedAction = (action: 'edit' | 'delete', name: string) => {
    if (action === 'edit') {
      setNoticeState({
        open: true,
        title: 'Chapter Update Notice',
        feature: `Editing "${name}"`,
      })
    } else {
      setNoticeState({
        open: true,
        title: 'Chapter Deletion Notice',
        feature: `Deleting "${name}"`,
      })
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={subject.name}
        description={`${chapters.length} chapter${chapters.length !== 1 ? 's' : ''} · ${docs?.total ?? 0} study document${(docs?.total ?? 0) !== 1 ? 's' : ''}`}
        back={{ to: '/subjects', label: 'Back to Subjects' }}
        actions={
          <div className="flex items-center gap-2">
            <Button asChild variant="outline">
              <Link to="/study-material">Browse Material</Link>
            </Button>
            <Button onClick={() => setCreateChapterOpen(true)}>
              <Plus className="h-4 w-4 mr-1.5" /> Add Chapter
            </Button>
          </div>
        }
      />

      {chapters.length === 0 ? (
        <EmptyState
          title="No chapters in this subject yet"
          description="Create your first chapter to start organizing topics and study resources."
          action={
            <Button onClick={() => setCreateChapterOpen(true)}>
              <Plus className="h-4 w-4 mr-1.5" /> Add Chapter to {subject.name}
            </Button>
          }
        />
      ) : (
        <div className="grid gap-3">
          {chapters.map((c) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Card className="flex items-center gap-4 p-4 hover:shadow-md transition-shadow">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-950/40 shrink-0">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground truncate">{c.name}</h3>
                  </div>
                  {c.description ? (
                    <p className="text-xs text-foreground-muted line-clamp-1 mt-0.5">{c.description}</p>
                  ) : (
                    <p className="text-xs text-foreground-muted italic mt-0.5">No description</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleUnsupportedAction('edit', c.name)}
                    className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-foreground-muted hover:bg-muted hover:text-foreground transition-colors"
                    title="Edit Chapter"
                    aria-label={`Edit ${c.name}`}
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUnsupportedAction('delete', c.name)}
                    className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-foreground-muted hover:bg-error-50 hover:text-error-600 transition-colors"
                    title="Delete Chapter"
                    aria-label={`Delete ${c.name}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                  <Button asChild variant="outline" size="sm">
                    <Link to={`/subjects/${subject.id}/chapters/${c.id}`}>
                      Topics <ArrowRight className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <CreateChapterDialog
        open={createChapterOpen}
        onClose={() => setCreateChapterOpen(false)}
        defaultSubjectId={subject.id}
      />

      {noticeState && (
        <FeatureNoticeDialog
          open={noticeState.open}
          onClose={() => setNoticeState(null)}
          title={noticeState.title}
          featureName={noticeState.feature}
          description="The backend API currently exposes chapter creation and querying. Update/Delete endpoints for chapters are not exposed yet."
        />
      )}
    </div>
  )
}
