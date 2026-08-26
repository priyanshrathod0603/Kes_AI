'use client'

import { Link, useParams } from 'react-router-dom'
import { FileText, ExternalLink, Download } from 'lucide-react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PageHeader, EmptyState, ErrorState, LoadingState } from '@/components/feedback/States'
import { useSubjects, useChapters, useTopics, useDocuments } from '@/hooks'
import { documentApi } from '@/api'

function typeLabel(t: string) {
  switch (t) {
    case 'CHAPTER_MATERIAL':
      return 'Chapter material'
    case 'WORKSHEET':
      return 'Worksheet'
    case 'QUESTION_PAPER':
      return 'Question paper'
    case 'ANSWER_KEY':
      return 'Answer key'
    case 'STUDY_MATERIAL':
    default:
      return 'Study material'
  }
}

function statusBadge(status?: string) {
  switch (status) {
    case 'COMPLETED':
      return <Badge variant="success" className="text-xs">Ready</Badge>
    case 'PROCESSING':
      return <Badge variant="secondary" className="text-xs">Processing</Badge>
    case 'FAILED':
      return <Badge variant="destructive" className="text-xs">Failed</Badge>
    case 'NO_TEXT':
      return <Badge variant="warning" className="text-xs">No text</Badge>
    case 'PENDING':
      return <Badge variant="outline" className="text-xs">Pending</Badge>
    default:
      return null
  }
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function TopicDetailPage() {
  const { subjectId, chapterId } = useParams<{ subjectId: string; chapterId: string }>()
  const { data: subjects = [] } = useSubjects()
  const { data: chapters = [], isLoading: chaptersLoading } = useChapters(
    subjectId ? { subjectId } : undefined
  )
  const { data: topics = [], isLoading: topicsLoading } = useTopics(
    chapterId ? { chapterId } : undefined
  )
  const { data: docs, isLoading: docsLoading, error: docsError } = useDocuments(
    chapterId ? { chapterId, limit: 50 } : undefined
  )

  const subject = subjects.find((s) => s.id === subjectId)
  const chapter = chapters.find((c) => c.id === chapterId)

  if (chaptersLoading || topicsLoading || docsLoading) {
    return <LoadingState label="Loading topic…" />
  }

  if (docsError) {
    const msg = (docsError as { message?: string }).message
    return <ErrorState description={msg} />
  }

  if (!chapter || !subject) {
    return (
      <EmptyState
        title="Topic not found"
        description="This topic does not exist or has been removed."
      />
    )
  }

  return (
    <div>
      <PageHeader
        title={chapter.name}
        description={`Resources for ${chapter.name}`}
        back={{ to: `/subjects/${subject.id}/chapters/${chapter.id}`, label: `Back to chapter` }}
      />

      {subjects.length === 0 ? null : null}

      {topics.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-1.5">
          {topics.map((t) => (
            <Badge key={t.id} variant="outline" className="text-xs">
              {t.name}
            </Badge>
          ))}
        </div>
      )}

      {docs?.data && docs.data.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {docs.data.map((doc) => (
            <motion.div
              key={doc.id}
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
                    <h3 className="font-semibold text-foreground line-clamp-2" title={doc.title}>
                      {doc.title}
                    </h3>
                    <p className="text-xs text-foreground-muted">{formatFileSize(doc.fileSize)}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  <Badge variant="outline" className="text-xs">{typeLabel(doc.documentType)}</Badge>
                  {statusBadge(doc.extractionStatus)}
                </div>
                <div className="mt-auto flex gap-2">
                  <Button asChild variant="outline" size="sm" className="flex-1">
                    <Link to={`/study-material/${doc.id}`}>
                      <ExternalLink className="h-4 w-4 mr-1" /> Open
                    </Link>
                  </Button>
                  <Button asChild variant="ghost" size="icon" aria-label="Download">
                    <a href={documentApi.getDocumentFileUrl(doc.id)} target="_blank" rel="noreferrer">
                      <Download className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No resources for this topic"
          description="Upload a PDF from the Study Material page to add resources."
          action={
            <Button asChild>
              <Link to="/study-material">Go to Study Material</Link>
            </Button>
          }
        />
      )}
    </div>
  )
}
