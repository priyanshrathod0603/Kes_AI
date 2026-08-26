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
} from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
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
import {
  useDocuments,
  useUploadDocument,
  useDeleteDocument,
  useClasses,
  useSubjects,
  useChapters,
  useTopics,
} from '@/hooks'
import { documentApi, DOCUMENT_TYPES, type DocumentType } from '@/api'
import { cn } from '@/lib/utils'

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
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

function typeLabel(t: string) {
  switch (t) {
    case 'CHAPTER_MATERIAL':
      return 'Chapter'
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
  const [page, setPage] = useState(1)
  const limit = 20

  const filters = {
    classId: classId || undefined,
    subjectId: subjectId || undefined,
    chapterId: chapterId || undefined,
    topicId: topicId || undefined,
    documentType: documentType || undefined,
    page,
    limit,
  }

  const { data, isLoading, error, refetch } = useDocuments(filters)
  const { data: classes = [] } = useClasses()
  const { data: subjects = [] } = useSubjects(classId ? { classId } : undefined)
  const { data: chapters = [] } = useChapters(subjectId ? { subjectId } : undefined)
  const { data: topics = [] } = useTopics(chapterId ? { chapterId } : undefined)
  const deleteMutation = useDeleteDocument()

  const filtered = useMemo(() => {
    const docs = data?.data ?? []
    if (!search) return docs
    const q = search.toLowerCase()
    return docs.filter(
      (d) => d.title.toLowerCase().includes(q) || d.fileName.toLowerCase().includes(q)
    )
  }, [data, search])

  const className = (id: string | null) => classes.find((c) => c.id === id)?.name
  const subjectName = (id: string | null) => subjects.find((s) => s.id === id)?.name
  const chapterName = (id: string | null) => chapters.find((c) => c.id === id)?.name
  const topicName = (id: string | null) => topics.find((t) => t.id === id)?.name

  const clearFilters = () => {
    setClassId('')
    setSubjectId('')
    setChapterId('')
    setTopicId('')
    setDocumentType('')
    setSearch('')
    setPage(1)
  }

  const onDelete = async (id: string) => {
    if (!confirm('Delete this document? This cannot be undone.')) return
    try {
      await deleteMutation.mutateAsync(id)
    } catch (err) {
      alert(`Failed to delete: ${(err as Error).message}`)
    }
  }

  const errorMessage =
    error && typeof error === 'object' && 'message' in error
      ? String((error as { message: string }).message)
      : 'Could not load documents.'

  return (
    <div>
      <PageHeader
        title="Study Material"
        description="Access your learning resources and PDFs"
        actions={
          <div className="flex items-center gap-2">
            <div className="hidden sm:inline-flex rounded-lg border border-border bg-surface p-0.5">
              <button
                type="button"
                aria-label="Grid view"
                onClick={() => setView('grid')}
                className={cn(
                  'h-8 w-8 inline-flex items-center justify-center rounded-md text-foreground-muted hover:text-foreground',
                  view === 'grid' && 'bg-muted text-foreground'
                )}
              >
                <Grid3x3 className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label="List view"
                onClick={() => setView('list')}
                className={cn(
                  'h-8 w-8 inline-flex items-center justify-center rounded-md text-foreground-muted hover:text-foreground',
                  view === 'list' && 'bg-muted text-foreground'
                )}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
            <Button onClick={() => setUploadOpen(true)}>
              <Upload className="h-4 w-4 mr-1" /> Upload PDF
            </Button>
          </div>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center mb-4">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search documents…"
            className="w-full h-10 rounded-lg border border-border bg-surface pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
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
            className="h-10 rounded-lg border border-border bg-surface px-2 text-sm"
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
            className="h-10 rounded-lg border border-border bg-surface px-2 text-sm disabled:opacity-50"
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
            className="h-10 rounded-lg border border-border bg-surface px-2 text-sm disabled:opacity-50"
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
            className="h-10 rounded-lg border border-border bg-surface px-2 text-sm disabled:opacity-50"
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
              className="h-10 inline-flex items-center gap-1 rounded-lg border border-border bg-surface px-3 text-sm hover:bg-muted"
              aria-label="Document type"
            >
              <Filter className="h-4 w-4" />
              {documentType ? typeLabel(documentType) : 'Type'}
              <ChevronDown className="h-3 w-3" />
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
          {(classId || subjectId || chapterId || topicId || documentType || search) && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-1" /> Clear
            </Button>
          )}
        </div>
      </div>

      {isLoading ? (
        <LoadingState label="Loading documents…" />
      ) : error ? (
        <ErrorState
          title="Couldn't load documents"
          description={errorMessage}
          onRetry={() => refetch()}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          title={data?.total === 0 ? 'No documents yet' : 'No matches'}
          description={
            data?.total === 0
              ? 'Upload your first PDF to get started.'
              : 'Try clearing some filters or a different search term.'
          }
          action={
            data?.total === 0 ? (
              <Button onClick={() => setUploadOpen(true)}>
                <Upload className="h-4 w-4 mr-1" /> Upload PDF
              </Button>
            ) : (
              <Button variant="outline" onClick={clearFilters}>
                Clear filters
              </Button>
            )
          }
        />
      ) : view === 'grid' ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((doc) => (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <DocumentCard
                document={doc}
                className={className(doc.schoolClassId)}
                subject={subjectName(doc.subjectId)}
                chapter={chapterName(doc.chapterId)}
                topic={topicName(doc.topicId)}
                onDelete={() => onDelete(doc.id)}
                deleting={deleteMutation.isPending}
              />
            </motion.div>
          ))}
        </div>
      ) : (
        <Card className="divide-y divide-border">
          {filtered.map((doc) => (
            <DocumentListRow
              key={doc.id}
              document={doc}
              className={className(doc.schoolClassId)}
              subject={subjectName(doc.subjectId)}
              chapter={chapterName(doc.chapterId)}
              topic={topicName(doc.topicId)}
              onDelete={() => onDelete(doc.id)}
            />
          ))}
        </Card>
      )}

      {data && data.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between text-sm">
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

      <UploadDialog
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        classes={classes}
        subjects={subjects}
        chapters={chapters}
        topics={topics}
      />
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
  deleting,
}: {
  document: import('@/api').Document
  className?: string
  subject?: string
  chapter?: string
  topic?: string
  onDelete: () => void
  deleting: boolean
}) {
  return (
    <Card className="h-full flex flex-col">
      <div className="flex items-start justify-between mb-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
          <FileText className="h-5 w-5" />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger
            className="h-8 w-8 inline-flex items-center justify-center rounded-md text-foreground-muted hover:bg-muted hover:text-foreground"
            aria-label="Document actions"
          >
            <ChevronDown className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link to={`/study-material/${document.id}`} className="flex items-center">
                <ExternalLink className="h-4 w-4 mr-2" /> Open
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a
                href={documentApi.getDocumentFileUrl(document.id)}
                target="_blank"
                rel="noreferrer"
                className="flex items-center"
              >
                <Download className="h-4 w-4 mr-2" /> Download
              </a>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={onDelete}
              disabled={deleting}
              className="text-error-600 focus:text-error-600"
            >
              <Trash2 className="h-4 w-4 mr-2" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <h3 className="font-semibold text-foreground line-clamp-2 mb-1" title={document.title}>
        {document.title}
      </h3>
      <p className="text-xs text-foreground-muted mb-3">{formatFileSize(document.fileSize)}</p>
      <div className="flex flex-wrap gap-1.5 mb-3">
        <Badge variant="outline" className="text-xs">{typeLabel(document.documentType)}</Badge>
        {statusBadge(document.extractionStatus)}
      </div>
      <div className="mt-auto space-y-1 text-xs text-foreground-muted">
        {className && <p><span className="text-foreground/70">Class:</span> {className}</p>}
        {subject && <p><span className="text-foreground/70">Subject:</span> {subject}</p>}
        {chapter && <p><span className="text-foreground/70">Chapter:</span> {chapter}</p>}
        {topic && <p><span className="text-foreground/70">Topic:</span> {topic}</p>}
      </div>
      <div className="mt-4 flex gap-2">
        <Button asChild variant="outline" size="sm" className="flex-1">
          <Link to={`/study-material/${document.id}`}>Open</Link>
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
}: {
  document: import('@/api').Document
  className?: string
  subject?: string
  chapter?: string
  topic?: string
  onDelete: () => void
}) {
  return (
    <div className="flex items-center gap-3 p-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-600 shrink-0">
        <FileText className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground truncate">{document.title}</p>
        <p className="text-xs text-foreground-muted truncate">
          {[className, subject, chapter, topic].filter(Boolean).join(' · ') || typeLabel(document.documentType)}
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
  classes,
  subjects,
  chapters,
  topics,
}: {
  open: boolean
  onClose: () => void
  classes: { id: string; name: string }[]
  subjects: { id: string; name: string }[]
  chapters: { id: string; name: string }[]
  topics: { id: string; name: string }[]
}) {
  const [file, setFile] = useState<File | null>(null)
  const [classId, setClassId] = useState('')
  const [subjectId, setSubjectId] = useState('')
  const [chapterId, setChapterId] = useState('')
  const [topicId, setTopicId] = useState('')
  const [documentType, setDocumentType] = useState<DocumentType>('STUDY_MATERIAL')
  const [error, setError] = useState<string | null>(null)

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

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!file) {
      setError('Please choose a PDF file.')
      return
    }
    if (file.type !== 'application/pdf') {
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
      setError((err as Error).message || 'Upload failed')
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? null : onClose())}>
      <DialogContent>
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-md p-1 text-foreground-muted hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
        <DialogHeader>
          <DialogTitle>Upload PDF</DialogTitle>
          <DialogDescription>
            Add a study resource. You can tag it with a class, subject, chapter, and topic.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-foreground">PDF file</span>
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              required
              className="mt-1 block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-primary-600 file:px-3 file:py-2 file:text-white hover:file:bg-primary-700"
            />
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="block">
              <span className="text-sm font-medium text-foreground-muted">Class</span>
              <select
                value={classId}
                onChange={(e) => {
                  setClassId(e.target.value)
                  setSubjectId('')
                  setChapterId('')
                  setTopicId('')
                }}
                className="mt-1 w-full h-10 rounded-lg border border-border bg-surface px-2 text-sm"
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
              <span className="text-sm font-medium text-foreground-muted">Subject</span>
              <select
                value={subjectId}
                onChange={(e) => {
                  setSubjectId(e.target.value)
                  setChapterId('')
                  setTopicId('')
                }}
                disabled={!classId}
                className="mt-1 w-full h-10 rounded-lg border border-border bg-surface px-2 text-sm disabled:opacity-50"
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
              <span className="text-sm font-medium text-foreground-muted">Chapter</span>
              <select
                value={chapterId}
                onChange={(e) => {
                  setChapterId(e.target.value)
                  setTopicId('')
                }}
                disabled={!subjectId}
                className="mt-1 w-full h-10 rounded-lg border border-border bg-surface px-2 text-sm disabled:opacity-50"
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
              <span className="text-sm font-medium text-foreground-muted">Topic</span>
              <select
                value={topicId}
                onChange={(e) => setTopicId(e.target.value)}
                disabled={!chapterId}
                className="mt-1 w-full h-10 rounded-lg border border-border bg-surface px-2 text-sm disabled:opacity-50"
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
              <span className="text-sm font-medium text-foreground-muted">Document type</span>
              <select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value as DocumentType)}
                className="mt-1 w-full h-10 rounded-lg border border-border bg-surface px-2 text-sm"
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
            <div className="flex items-start gap-2 rounded-lg border border-error-200 bg-error-50 p-3 text-sm text-error-700">
              <AlertCircle className="h-4 w-4 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={upload.isPending}>
              {upload.isPending ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Upload className="h-4 w-4 mr-1" />
              )}
              Upload
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
