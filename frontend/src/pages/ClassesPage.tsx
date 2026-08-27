'use client'

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { GraduationCap, BookOpen, ArrowRight, Plus, Edit2, Trash2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PageHeader, EmptyState, ErrorState, LoadingState } from '@/components/feedback/States'
import {
  CreateClassDialog,
  EditClassDialog,
  DeleteConfirmDialog,
} from '@/components/management'
import { useClasses, useSubjects, useDeleteClass } from '@/hooks'
import type { SchoolClass } from '@/types'

export function ClassesPage() {
  const [createOpen, setCreateOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<SchoolClass | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<SchoolClass | null>(null)

  const { data: classes = [], isLoading, error, refetch } = useClasses()
  const { data: subjects = [] } = useSubjects()
  const deleteClassMutation = useDeleteClass()

  const errorMessage =
    error && typeof error === 'object' && 'message' in error
      ? String((error as { message: string }).message)
      : 'Could not load classes.'

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteClassMutation.mutateAsync(deleteTarget.id)
      setDeleteTarget(null)
    } catch (err: unknown) {
      alert(`Failed to delete class: ${(err as Error).message}`)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Classes"
        description="Manage your school classes and academic subjects"
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-1.5" /> Add Class
          </Button>
        }
      />

      {isLoading ? (
        <LoadingState label="Loading classes…" />
      ) : error ? (
        <ErrorState description={errorMessage} onRetry={() => refetch()} />
      ) : classes.length === 0 ? (
        <EmptyState
          title="No classes yet"
          description="Create your first class to start organizing subjects and study materials."
          action={
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-1.5" /> Add Class
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {classes.map((cls) => {
            const classSubjects = subjects.filter((s) => s.classId === cls.id)
            return (
              <motion.div
                key={cls.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15 }}
              >
                <Card className="h-full flex flex-col p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-950/40 shrink-0">
                        <GraduationCap className="h-6 w-6" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-foreground truncate">{cls.name}</h3>
                        <p className="text-xs text-foreground-muted">Academic Class</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setEditTarget(cls)}
                        className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-foreground-muted hover:bg-muted hover:text-foreground transition-colors"
                        title="Edit Class"
                        aria-label={`Edit ${cls.name}`}
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(cls)}
                        className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-foreground-muted hover:bg-error-50 hover:text-error-600 transition-colors"
                        title="Delete Class"
                        aria-label={`Delete ${cls.name}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-foreground-muted mb-3">
                    <BookOpen className="h-4 w-4" />
                    <span>
                      {classSubjects.length} subject{classSubjects.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {classSubjects.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {classSubjects.slice(0, 4).map((s) => (
                        <Badge key={s.id} variant="secondary" className="text-xs">
                          {s.name}
                        </Badge>
                      ))}
                      {classSubjects.length > 4 && (
                        <Badge variant="outline" className="text-xs">
                          +{classSubjects.length - 4} more
                        </Badge>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-foreground-muted italic mb-4">No subjects added yet</p>
                  )}

                  <div className="mt-auto pt-2">
                    <Button asChild variant="outline" size="sm" className="w-full">
                      <Link to={`/classes/${cls.id}`}>
                        View class <ArrowRight className="h-4 w-4 ml-1.5" />
                      </Link>
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}

      <CreateClassDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />

      {editTarget && (
        <EditClassDialog
          open={!!editTarget}
          onClose={() => setEditTarget(null)}
          schoolClass={editTarget}
        />
      )}

      {deleteTarget && (
        <DeleteConfirmDialog
          open={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          title="Delete Class"
          itemName={deleteTarget.name}
          description="Deleting this class will also delete its subjects, chapters, topics, and associated study materials."
          isDeleting={deleteClassMutation.isPending}
        />
      )}
    </div>
  )
}
