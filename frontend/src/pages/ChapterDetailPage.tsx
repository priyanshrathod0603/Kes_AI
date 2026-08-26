'use client'

import { Link, useParams } from 'react-router-dom'
import { ArrowRight, BookOpen, FileText } from 'lucide-react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PageHeader, EmptyState, ErrorState, LoadingState } from '@/components/feedback/States'
import { useSubjects, useChapters, useTopics, useDocuments } from '@/hooks'

export function ChapterDetailPage() {
  const { subjectId, chapterId } = useParams<{ subjectId: string; chapterId: string }>()
  const { data: subjects = [] } = useSubjects()
  const { data: chapters = [], isLoading: chaptersLoading } = useChapters(
    subjectId ? { subjectId } : undefined
  )
  const { data: topics = [], isLoading: topicsLoading, error: topicsError } = useTopics(
    chapterId ? { chapterId } : undefined
  )
  const { data: docs } = useDocuments(chapterId ? { chapterId, limit: 1 } : undefined)

  const subject = subjects.find((s) => s.id === subjectId)
  const chapter = chapters.find((c) => c.id === chapterId)

  if (chaptersLoading || topicsLoading) return <LoadingState label="Loading chapter…" />

  if (topicsError) {
    const msg = (topicsError as { message?: string }).message
    return <ErrorState description={msg} />
  }

  if (!chapter || !subject) {
    return (
      <EmptyState
        title="Chapter not found"
        description="This chapter does not exist or has been removed."
      />
    )
  }

  return (
    <div>
      <PageHeader
        title={chapter.name}
        description={chapter.description ?? `${subject.name} · ${topics.length} topic${topics.length !== 1 ? 's' : ''} · ${docs?.total ?? 0} document${(docs?.total ?? 0) !== 1 ? 's' : ''}`}
        back={{ to: `/subjects/${subject.id}`, label: `Back to ${subject.name}` }}
        actions={
          <Button asChild variant="outline">
            <Link to="/study-material">Browse material</Link>
          </Button>
        }
      />

      {topics.length === 0 ? (
        <EmptyState
          title="No topics yet"
          description="This chapter has no topics yet."
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {topics.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Card className="h-full flex flex-col">
                <div className="flex items-start gap-3 mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600 shrink-0">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-foreground">{t.name}</h3>
                    <p className="text-xs text-foreground-muted">Topic</p>
                  </div>
                </div>
                <div className="mt-auto">
                  <Button asChild variant="ghost" size="sm" className="w-full">
                    <Link to={`/subjects/${subject.id}/chapters/${chapter.id}/topics`}>
                      View resources <ArrowRight className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
