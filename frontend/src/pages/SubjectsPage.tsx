'use client'

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, ArrowRight, Plus, Edit2, Trash2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PageHeader, EmptyState, ErrorState, LoadingState } from '@/components/feedback/States'
import {
  CreateSubjectDialog,
  EditSubjectDialog,
  DeleteConfirmDialog,
} from '@/components/management'
import { useSubjects, useClasses, useDeleteSubject } from '@/hooks'
import type { Subject } from '@/types'

export function SubjectsPage() {
  const [selectedClassId, setSelectedClassId] = useState<string>('all')
  const [createOpen, setCreateOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Subject | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Subject | null>(null)

  const { data: classes = [], isLoading: classesLoading } = useClasses()
  const { data: subjects = [], isLoading: subjectsLoading, error, refetch } = useSubjects()
  const deleteSubjectMutation = useDeleteSubject()

  const isLoading = classesLoading || subjectsLoading

  const filtered =
    selectedClassId === 'all'
      ? subjects
      : subjects.filter((s) => s.classId === selectedClassId)

  const errorMessage =
    error && typeof error === 'object' && 'message' in error
      ? String((error as { message: string }).message)
      : 'Could not load subjects.'

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
        title="Subjects"
        description="Browse, manage, and explore subjects across all classes"
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-1.5" /> Add Subject
          </Button>
        }
      />

      {/* Class filter tabs */}
      {classes.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSelectedClassId('all')}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
              selectedClassId === 'all'
                ? 'bg-primary-600 text-white'
                : 'bg-muted text-foreground-muted hover:text-foreground'
            }`}
          >
            All Classes ({subjects.length})
          </button>
          {classes.map((cls) => {
            const count = subjects.filter((s) => s.classId === cls.id).length
            return (
              <button
                key={cls.id}
                type="button"
                onClick={() => setSelectedClassId(cls.id)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                  selectedClassId === cls.id
                    ? 'bg-primary-600 text-white'
                    : 'bg-muted text-foreground-muted hover:text-foreground'
                }`}
              >
                {cls.name} ({count})
              </button>
            )
          })}
        </div>
      )}

      {isLoading ? (
        <LoadingState label="Loading subjects…" />
      ) : error ? (
        <ErrorState description={errorMessage} onRetry={() => refetch()} />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No subjects found"
          description={
            selectedClassId === 'all'
              ? 'Get started by creating your first subject.'
              : 'No subjects in this class yet.'
          }
          action={
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-1.5" /> Add Subject
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((s) => {
            const cls = classes.find((c) => c.id === s.classId)
            return (
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
                        <p className="text-xs text-foreground-muted">{cls?.name ?? 'Assigned Class'}</p>
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
                        View chapters <ArrowRight className="h-4 w-4 ml-1.5" />
                      </Link>
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}

      <CreateSubjectDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        defaultClassId={selectedClassId !== 'all' ? selectedClassId : undefined}
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
