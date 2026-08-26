'use client'

import { Link } from 'react-router-dom'
import { HelpCircle, ArrowRight, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PageHeader, EmptyState, ErrorState, LoadingState } from '@/components/feedback/States'
import { useQuizzes, useSubjects } from '@/hooks'

export function QuizzesPage() {
  const { data: quizzes = [], isLoading, error, refetch } = useQuizzes()
  const { data: subjects = [] } = useSubjects()

  const errorMessage =
    error && typeof error === 'object' && 'message' in error
      ? String((error as { message: string }).message)
      : 'Could not load quizzes.'

  const safeQuizzes = Array.isArray(quizzes) ? quizzes : []

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quizzes"
        description="Test your knowledge and track improvement"
        actions={
          <Button asChild variant="outline">
            <Link to="/ai-tutor">
              <Sparkles className="h-4 w-4 mr-1.5 text-primary-600" /> Generate Quiz with AI
            </Link>
          </Button>
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
          title="Quizzes are not available yet"
          description="Quiz functionality will appear here when quiz data is available."
          action={
            <Button asChild>
              <Link to="/ai-tutor">
                <Sparkles className="h-4 w-4 mr-1.5" /> Practice with KES AI Tutor
              </Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {safeQuizzes.map((q) => {
            const subject = subjects.find((s) => s.id === q.subjectId)
            return (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15 }}
              >
                <Card className="h-full flex flex-col p-5">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600 shrink-0">
                      <HelpCircle className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-foreground">{q.title}</h3>
                      {subject && <p className="text-xs text-foreground-muted">{subject.name}</p>}
                    </div>
                  </div>
                  {q.description && (
                    <p className="text-sm text-foreground-muted line-clamp-2 mb-3">
                      {q.description}
                    </p>
                  )}
                  <div className="mt-auto pt-2">
                    <Button variant="outline" className="w-full" disabled>
                      <Badge variant="outline" className="mr-2 text-[10px]">Coming soon</Badge>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
