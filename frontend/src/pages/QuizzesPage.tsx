'use client'

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { HelpCircle, ArrowRight, Sparkles, Plus, Play, Trash2, CheckCircle2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PageHeader, EmptyState, ErrorState, LoadingState } from '@/components/feedback/States'
import {
  CreateQuizDialog,
  AttemptQuizDialog,
  DeleteConfirmDialog,
} from '@/components/management'
import { useQuizzes, useSubjects, useDeleteQuiz } from '@/hooks'
import type { Quiz } from '@/types'

export function QuizzesPage() {
  const [createOpen, setCreateOpen] = useState(false)
  const [attemptTarget, setAttemptTarget] = useState<Quiz | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Quiz | null>(null)

  const { data: quizzes = [], isLoading, error, refetch } = useQuizzes()
  const { data: subjects = [] } = useSubjects()
  const deleteQuizMutation = useDeleteQuiz()

  const errorMessage =
    error && typeof error === 'object' && 'message' in error
      ? String((error as { message: string }).message)
      : 'Could not load quizzes.'

  const safeQuizzes = Array.isArray(quizzes) ? quizzes : []

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteQuizMutation.mutateAsync(deleteTarget.id)
      setDeleteTarget(null)
    } catch (err: unknown) {
      alert(`Failed to delete quiz: ${(err as Error).message}`)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quizzes"
        description="Create quizzes, practice questions, test your understanding, and view real-time scores"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link to="/ai-tutor">
                <Sparkles className="h-4 w-4 mr-1.5 text-primary-600" /> Ask AI Tutor
              </Link>
            </Button>
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-1.5" /> Create Quiz
            </Button>
          </div>
        }
      />

      {isLoading ? (
        <LoadingState label="Loading quizzes…" />
      ) : error ? (
        <ErrorState
          title="Couldn't load quizzes"
          description={errorMessage}
          onRetry={() => refetch()}
        />
      ) : safeQuizzes.length === 0 ? (
        <EmptyState
          title="No quizzes yet"
          description="Create your first quiz to practice questions and test knowledge on school topics."
          action={
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-1.5" /> Create Quiz
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {safeQuizzes.map((q) => {
            const subject = subjects.find((s) => s.id === q.subjectId)
            const questionCount = q.questions?.length ?? 0

            return (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15 }}
              >
                <Card className="h-full flex flex-col p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-950/40 shrink-0">
                        <HelpCircle className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-foreground truncate">{q.title}</h3>
                        {subject ? (
                          <p className="text-xs text-foreground-muted">{subject.name}</p>
                        ) : (
                          <p className="text-xs text-foreground-muted">General Quiz</p>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(q)}
                      className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-foreground-muted hover:bg-error-50 hover:text-error-600 transition-colors shrink-0"
                      title="Delete Quiz"
                      aria-label={`Delete ${q.title}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {q.description && (
                    <p className="text-xs text-foreground-muted line-clamp-2 mb-3">
                      {q.description}
                    </p>
                  )}

                  <div className="flex items-center gap-2 mb-4 mt-auto">
                    <Badge variant="secondary" className="text-xs">
                      {questionCount} question{questionCount !== 1 ? 's' : ''}
                    </Badge>
                  </div>

                  <Button
                    onClick={() => setAttemptTarget(q)}
                    className="w-full"
                    disabled={questionCount === 0}
                  >
                    <Play className="h-4 w-4 mr-1.5" /> Start Quiz
                  </Button>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}

      <CreateQuizDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />

      {attemptTarget && (
        <AttemptQuizDialog
          open={!!attemptTarget}
          onClose={() => setAttemptTarget(null)}
          quiz={attemptTarget}
        />
      )}

      {deleteTarget && (
        <DeleteConfirmDialog
          open={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          title="Delete Quiz"
          itemName={deleteTarget.title}
          description="Are you sure you want to delete this quiz? All questions will be permanently removed."
          isDeleting={deleteQuizMutation.isPending}
        />
      )}
    </div>
  )
}
