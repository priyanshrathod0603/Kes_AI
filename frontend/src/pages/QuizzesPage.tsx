'use client'

import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { useQuizzes } from '@/hooks'
import { Clock, Target, CheckCircle, XCircle, ArrowRight, RefreshCw, Sparkles } from 'lucide-react'

export function QuizzesPage() {
  const { data: quizzes, isLoading, refetch } = useQuizzes()

  return (
    <div className="space-y-6 animate-in">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground">Quizzes</h1>
          <p className="text-foreground-muted">Test your knowledge and track improvement</p>
        </div>
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        <Card variant="elevated" padding="lg" className="text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-100 mx-auto mb-4">
            <Target className="h-8 w-8 text-primary-600" />
          </div>
          <h3 className="font-semibold text-foreground">Create Custom Quiz</h3>
          <p className="text-foreground-muted text-sm mt-1 mb-4">Generate a quiz on any topic with AI</p>
          <Button variant="default" asChild>
            <a href="/ai-tutor?prompt=Create a quiz for me">
              <Sparkles className="h-4 w-4 mr-2" />
              Ask AI to Create Quiz
            </a>
          </Button>
        </Card>

        <Card variant="elevated" padding="lg" className="text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-100 mx-auto mb-4">
            <Clock className="h-8 w-8 text-violet-600" />
          </div>
          <h3 className="font-semibold text-foreground">Daily Challenge</h3>
          <p className="text-foreground-muted text-sm mt-1 mb-4">New quiz every day to keep you sharp</p>
          <Button variant="outline" asChild>
            <a href="/quizzes/daily">Try Today's Challenge</a>
          </Button>
        </Card>

        <Card variant="elevated" padding="lg" className="text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-success-100 mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-success-600" />
          </div>
          <h3 className="font-semibold text-foreground">Weak Areas Practice</h3>
          <p className="text-foreground-muted text-sm mt-1 mb-4">Focus on topics you struggle with</p>
          <Button variant="outline" asChild>
            <a href="/quizzes/weak-areas">Practice Weak Areas</a>
          </Button>
        </Card>
      </motion.div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} variant="elevated" padding="lg">
              <Skeleton className="h-5 w-1/3 rounded mb-4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-1/2 mt-2" />
              <div className="mt-4 flex gap-2">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-24" />
              </div>
            </Card>
          ))}
        </div>
      ) : quizzes?.length === 0 ? (
        <Card variant="elevated" padding="xl" className="text-center py-12">
          <Target className="mx-auto h-16 w-16 text-foreground-muted mb-4" />
          <h3 className="text-lg font-semibold text-foreground">No quizzes available</h3>
          <p className="text-foreground-muted mt-2">Check back later or ask AI Tutor to create a custom quiz</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {quizzes?.map((quiz, index) => (
            <motion.div
              key={quiz.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <QuizCard quiz={quiz} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

function QuizCard({ quiz }: { quiz: any }) {
  const isPassed = quiz.attempts > 0
  const canRetake = quiz.attempts < quiz.maxAttempts

  return (
    <Card variant="elevated" padding="lg">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-semibold text-foreground">{quiz.title}</h3>
          <p className="text-sm text-foreground-muted mt-1">{quiz.description || 'No description'}</p>
        </div>
        <Badge variant={isPassed ? 'success' : 'outline'}>
          {isPassed ? 'Completed' : 'Available'}
        </Badge>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6 text-center">
        <div className="p-3 rounded-xl bg-muted/50">
          <p className="text-2xl font-bold text-foreground">{quiz.questions.length}</p>
          <p className="text-xs text-foreground-muted">Questions</p>
        </div>
        <div className="p-3 rounded-xl bg-muted/50">
          <p className="text-2xl font-bold text-foreground">{quiz.timeLimit ? `${quiz.timeLimit}min` : 'Untimed'}</p>
          <p className="text-xs text-foreground-muted">Time Limit</p>
        </div>
        <div className="p-3 rounded-xl bg-muted/50">
          <p className="text-2xl font-bold text-foreground">{quiz.passingScore}%</p>
          <p className="text-xs text-foreground-muted">Passing Score</p>
        </div>
        <div className="p-3 rounded-xl bg-muted/50">
          <p className="text-2xl font-bold text-foreground">{quiz.attempts}/{quiz.maxAttempts}</p>
          <p className="text-xs text-foreground-muted">Attempts</p>
        </div>
      </div>

      <div className="flex gap-2">
        {canRetake ? (
          <>
            <Button variant="default" className="flex-1" asChild>
              <a href={`/quizzes/${quiz.id}`}>
                {quiz.attempts === 0 ? 'Start Quiz' : 'Retake Quiz'}
                <ArrowRight className="h-4 w-4 ml-1" />
              </a>
            </Button>
            <Button variant="outline" className="flex-1" asChild>
              <a href={`/quizzes/${quiz.id}/review`}>Review</a>
            </Button>
          </>
        ) : (
          <Button variant="outline" className="w-full" disabled>
            Max attempts reached
          </Button>
        )}
      </div>
    </Card>
  )
}