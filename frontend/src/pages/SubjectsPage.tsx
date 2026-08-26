'use client'

import { Link } from 'react-router-dom'
import { BookOpen, ArrowRight, FileText } from 'lucide-react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PageHeader, EmptyState, ErrorState, LoadingState } from '@/components/feedback/States'
import { useSubjects, useChapters, useClasses, useDocuments } from '@/hooks'

export function SubjectsPage() {
  const { data: subjects = [], isLoading, error, refetch } = useSubjects()
  const { data: classes = [] } = useClasses()

  const errorMessage =
    error && typeof error === 'object' && 'message' in error
      ? String((error as { message: string }).message)
      : 'Could not load subjects.'

  return (
    <div>
      <PageHeader
        title="Subjects"
        description="Browse all subjects and start learning"
      />

      {isLoading ? (
        <LoadingState label="Loading subjects…" />
      ) : error ? (
        <ErrorState description={errorMessage} onRetry={() => refetch()} />
      ) : subjects.length === 0 ? (
        <EmptyState
          title="No subjects yet"
          description="Subjects will appear here once they're added on the backend."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.map((s) => {
            const cls = classes.find((c) => c.id === s.classId)
            return <SubjectCard key={s.id} subject={s} className={cls?.name} />
          })}
        </div>
      )}
    </div>
  )
}

function SubjectCard({
  subject,
  className,
}: {
  subject: { id: string; name: string; classId: string }
  className?: string
}) {
  const { data: chapters = [] } = useChapters({ subjectId: subject.id })
  const { data: docs } = useDocuments({ subjectId: subject.id, limit: 1 })

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
      <Card className="h-full flex flex-col">
        <div className="flex items-start gap-3 mb-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
            <BookOpen className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-foreground">{subject.name}</h3>
            {className && <p className="text-xs text-foreground-muted">{className}</p>}
          </div>
        </div>
        <div className="text-sm text-foreground-muted space-y-1">
          <p>{chapters.length} chapter{chapters.length !== 1 ? 's' : ''}</p>
          <p className="flex items-center gap-1">
            <FileText className="h-3.5 w-3.5" />
            {docs?.total ?? 0} document{(docs?.total ?? 0) !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="mt-auto pt-4">
          <Button asChild variant="outline" className="w-full">
            <Link to={`/subjects/${subject.id}`}>
              Open subject <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </div>
      </Card>
    </motion.div>
  )
}
