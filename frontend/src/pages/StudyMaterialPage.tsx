'use client'

import { useMemo, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import {
  Search,
  Upload,
  FileText,
  Trash2,
  X,
  Loader2,
  Filter,
  ExternalLink,
  Download,
  Grid3x3,
  List,
  ChevronDown,
  AlertCircle,
  Edit2,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { PageHeader, EmptyState, ErrorState, LoadingState } from '@/components/feedback/States'
import { DeleteConfirmDialog, EditDocumentDialog } from '@/components/management'
import {
  useDocuments,
  useUploadDocument,
  useDeleteDocument,
  useClasses,
  useSubjects,
  useChapters,
  useTopics,
} from '@/hooks'
import { documentApi, DOCUMENT_TYPES, type DocumentType, type Document } from '@/api'
import { cn } from '@/lib/utils'

function formatFileSize(bytes: number): string {
  if (!bytes || isNaN(bytes)) return '0 B'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(iso?: string): string {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return ''
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

export function StudyMaterialPage() {
  const [search, setSearch] = useState('')
  const [classId, setClassId] = useState('')
  const [subjectId, setSubjectId] = useState('')
  const [chapterId, setChapterId] = useState('')
  const [topicId, setTopicId] = useState('')
  const [documentType, setDocumentType] = useState<string>('')
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [uploadOpen, setUploadOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Document | null>(null)
  const [editTarget, setEditTarget] = useState<Document | null>(null)
  const [page, setPage] = useState(1)
  const limit = 20

  const filters = useMemo(
    () => ({
      classId: classId || undefined,
      subjectId: subjectId || undefined,
      chapterId: chapterId || undefined,
      topicId: topicId || undefined,
      documentType: documentType || undefined,
      page,
      limit,
    }),
    [classId, subjectId, chapterId, topicId, documentType, page, limit]
  )

  const { data, isLoading, error, refetch } = useDocuments(filters)
  const { data: classes = [] } = useClasses()
  const { data: subjects = [] } = useSubjects(
    classId ? { classId } : undefined,
    { enabled: !!classId }
  )
  const { data: chapters = [] } = useChapters(
    subjectId ? { subjectId } : undefined,
    { enabled: !!subjectId }
  )
  const { data: topics = [] } = useTopics(
    chapterId ? { chapterId } : undefined,
    { enabled: !!chapterId }
  )
  const deleteMutation = useDeleteDocument()

  const docs = useMemo(() => {
    return Array.isArray(data?.data) ? data.data : []
  }, [data])

  const filtered = useMemo(() => {
    if (!search.trim()) return docs
    const q = search.trim().toLowerCase()
    return docs.filter(
      (d) =>
        d.title?.toLowerCase().includes(q) ||
        d.fileName?.toLowerCase().includes(q)
    )
  }, [docs, search])

  const className = (id: string | null) => classes.find((c) => c.id === id)?.name
  const subjectName = (id: string | null) => subjects.find((s) => s.id === id)?.name
  const chapterName = (id: string | null) => chapters.find((c) => c.id === id)?.name
  const topicName = (id: string | null) => topics.find((t) => t.id === id)?.name

  const hasActiveFilters = Boolean(classId || subjectId || chapterId || topicId || documentType || search)

  const clearFilters = () => {
    setClassId('')
    setSubjectId('')
    setChapterId('')
    setTopicId('')
    setDocumentType('')
    setSearch('')
    setPage(1)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteMutation.mutateAsync(deleteTarget.id)
      setDeleteTarget(null)
    } catch (err: unknown) {
      alert(`Failed to delete: ${(err as Error).message}`)
    }
  }

  const errorMessage =
    error && typeof error === 'object' && 'message' in error
      ? String((error as { message: string }).message)
      : 'Could not load documents from server.'

  return (
    <div className="space-y-6">
      <PageHeader
        title="Study Material"
        description="Access and manage your learning documents."
        actions={
          <div className="flex items-center gap-2">
            <div className="hidden sm:inline-flex rounded-lg border border-border bg-surface p-0.5">
              <button
                type="button"
                aria-label="Grid view"
                onClick={() => setView('grid')}
                className={cn(
                  'h-8 w-8 inline-flex items-center justify-center rounded-md text-foreground-muted hover:text-foreground transition-colors',
                  view === 'grid' && 'bg-muted text-foreground font-medium'
                )}
              >
                <Grid3x3 className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label="List view"
                onClick={() => setView('list')}
                className={cn(
                  'h-8 w-8 inline-flex items-center justify-center rounded-md text-foreground-muted hover:text-foreground transition-colors',
                  view === 'list' && 'bg-muted text-foreground font-medium'
                )}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
            <Button onClick={() => setUploadOpen(true)}>
              <Upload className="h-4 w-4 mr-1.5" /> Upload PDF
            </Button>
          </div>
        }
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted pointer-events-none" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search documents by title or file name…"
            className="w-full h-10 rounded-xl border border-border bg-surface pl-9 pr-3 text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={classId}
            onChange={(e) => {
              setClassId(e.target.value)
              setSubjectId('')
              setChapterId('')
              setTopicId('')
              setPage(1)
            }}
            aria-label="Filter by class"
            className="h-10 rounded-xl border border-border bg-surface px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          >
            <option value="">All classes</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            value={subjectId}
            onChange={(e) => {
              setSubjectId(e.target.value)
              setChapterId('')
              setTopicId('')
              setPage(1)
            }}
            disabled={!classId}
            aria-label="Filter by subject"
            className="h-10 rounded-xl border border-border bg-surface px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:opacity-50"
          >
            <option value="">All subjects</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <select
            value={chapterId}
            onChange={(e) => {
              setChapterId(e.target.value)
              setTopicId('')
              setPage(1)
            }}
            disabled={!subjectId}
            aria-label="Filter by chapter"
            className="h-10 rounded-xl border border-border bg-surface px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:opacity-50"
          >
            <option value="">All chapters</option>
            {chapters.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            value={topicId}
            onChange={(e) => {
              setTopicId(e.target.value)
              setPage(1)
            }}
            disabled={!chapterId}
            aria-label="Filter by topic"
            className="h-10 rounded-xl border border-border bg-surface px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:opacity-50"
          >
            <option value="">All topics</option>
            {topics.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          <DropdownMenu>
            <DropdownMenuTrigger
              className="h-10 inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3 text-sm text-foreground hover:bg-muted focus:outline-none"
              aria-label="Document type filter"
            >
              <Filter className="h-4 w-4 text-foreground-muted" />
              <span>{documentType ? typeLabel(documentType) : 'All types'}</span>
              <ChevronDown className="h-3.5 w-3.5 text-foreground-muted" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Document type</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => { setDocumentType(''); setPage(1) }}>
                All types
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {DOCUMENT_TYPES.map((t) => (
                <DropdownMenuItem
                  key={t}
                  onClick={() => { setDocumentType(t); setPage(1) }}
                >
                  {typeLabel(t)}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-1" /> Clear
            </Button>
          )}
        </div>
      </div>

      {/* Content states */}
      {isLoading ? (
        <LoadingState label="Loading study materials…" />
      ) : error ? (
        <ErrorState
          title="Unable to load study materials"
          description={errorMessage}
          onRetry={() => refetch()}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          title={hasActiveFilters ? 'No matches found' : 'No study materials yet.'}
          description={
            hasActiveFilters
              ? 'Try clearing some filters or using a different search term.'
              : 'Upload your first PDF to get started.'
          }
          action={
            hasActiveFilters ? (
              <Button variant="outline" onClick={clearFilters}>
                Clear filters
              </Button>
            ) : (
              <Button onClick={() => setUploadOpen(true)}>
                <Upload className="h-4 w-4 mr-1.5" /> Upload PDF
              </Button>
            )
          }
        />
      ) : view === 'grid' ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((doc) => (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15 }}
            >
              <DocumentCard
                document={doc}
                className={className(doc.schoolClassId)}
                subject={subjectName(doc.subjectId)}
                chapter={chapterName(doc.chapterId)}
                topic={topicName(doc.topicId)}
                onDelete={() => setDeleteTarget(doc)}
                onEdit={() => setEditTarget(doc)}
              />
            </motion.div>
          ))}
        </div>
      ) : (
        <Card className="divide-y divide-border overflow-hidden">
          {filtered.map((doc) => (
            <DocumentListRow
              key={doc.id}
              document={doc}
              className={className(doc.schoolClassId)}
              subject={subjectName(doc.subjectId)}
              chapter={chapterName(doc.chapterId)}
              topic={topicName(doc.topicId)}
              onDelete={() => setDeleteTarget(doc)}
              onEdit={() => setEditTarget(doc)}
            />
          ))}
        </Card>
      )}

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm pt-2">
          <span className="text-foreground-muted">
            Page {data.page} of {data.totalPages} · {data.total} document{data.total !== 1 ? 's' : ''}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= data.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Upload Dialog */}
      <UploadDialog
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
      />

      {/* Delete Confirmation Dialog */}
      {deleteTarget && (
        <DeleteConfirmDialog
          open={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          title="Delete Study Material"
          itemName={deleteTarget.title}
          description="This file will be permanently removed from the server and database."
          isDeleting={deleteMutation.isPending}
        />
      )}

      {/* Edit Document Dialog */}
      {editTarget && (
        <EditDocumentDialog
          open={!!editTarget}
          onClose={() => setEditTarget(null)}
          document={editTarget}
        />
      )}
    </div>
  )
}

function DocumentCard({
  document,
  className,
  subject,
  chapter,
  topic,
  onDelete,
  onEdit,
}: {
  document: Document
  className?: string
  subject?: string
  chapter?: string
  topic?: string
  onDelete: () => void
  onEdit: () => void
}) {
  const fileUrl = documentApi.getDocumentFileUrl(document.id)

  return (
    <Card className="h-full flex flex-col p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-950/40 shrink-0">
          <FileText className="h-5 w-5" />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger
            className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-foreground-muted hover:bg-muted hover:text-foreground focus:outline-none"
            aria-label="Document actions"
          >
            <ChevronDown className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link to={`/study-material/${document.id}`} className="flex items-center">
                <ExternalLink className="h-4 w-4 mr-2" /> Open in viewer
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a
                href={fileUrl}
                target="_blank"
                rel="noreferrer"
                download={document.fileName}
                className="flex items-center"
              >
                <Download className="h-4 w-4 mr-2" /> Download PDF
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onEdit} className="flex items-center cursor-pointer">
              <Edit2 className="h-4 w-4 mr-2" /> Edit Details
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={onDelete}
              className="text-error-600 focus:text-error-600 cursor-pointer"
            >
              <Trash2 className="h-4 w-4 mr-2" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <h3 className="font-semibold text-foreground line-clamp-2 mb-1" title={document.title}>
        {document.title}
      </h3>
      <p className="text-xs text-foreground-muted mb-3">
        {formatFileSize(document.fileSize)}
        {document.createdAt && ` • ${formatDate(document.createdAt)}`}
      </p>

      <div className="flex flex-wrap gap-1.5 mb-3">
        <Badge variant="outline" className="text-xs">
          {typeLabel(document.documentType)}
        </Badge>
        {statusBadge(document.extractionStatus)}
      </div>

      <div className="mt-auto space-y-1 text-xs text-foreground-muted pt-2 border-t border-border/50">
        {className && <p><span className="text-foreground/70 font-medium">Class:</span> {className}</p>}
        {subject && <p><span className="text-foreground/70 font-medium">Subject:</span> {subject}</p>}
        {chapter && <p><span className="text-foreground/70 font-medium">Chapter:</span> {chapter}</p>}
        {topic && <p><span className="text-foreground/70 font-medium">Topic:</span> {topic}</p>}
      </div>

      <div className="mt-4 flex gap-2">
        <Button asChild variant="outline" size="sm" className="flex-1">
          <Link to={`/study-material/${document.id}`}>Open</Link>
        </Button>
        <Button asChild variant="ghost" size="sm" className="px-2" title="Download">
          <a href={fileUrl} download={document.fileName} target="_blank" rel="noreferrer">
            <Download className="h-4 w-4" />
          </a>
        </Button>
      </div>
    </Card>
  )
}

function DocumentListRow({
  document,
  className,
  subject,
  chapter,
  topic,
  onDelete,
  onEdit,
}: {
  document: Document
  className?: string
  subject?: string
  chapter?: string
  topic?: string
  onDelete: () => void
  onEdit: () => void
}) {
  const meta = [className, subject, chapter, topic].filter(Boolean).join(' • ')
  const fileUrl = documentApi.getDocumentFileUrl(document.id)

  return (
    <div className="flex items-center gap-3 p-3.5 hover:bg-muted/30 transition-colors">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-600 dark:bg-primary-950/40 shrink-0">
        <FileText className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <Link
          to={`/study-material/${document.id}`}
          className="font-medium text-foreground truncate hover:text-primary-600 block"
        >
          {document.title}
        </Link>
        <p className="text-xs text-foreground-muted truncate mt-0.5">
          {meta ? `${meta} • ` : ''}
          {typeLabel(document.documentType)}
        </p>
      </div>
      <div className="hidden sm:flex items-center gap-2 text-xs text-foreground-muted">
        {statusBadge(document.extractionStatus)}
        <span>{formatFileSize(document.fileSize)}</span>
      </div>
      <div className="flex items-center gap-1">
        <Button asChild variant="ghost" size="icon" aria-label="Open document">
          <Link to={`/study-material/${document.id}`}>
            <ExternalLink className="h-4 w-4" />
          </Link>
        </Button>
        <Button asChild variant="ghost" size="icon" aria-label="Download document">
          <a href={fileUrl} download={document.fileName} target="_blank" rel="noreferrer">
            <Download className="h-4 w-4" />
          </a>
        </Button>
        <Button variant="ghost" size="icon" aria-label="Edit document details" onClick={onEdit}>
          <Edit2 className="h-4 w-4 text-foreground-muted" />
        </Button>
        <Button variant="ghost" size="icon" aria-label="Delete" onClick={onDelete}>
          <Trash2 className="h-4 w-4 text-error-600" />
        </Button>
      </div>
    </div>
  )
}

function UploadDialog({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const [file, setFile] = useState<File | null>(null)
  const [classId, setClassId] = useState('')
  const [subjectId, setSubjectId] = useState('')
  const [chapterId, setChapterId] = useState('')
  const [topicId, setTopicId] = useState('')
  const [documentType, setDocumentType] = useState<DocumentType>('STUDY_MATERIAL')
  const [error, setError] = useState<string | null>(null)

  const { data: classes = [] } = useClasses()
  const { data: subjects = [] } = useSubjects(
    classId ? { classId } : undefined,
    { enabled: !!classId }
  )
  const { data: chapters = [] } = useChapters(
    subjectId ? { subjectId } : undefined,
    { enabled: !!subjectId }
  )
  const { data: topics = [] } = useTopics(
    chapterId ? { chapterId } : undefined,
    { enabled: !!chapterId }
  )

  const upload = useUploadDocument()

  const reset = () => {
    setFile(null)
    setClassId('')
    setSubjectId('')
    setChapterId('')
    setTopicId('')
    setDocumentType('STUDY_MATERIAL')
    setError(null)
  }

  const handleClose = () => {
    if (!upload.isPending) {
      reset()
      onClose()
    }
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!file) {
      setError('Please choose a PDF file to upload.')
      return
    }
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setError('Only PDF files are supported.')
      return
    }

    try {
      await upload.mutateAsync({
        file,
        classId: classId || undefined,
        subjectId: subjectId || undefined,
        chapterId: chapterId || undefined,
        topicId: topicId || undefined,
        documentType,
      })
      reset()
      onClose()
    } catch (err) {
      setError((err as Error).message || 'Failed to upload file. Please try again.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? null : handleClose())}>
      <DialogContent className="sm:max-w-lg">
        <button
          type="button"
          aria-label="Close"
          onClick={handleClose}
          disabled={upload.isPending}
          className="absolute right-4 top-4 rounded-md p-1 text-foreground-muted hover:text-foreground disabled:opacity-50"
        >
          <X className="h-4 w-4" />
        </button>
        <DialogHeader>
          <DialogTitle>Upload PDF</DialogTitle>
          <DialogDescription>
            Add a study resource. Tag it with an optional class, subject, chapter, and topic.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4 pt-2">
          <label className="block">
            <span className="text-sm font-medium text-foreground">PDF file *</span>
            <input
              type="file"
              accept="application/pdf,.pdf"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              required
              disabled={upload.isPending}
              className="mt-1.5 block w-full text-sm text-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-primary-600 file:px-3 file:py-2 file:text-white hover:file:bg-primary-700 disabled:opacity-50"
            />
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs font-medium text-foreground-muted">Class</span>
              <select
                value={classId}
                onChange={(e) => {
                  setClassId(e.target.value)
                  setSubjectId('')
                  setChapterId('')
                  setTopicId('')
                }}
                disabled={upload.isPending}
                className="mt-1 w-full h-9 rounded-lg border border-border bg-surface px-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              >
                <option value="">Optional</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-medium text-foreground-muted">Subject</span>
              <select
                value={subjectId}
                onChange={(e) => {
                  setSubjectId(e.target.value)
                  setChapterId('')
                  setTopicId('')
                }}
                disabled={!classId || upload.isPending}
                className="mt-1 w-full h-9 rounded-lg border border-border bg-surface px-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:opacity-50"
              >
                <option value="">Optional</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-medium text-foreground-muted">Chapter</span>
              <select
                value={chapterId}
                onChange={(e) => {
                  setChapterId(e.target.value)
                  setTopicId('')
                }}
                disabled={!subjectId || upload.isPending}
                className="mt-1 w-full h-9 rounded-lg border border-border bg-surface px-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:opacity-50"
              >
                <option value="">Optional</option>
                {chapters.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-medium text-foreground-muted">Topic</span>
              <select
                value={topicId}
                onChange={(e) => setTopicId(e.target.value)}
                disabled={!chapterId || upload.isPending}
                className="mt-1 w-full h-9 rounded-lg border border-border bg-surface px-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:opacity-50"
              >
                <option value="">Optional</option>
                {topics.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block sm:col-span-2">
              <span className="text-xs font-medium text-foreground-muted">Document type</span>
              <select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value as DocumentType)}
                disabled={upload.isPending}
                className="mt-1 w-full h-9 rounded-lg border border-border bg-surface px-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              >
                {DOCUMENT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {typeLabel(t)}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-error-200 bg-error-50 p-3 text-sm text-error-700 dark:bg-error-950/30">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
              disabled={upload.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={upload.isPending || !file}>
              {upload.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                  Uploading…
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-1.5" />
                  Upload
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
