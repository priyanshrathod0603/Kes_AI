'use client'

import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowRight, BookOpen, FileText, Plus, Edit2, Trash2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PageHeader, EmptyState, ErrorState, LoadingState } from '@/components/feedback/States'
import {
  CreateTopicDialog,
  EditTopicDialog,
  DeleteConfirmDialog,
} from '@/components/management'
import { useChapters, useTopics, useDeleteTopic } from '@/hooks'
import type { Topic } from '@/types'

export function ChapterDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [createTopicOpen, setCreateTopicOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Topic | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Topic | null>(null)

  const { data: chapters = [], isLoading: chaptersLoading, error: chaptersError } = useChapters()
  const { data: allTopics = [], isLoading: topicsLoading, error: topicsError } = useTopics()
  const deleteTopicMutation = useDeleteTopic()

  const chapter = chapters.find((c) => c.id === id)
  const topics = allTopics.filter((t) => t.chapterId === id)

  if (chaptersLoading || topicsLoading) return <LoadingState label="Loading chapter…" />

  if (chaptersError || topicsError) {
    const msg =
      (chaptersError as { message?: string } | null)?.message ||
      (topicsError as { message?: string } | null)?.message ||
      'Could not load chapter.'
    return <ErrorState description={msg} />
  }

  if (!chapter) {
    return (
      <EmptyState
        title="Chapter not found"
        description="This chapter does not exist or has been removed."
        action={
          <Button asChild>
            <Link to="/subjects">Back to Subjects</Link>
          </Button>
        }
      />
    )
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteTopicMutation.mutateAsync(deleteTarget.id)
      setDeleteTarget(null)
    } catch (err: unknown) {
      alert(`Failed to delete topic: ${(err as Error).message}`)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={chapter.name}
        description={chapter.description ?? 'Manage topics and materials in this chapter'}
        back={{ to: `/subjects/${chapter.subjectId}`, label: 'Back to Subject' }}
        actions={
          <Button onClick={() => setCreateTopicOpen(true)}>
            <Plus className="h-4 w-4 mr-1.5" /> Add Topic
          </Button>
        }
      />

      {topics.length === 0 ? (
        <EmptyState
          title="No topics in this chapter yet"
          description="Add your first topic to attach study materials and launch focused AI tutor sessions."
          action={
            <Button onClick={() => setCreateTopicOpen(true)}>
              <Plus className="h-4 w-4 mr-1.5" /> Add Topic
            </Button>
          }
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {topics.map((t, idx) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15, delay: idx * 0.02 }}
            >
              <Card className="h-full flex flex-col p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-950/40 shrink-0">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-semibold text-sm text-foreground truncate">{t.name}</h4>
                      <p className="text-xs text-foreground-muted">Topic {idx + 1}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setEditTarget(t)}
                      className="h-7 w-7 inline-flex items-center justify-center rounded-lg text-foreground-muted hover:bg-muted hover:text-foreground transition-colors"
                      title="Edit Topic"
                      aria-label={`Edit ${t.name}`}
                    >
                      <Edit2 className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(t)}
                      className="h-7 w-7 inline-flex items-center justify-center rounded-lg text-foreground-muted hover:bg-error-50 hover:text-error-600 transition-colors"
                      title="Delete Topic"
                      aria-label={`Delete ${t.name}`}
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                <div className="mt-auto pt-2">
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <Link to={`/topics/${t.id}`}>
                      View topic & resources <ArrowRight className="h-4 w-4 ml-1.5" />
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
        subjectId={chapter.subjectId}
      />

      {editTarget && (
        <EditTopicDialog
          open={!!editTarget}
          onClose={() => setEditTarget(null)}
          topic={editTarget}
          subjectId={chapter.subjectId}
        />
      )}

      {deleteTarget && (
        <DeleteConfirmDialog
          open={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          title="Delete Topic"
          itemName={deleteTarget.name}
          description="Deleting this topic will also detach or remove its associated study materials."
          isDeleting={deleteTopicMutation.isPending}
        />
      )}
    </div>
  )
}
