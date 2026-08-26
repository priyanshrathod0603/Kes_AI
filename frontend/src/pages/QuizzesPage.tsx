'use client'

import { Link } from 'react-router-dom'
import { HelpCircle, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PageHeader, EmptyState, ErrorState, LoadingState } from '@/components/feedback/States'
import { useQuizzes, useSubjects } from '@/hooks'
import type { ApiError } from '@/types'

export function QuizzesPage() {
  const { data: quizzes = [], isLoading, error, refetch } = useQuizzes()
  const { data: subjects = [] } = useSubjects()

  const errorMessage =
    error && typeof error === 'object' && 'message' in error
      ? String((error as { message: string }).message)
      : 'Could not load quizzes.'

  return (
    <div>
      <PageHeader
        title="Quizzes"
        description="Test your knowledge and track improvement"
      />

      {isLoading ? (
        <LoadingState label="Loading quizzes…" />
      ) : error ? (
        <ErrorState
          title="Couldn't load quizzes"
          description={errorMessage}
          onRetry={() => refetch()}
        />
      ) : quizzes.length === 0 ? (
        <EmptyState
          title="No quizzes yet"
          description="The backend doesn't expose quiz endpoints yet. When it does, quizzes will appear here."
          action={
            <Button asChild>
              <Link to="/ai-tutor">Ask AI Tutor to create one</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quizzes.map((q) => {
            const subject = subjects.find((s) => s.id === q.subjectId)
            return (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15 }}
              >
                <Card className="h-full flex flex-col">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
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
                  <div className="mt-auto">
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
