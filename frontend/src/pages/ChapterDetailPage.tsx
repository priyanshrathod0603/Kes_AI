'use client'

import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowRight, BookOpen, FileText, Plus, Edit2, Trash2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PageHeader, EmptyState, ErrorState, LoadingState } from '@/components/feedback/States'
import { CreateTopicDialog, FeatureNoticeDialog } from '@/components/management'
import { useSubjects, useChapters, useTopics, useDocuments } from '@/hooks'

export function ChapterDetailPage() {
  const { subjectId, chapterId } = useParams<{ subjectId: string; chapterId: string }>()
  const [createTopicOpen, setCreateTopicOpen] = useState(false)
  const [noticeState, setNoticeState] = useState<{ open: boolean; title: string; feature: string } | null>(null)

  const { data: subjects = [] } = useSubjects()
  const { data: chapters = [], isLoading: chaptersLoading } = useChapters(
    subjectId ? { subjectId } : undefined,
    { enabled: !!subjectId }
  )
  const { data: topics = [], isLoading: topicsLoading, error: topicsError } = useTopics(
    chapterId ? { chapterId } : undefined,
    { enabled: !!chapterId }
  )
  const { data: docs } = useDocuments(chapterId ? { chapterId, limit: 1 } : undefined)

  const subject = subjects.find((s) => s.id === subjectId)
  const chapter = chapters.find((c) => c.id === chapterId)

  if (chaptersLoading || topicsLoading) return <LoadingState label="Loading chapter…" />

  if (topicsError) {
    const msg = (topicsError as { message?: string }).message
    return <ErrorState description={msg} />
  }

  if (!chapter || !subject) {
    return (
      <EmptyState
        title="Chapter not found"
        description="This chapter does not exist or has been removed."
        action={
          <Button asChild>
            <Link to={subject ? `/subjects/${subject.id}` : '/subjects'}>Back</Link>
          </Button>
        }
      />
    )
  }

  const handleUnsupportedAction = (action: 'edit' | 'delete', name: string) => {
    if (action === 'edit') {
      setNoticeState({
        open: true,
        title: 'Topic Update Notice',
        feature: `Editing "${name}"`,
      })
    } else {
      setNoticeState({
        open: true,
        title: 'Topic Deletion Notice',
        feature: `Deleting "${name}"`,
      })
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={chapter.name}
        description={chapter.description ?? `${subject.name} · ${topics.length} topic${topics.length !== 1 ? 's' : ''} · ${docs?.total ?? 0} document${(docs?.total ?? 0) !== 1 ? 's' : ''}`}
        back={{ to: `/subjects/${subject.id}`, label: `Back to ${subject.name}` }}
        actions={
          <div className="flex items-center gap-2">
            <Button asChild variant="outline">
              <Link to="/study-material">Browse Material</Link>
            </Button>
            <Button onClick={() => setCreateTopicOpen(true)}>
              <Plus className="h-4 w-4 mr-1.5" /> Add Topic
            </Button>
          </div>
        }
      />

      {topics.length === 0 ? (
        <EmptyState
          title="No topics in this chapter yet"
          description="Create your first topic to organize study materials and concept quizzes."
          action={
            <Button onClick={() => setCreateTopicOpen(true)}>
              <Plus className="h-4 w-4 mr-1.5" /> Add Topic to {chapter.name}
            </Button>
          }
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {topics.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Card className="h-full flex flex-col p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-950/40 shrink-0">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-foreground truncate">{t.name}</h3>
                      <p className="text-xs text-foreground-muted">{chapter.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleUnsupportedAction('edit', t.name)}
                      className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-foreground-muted hover:bg-muted hover:text-foreground transition-colors"
                      title="Edit Topic"
                      aria-label={`Edit ${t.name}`}
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUnsupportedAction('delete', t.name)}
                      className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-foreground-muted hover:bg-error-50 hover:text-error-600 transition-colors"
                      title="Delete Topic"
                      aria-label={`Delete ${t.name}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="mt-auto pt-3">
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <Link to={`/subjects/${subject.id}/chapters/${chapter.id}/topics`}>
                      View resources <ArrowRight className="h-4 w-4 ml-1.5" />
                    </Link>
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <CreateTopicDialog
        open={createTopicOpen}
        onClose={() => setCreateTopicOpen(false)}
        defaultChapterId={chapter.id}
        subjectId={subject.id}
      />

      {noticeState && (
        <FeatureNoticeDialog
          open={noticeState.open}
          onClose={() => setNoticeState(null)}
          title={noticeState.title}
          featureName={noticeState.feature}
          description="The backend API currently exposes topic creation and querying. Update/Delete endpoints for topics are not exposed yet."
        />
      )}
    </div>
  )
}
