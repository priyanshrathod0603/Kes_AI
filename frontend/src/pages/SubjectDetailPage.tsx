'use client'

import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowRight, BookOpen, FileText, Plus, Edit2, Trash2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PageHeader, EmptyState, ErrorState, LoadingState } from '@/components/feedback/States'
import {
  CreateChapterDialog,
  EditChapterDialog,
  DeleteConfirmDialog,
} from '@/components/management'
import { useSubjects, useChapters, useTopics, useDeleteChapter } from '@/hooks'
import type { Chapter } from '@/types'

export function SubjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [createChapterOpen, setCreateChapterOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Chapter | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Chapter | null>(null)

  const { data: subjects = [], isLoading: subjectsLoading, error: subjectsError } = useSubjects()
  const { data: allChapters = [], isLoading: chaptersLoading, error: chaptersError } = useChapters()
  const { data: allTopics = [] } = useTopics()
  const deleteChapterMutation = useDeleteChapter()

  const subject = subjects.find((s) => s.id === id)
  const chapters = allChapters.filter((c) => c.subjectId === id)

  if (subjectsLoading || chaptersLoading) return <LoadingState label="Loading subject…" />

  if (subjectsError || chaptersError) {
    const msg =
      (subjectsError as { message?: string } | null)?.message ||
      (chaptersError as { message?: string } | null)?.message ||
      'Could not load subject.'
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

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteChapterMutation.mutateAsync(deleteTarget.id)
      setDeleteTarget(null)
    } catch (err: unknown) {
      alert(`Failed to delete chapter: ${(err as Error).message}`)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={subject.name}
        description={`Manage chapters and topics for ${subject.name}`}
        back={{ to: '/subjects', label: 'Back to Subjects' }}
        actions={
          <Button onClick={() => setCreateChapterOpen(true)}>
            <Plus className="h-4 w-4 mr-1.5" /> Add Chapter
          </Button>
        }
      />

      {chapters.length === 0 ? (
        <EmptyState
          title="No chapters in this subject yet"
          description="Create your first chapter to organize topics and study materials."
          action={
            <Button onClick={() => setCreateChapterOpen(true)}>
              <Plus className="h-4 w-4 mr-1.5" /> Add Chapter
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {chapters.map((ch, idx) => {
            const topicCount = allTopics.filter((t) => t.chapterId === ch.id).length
            return (
              <motion.div
                key={ch.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15, delay: idx * 0.03 }}
              >
                <Card className="h-full flex flex-col p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-950/40 shrink-0">
                        <BookOpen className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-foreground truncate">{ch.name}</h3>
                        <p className="text-xs text-foreground-muted">Chapter {idx + 1}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setEditTarget(ch)}
                        className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-foreground-muted hover:bg-muted hover:text-foreground transition-colors"
                        title="Edit Chapter"
                        aria-label={`Edit ${ch.name}`}
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(ch)}
                        className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-foreground-muted hover:bg-error-50 hover:text-error-600 transition-colors"
                        title="Delete Chapter"
                        aria-label={`Delete ${ch.name}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {ch.description && (
                    <p className="text-xs text-foreground-muted line-clamp-2 mb-3">
                      {ch.description}
                    </p>
                  )}

                  <div className="flex items-center gap-1.5 text-xs text-foreground-muted mb-4 mt-auto">
                    <FileText className="h-3.5 w-3.5" />
                    <span>{topicCount} topic{topicCount !== 1 ? 's' : ''}</span>
                  </div>

                  <Button asChild variant="outline" size="sm" className="w-full">
                    <Link to={`/chapters/${ch.id}`}>
                      View topics <ArrowRight className="h-4 w-4 ml-1.5" />
                    </Link>
                  </Button>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}

      <CreateChapterDialog
        open={createChapterOpen}
        onClose={() => setCreateChapterOpen(false)}
        defaultSubjectId={subject.id}
      />

      {editTarget && (
        <EditChapterDialog
          open={!!editTarget}
          onClose={() => setEditTarget(null)}
          chapter={editTarget}
        />
      )}

      {deleteTarget && (
        <DeleteConfirmDialog
          open={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          title="Delete Chapter"
          itemName={deleteTarget.name}
          description="Deleting this chapter will also delete its topics and associated study materials."
          isDeleting={deleteChapterMutation.isPending}
        />
      )}
    </div>
  )
}
