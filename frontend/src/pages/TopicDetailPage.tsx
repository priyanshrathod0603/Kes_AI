'use client'

import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { FileText, ExternalLink, Download, Plus, Trash2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PageHeader, EmptyState, ErrorState, LoadingState } from '@/components/feedback/States'
import { DeleteConfirmDialog } from '@/components/management'
import { useSubjects, useChapters, useTopics, useDocuments, useDeleteDocument } from '@/hooks'
import { documentApi, type Document } from '@/api'

function typeLabel(t: string): string {
  switch (t) {
    case 'CHAPTER_MATERIAL':
      return 'Chapter Material'
    case 'WORKSHEET':
      return 'Worksheet'
    case 'QUESTION_PAPER':
      return 'Question Paper'
    case 'ANSWER_KEY':
      return 'Answer Key'
    case 'STUDY_MATERIAL':
    default:
      return 'Study Material'
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
  if (!bytes || isNaN(bytes)) return '0 B'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function TopicDetailPage() {
  const { subjectId, chapterId } = useParams<{ subjectId: string; chapterId: string }>()
  const [deleteTarget, setDeleteTarget] = useState<Document | null>(null)

  const { data: subjects = [] } = useSubjects()
  const { data: chapters = [], isLoading: chaptersLoading } = useChapters(
    subjectId ? { subjectId } : undefined,
    { enabled: !!subjectId }
  )
  const { data: topics = [], isLoading: topicsLoading } = useTopics(
    chapterId ? { chapterId } : undefined,
    { enabled: !!chapterId }
  )
  const { data: docs, isLoading: docsLoading, error: docsError } = useDocuments(
    chapterId ? { chapterId, limit: 50 } : undefined
  )
  const deleteMutation = useDeleteDocument()

  const subject = subjects.find((s) => s.id === subjectId)
  const chapter = chapters.find((c) => c.id === chapterId)

  if (chaptersLoading || topicsLoading || docsLoading) {
    return <LoadingState label="Loading topic resources…" />
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
        action={
          <Button asChild>
            <Link to="/subjects">Back to Subjects</Link>
          </Button>
        }
      />
    )
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteMutation.mutateAsync(deleteTarget.id)
      setDeleteTarget(null)
    } catch (err: unknown) {
      alert(`Failed to delete document: ${(err as Error).message}`)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={chapter.name}
        description={`Study materials and resources for ${chapter.name}`}
        back={{ to: `/subjects/${subject.id}/chapters/${chapter.id}`, label: `Back to ${chapter.name}` }}
        actions={
          <Button asChild>
            <Link to="/study-material">
              <Plus className="h-4 w-4 mr-1.5" /> Upload Study Material
            </Link>
          </Button>
        }
      />

      {topics.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 p-3 rounded-xl border border-border bg-surface">
          <span className="text-xs font-semibold text-foreground-muted mr-1">Topics:</span>
          {topics.map((t) => (
            <Badge key={t.id} variant="secondary" className="text-xs">
              {t.name}
            </Badge>
          ))}
        </div>
      )}

      {docs?.data && docs.data.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {docs.data.map((doc) => (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Card className="h-full flex flex-col p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-950/40 shrink-0">
                    <FileText className="h-5 w-5" />
                  </div>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(doc)}
                    className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-foreground-muted hover:bg-error-50 hover:text-error-600 transition-colors"
                    title="Delete document"
                    aria-label={`Delete ${doc.title}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <h3 className="font-semibold text-foreground line-clamp-2 mb-1" title={doc.title}>
                  {doc.title}
                </h3>
                <p className="text-xs text-foreground-muted mb-3">{formatFileSize(doc.fileSize)}</p>

                <div className="flex flex-wrap gap-1.5 mb-3">
                  <Badge variant="outline" className="text-xs">{typeLabel(doc.documentType)}</Badge>
                  {statusBadge(doc.extractionStatus)}
                </div>

                <div className="mt-auto flex gap-2 pt-2">
                  <Button asChild variant="outline" size="sm" className="flex-1">
                    <Link to={`/study-material/${doc.id}`}>
                      <ExternalLink className="h-4 w-4 mr-1.5" /> Open
                    </Link>
                  </Button>
                  <Button asChild variant="ghost" size="sm" className="px-2" title="Download">
                    <a href={documentApi.getDocumentFileUrl(doc.id)} target="_blank" rel="noreferrer" download={doc.fileName}>
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
          title="No resources for this topic yet"
          description="Upload a study material or chapter notes PDF to make it available for students."
          action={
            <Button asChild>
              <Link to="/study-material">
                <Plus className="h-4 w-4 mr-1.5" /> Upload Study Material
              </Link>
            </Button>
          }
        />
      )}

      {deleteTarget && (
        <DeleteConfirmDialog
          open={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          title="Delete Study Material"
          itemName={deleteTarget.title}
          description="This document and its extracted text will be permanently removed from the library."
          isDeleting={deleteMutation.isPending}
        />
      )}
    </div>
  )
}
