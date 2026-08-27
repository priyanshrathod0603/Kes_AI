'use client'

import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { FileText, Bot, Download, ArrowRight, Eye, Edit2, Trash2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PageHeader, EmptyState, ErrorState, LoadingState } from '@/components/feedback/States'
import { EditTopicDialog, DeleteConfirmDialog, EditDocumentDialog } from '@/components/management'
import { useTopics, useChapters, useDocuments, useDownloadDocument, useDeleteDocument, useDeleteTopic } from '@/hooks'
import { formatFileSize, formatRelativeTime } from '@/lib/utils'
import type { Topic, Document } from '@/types'

export function TopicDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [editTopicOpen, setEditTopicOpen] = useState(false)
  const [deleteTopicOpen, setDeleteTopicOpen] = useState(false)
  const [editDocTarget, setEditDocTarget] = useState<Document | null>(null)
  const [deleteDocTarget, setDeleteDocTarget] = useState<Document | null>(null)

  const { data: topics = [], isLoading: topicsLoading } = useTopics()
  const { data: chapters = [], isLoading: chaptersLoading } = useChapters()
  const { data: docsResponse, isLoading: docsLoading } = useDocuments({ topicId: id })

  const downloadMutation = useDownloadDocument()
  const deleteDocMutation = useDeleteDocument()
  const deleteTopicMutation = useDeleteTopic()

  const topic = topics.find((t) => t.id === id)
  const chapter = topic ? chapters.find((c) => c.id === topic.chapterId) : null
  const documents = docsResponse?.data ?? []

  const isLoading = topicsLoading || chaptersLoading || docsLoading

  if (isLoading) return <LoadingState label="Loading topic…" />

  if (!topic) {
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

  const handleDownload = async (doc: Document) => {
    try {
      const blob = await downloadMutation.mutateAsync(doc.id)
      const url = window.URL.createObjectURL(blob)
      const a = window.document.createElement('a')
      a.href = url
      a.download = doc.fileName || `${doc.title}.pdf`
      window.document.body.appendChild(a)
      a.click()
      window.document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch {
      alert('Failed to download document.')
    }
  }

  const handleDeleteDoc = async () => {
    if (!deleteDocTarget) return
    try {
      await deleteDocMutation.mutateAsync(deleteDocTarget.id)
      setDeleteDocTarget(null)
    } catch (err: unknown) {
      alert(`Failed to delete document: ${(err as Error).message}`)
    }
  }

  const handleDeleteTopic = async () => {
    try {
      await deleteTopicMutation.mutateAsync(topic.id)
      window.location.href = chapter ? `/chapters/${chapter.id}` : '/subjects'
    } catch (err: unknown) {
      alert(`Failed to delete topic: ${(err as Error).message}`)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={topic.name}
        description={chapter ? `Part of ${chapter.name}` : 'Topic overview and materials'}
        back={
          chapter
            ? { to: `/chapters/${chapter.id}`, label: `Back to ${chapter.name}` }
            : { to: '/subjects', label: 'Back to Subjects' }
        }
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setEditTopicOpen(true)}>
              <Edit2 className="h-3.5 w-3.5 mr-1" /> Edit Topic
            </Button>
            <Button variant="outline" size="sm" onClick={() => setDeleteTopicOpen(true)} className="text-error-600 hover:text-error-700 hover:bg-error-50">
              <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
            </Button>
            <Button asChild>
              <Link to="/ai-tutor">
                <Bot className="h-4 w-4 mr-1.5" /> Launch AI Tutor
              </Link>
            </Button>
          </div>
        }
      />

      {/* Quick Launch Banner */}
      <Card className="p-5 bg-gradient-to-r from-primary-50 to-primary-100/40 border-primary-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="font-semibold text-primary-950 text-base">
              Learn "{topic.name}" with KES AI
            </h3>
            <p className="text-xs text-primary-800 mt-1 max-w-xl">
              Start an interactive learning conversation tailored to this topic. Ask questions, request examples, or generate custom quizzes.
            </p>
          </div>
          <Button asChild className="shrink-0">
            <Link to="/ai-tutor">
              Start Session <ArrowRight className="h-4 w-4 ml-1.5" />
            </Link>
          </Button>
        </div>
      </Card>

      {/* Study Materials for this topic */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-foreground">
            Study Materials ({documents.length})
          </h3>
          <Button asChild variant="outline" size="sm">
            <Link to="/study-material">
              Upload PDF <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Link>
          </Button>
        </div>

        {documents.length === 0 ? (
          <EmptyState
            title="No materials attached to this topic"
            description="Upload PDFs in the Study Material section and tag them to this topic."
            action={
              <Button asChild variant="outline" size="sm">
                <Link to="/study-material">Go to Study Material</Link>
              </Button>
            }
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {documents.map((doc) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15 }}
              >
                <Card className="p-4 flex flex-col justify-between hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-50 text-primary-600 shrink-0">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-semibold text-sm text-foreground truncate">{doc.title}</h4>
                        <p className="text-xs text-foreground-muted">
                          {formatFileSize(doc.fileSize)} • {formatRelativeTime(doc.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setEditDocTarget(doc)}
                        className="h-7 w-7 inline-flex items-center justify-center rounded-lg text-foreground-muted hover:bg-muted hover:text-foreground transition-colors"
                        title="Edit Document"
                      >
                        <Edit2 className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteDocTarget(doc)}
                        className="h-7 w-7 inline-flex items-center justify-center rounded-lg text-foreground-muted hover:bg-error-50 hover:text-error-600 transition-colors"
                        title="Delete Document"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border mt-2">
                    <Badge variant="secondary" className="text-xs">
                      {doc.documentType || 'STUDY_MATERIAL'}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownload(doc)}
                      disabled={downloadMutation.isPending}
                    >
                      <Download className="h-3.5 w-3.5 mr-1" /> Download
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <EditTopicDialog
        open={editTopicOpen}
        onClose={() => setEditTopicOpen(false)}
        topic={topic}
        subjectId={chapter?.subjectId}
      />

      <DeleteConfirmDialog
        open={deleteTopicOpen}
        onClose={() => setDeleteTopicOpen(false)}
        onConfirm={handleDeleteTopic}
        title="Delete Topic"
        itemName={topic.name}
        description="Are you sure you want to delete this topic?"
        isDeleting={deleteTopicMutation.isPending}
      />

      {editDocTarget && (
        <EditDocumentDialog
          open={!!editDocTarget}
          onClose={() => setEditDocTarget(null)}
          document={editDocTarget}
        />
      )}

      {deleteDocTarget && (
        <DeleteConfirmDialog
          open={!!deleteDocTarget}
          onClose={() => setDeleteDocTarget(null)}
          onConfirm={handleDeleteDoc}
          title="Delete Document"
          itemName={deleteDocTarget.title}
          description="Are you sure you want to delete this study material? The PDF file will be removed."
          isDeleting={deleteDocMutation.isPending}
        />
      )}
    </div>
  )
}
