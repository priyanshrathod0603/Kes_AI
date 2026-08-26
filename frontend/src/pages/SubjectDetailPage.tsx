'use client'

import { Link, useParams } from 'react-router-dom'
import { BookOpen, ArrowRight, FileText } from 'lucide-react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PageHeader, EmptyState, ErrorState, LoadingState } from '@/components/feedback/States'
import { useSubjects, useChapters, useDocuments } from '@/hooks'

export function SubjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: subjects = [], isLoading: subjectsLoading } = useSubjects()
  const { data: chapters = [], isLoading: chaptersLoading, error: chaptersError } = useChapters(
    id ? { subjectId: id } : undefined
  )
  const { data: docs } = useDocuments(id ? { subjectId: id, limit: 1 } : undefined)

  const subject = subjects.find((s) => s.id === id)

  if (subjectsLoading || chaptersLoading) return <LoadingState label="Loading subject…" />

  if (chaptersError) {
    const msg = (chaptersError as { message?: string }).message
    return <ErrorState description={msg} />
  }

  if (!subject) {
    return (
      <EmptyState
        title="Subject not found"
        description="This subject does not exist or has been removed."
      />
    )
  }

  return (
    <div>
      <PageHeader
        title={subject.name}
        description={`${chapters.length} chapter${chapters.length !== 1 ? 's' : ''} · ${docs?.total ?? 0} document${(docs?.total ?? 0) !== 1 ? 's' : ''}`}
        back={{ to: '/subjects' }}
        actions={
          <Button asChild variant="outline">
            <Link to="/study-material">Browse all material</Link>
          </Button>
        }
      />

      {chapters.length === 0 ? (
        <EmptyState
          title="No chapters yet"
          description="This subject has no chapters yet."
        />
      ) : (
        <div className="grid gap-3">
          {chapters.map((c) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Card className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600 shrink-0">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-foreground">{c.name}</h3>
                  {c.description && (
                    <p className="text-xs text-foreground-muted line-clamp-1">{c.description}</p>
                  )}
                </div>
                <Button asChild variant="ghost" size="sm">
                  <Link to={`/subjects/${subject.id}/chapters/${c.id}`}>
                    Topics <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
