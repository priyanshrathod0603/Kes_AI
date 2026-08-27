'use client'

import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowRight, BookOpen, Plus, Edit2, Trash2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PageHeader, EmptyState, ErrorState, LoadingState } from '@/components/feedback/States'
import {
  CreateSubjectDialog,
  EditSubjectDialog,
  DeleteConfirmDialog,
} from '@/components/management'
import { useClasses, useSubjects, useDeleteSubject } from '@/hooks'
import type { Subject } from '@/types'

export function ClassDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [createSubjectOpen, setCreateSubjectOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Subject | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Subject | null>(null)

  const { data: classes = [], isLoading: classesLoading, error: classesError } = useClasses()
  const { data: allSubjects = [], isLoading: subjectsLoading, error: subjectsError } = useSubjects()
  const deleteSubjectMutation = useDeleteSubject()

  const cls = classes.find((c) => c.id === id)
  const subjects = allSubjects.filter((s) => s.classId === id)

  if (classesLoading || subjectsLoading) return <LoadingState label="Loading class…" />

  if (classesError || subjectsError) {
    const msg =
      (classesError as { message?: string } | null)?.message ||
      (subjectsError as { message?: string } | null)?.message ||
      'Could not load class.'
    return <ErrorState description={msg} />
  }

  if (!cls) {
    return (
      <EmptyState
        title="Class not found"
        description="This class does not exist or has been removed."
        action={
          <Button asChild>
            <Link to="/classes">Back to Classes</Link>
          </Button>
        }
      />
    )
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteSubjectMutation.mutateAsync(deleteTarget.id)
      setDeleteTarget(null)
    } catch (err: unknown) {
      alert(`Failed to delete subject: ${(err as Error).message}`)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={cls.name}
        description={`Manage subjects and chapters in ${cls.name}`}
        back={{ to: '/classes', label: 'Back to Classes' }}
        actions={
          <Button onClick={() => setCreateSubjectOpen(true)}>
            <Plus className="h-4 w-4 mr-1.5" /> Add Subject
          </Button>
        }
      />

      {subjects.length === 0 ? (
        <EmptyState
          title="No subjects in this class yet"
          description="Add your first subject to start building the syllabus for this class."
          action={
            <Button onClick={() => setCreateSubjectOpen(true)}>
              <Plus className="h-4 w-4 mr-1.5" /> Add Subject to {cls.name}
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.map((s) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Card className="h-full flex flex-col p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-950/40 shrink-0">
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-foreground truncate">{s.name}</h3>
                      <p className="text-xs text-foreground-muted">{cls.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setEditTarget(s)}
                      className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-foreground-muted hover:bg-muted hover:text-foreground transition-colors"
                      title="Edit Subject"
                      aria-label={`Edit ${s.name}`}
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(s)}
                      className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-foreground-muted hover:bg-error-50 hover:text-error-600 transition-colors"
                      title="Delete Subject"
                      aria-label={`Delete ${s.name}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="mt-auto pt-3">
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <Link to={`/subjects/${s.id}`}>
                      Open subject <ArrowRight className="h-4 w-4 ml-1.5" />
                    </Link>
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <CreateSubjectDialog
        open={createSubjectOpen}
        onClose={() => setCreateSubjectOpen(false)}
        defaultClassId={cls.id}
      />

      {editTarget && (
        <EditSubjectDialog
          open={!!editTarget}
          onClose={() => setEditTarget(null)}
          subject={editTarget}
        />
      )}

      {deleteTarget && (
        <DeleteConfirmDialog
          open={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          title="Delete Subject"
          itemName={deleteTarget.name}
          description="Deleting this subject will also delete its chapters, topics, and associated study materials."
          isDeleting={deleteSubjectMutation.isPending}
        />
      )}
    </div>
  )
}
