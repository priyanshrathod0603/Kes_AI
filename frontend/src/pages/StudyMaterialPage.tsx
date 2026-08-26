'use client'

import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { formatDate } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { useDocuments, useUploadDocument, useDownloadDocument, useDeleteDocument } from '@/hooks'
import { SUBJECTS } from '@/lib/constants'
import { Search, Filter, Download, Heart, Eye, FileText, ChevronDown, MoreHorizontal, Upload, Plus } from 'lucide-react'

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function getStatusBadge(status?: string) {
  switch (status) {
    case 'COMPLETED': return <Badge variant="success" className="text-xs">Ready</Badge>
    case 'PROCESSING': return <Badge variant="secondary" className="text-xs">Processing</Badge>
    case 'FAILED': return <Badge variant="destructive" className="text-xs">Failed</Badge>
    case 'NO_TEXT': return <Badge variant="warning" className="text-xs">No text</Badge>
    default: return <Badge variant="outline" className="text-xs">Pending</Badge>
  }
}

const FileIcon = FileText

export function StudyMaterialPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [subjectFilter, setSubjectFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [sortBy, setSortBy] = useState('uploadedAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  const { data: documentsData, isLoading } = useDocuments({
    subjectId: subjectFilter,
    documentType: typeFilter,
    sortBy,
    sortOrder,
    page: currentPage,
  })

  const { mutateAsync: uploadDocument } = useUploadDocument()
  const { mutateAsync: downloadDocument } = useDownloadDocument()
  const { mutateAsync: deleteDocument } = useDeleteDocument()

  const documents = documentsData?.data || []
  const totalPages = documentsData?.totalPages || 0

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const invalidateDocuments = () => {
    queryClient.invalidateQueries({ queryKey: ['documents'] })
  }

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const file = formData.get('file') as File
    const classId = formData.get('classId') as string || undefined
    const subjectId = formData.get('subjectId') as string || undefined
    const chapterId = formData.get('chapterId') as string || undefined
    const topicId = formData.get('topicId') as string || undefined
    const documentType = formData.get('documentType') as string || undefined

    if (!file) return

    try {
      await uploadDocument({ file, classId, subjectId, chapterId, topicId, documentType })
      setShowUploadDialog(false)
      invalidateDocuments()
      e.currentTarget.reset()
    } catch (error) {
      console.error('Failed to upload:', error)
    }
  }

  const handleDownload = async (id: string, fileName: string) => {
    try {
      const blob = await downloadDocument(id)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Failed to download:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return
    try {
      await deleteDocument(id)
      invalidateDocuments()
    } catch (error) {
      console.error('Failed to delete:', error)
    }
  }

  const filteredDocuments = documents

  return (
    <div className="space-y-6 animate-in">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground">Study Material</h1>
          <p className="text-foreground-muted">Access your learning resources and documents</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}>
            <FileText className="h-4 w-4" />
          </Button>
          <Button variant="gradient" onClick={() => setShowUploadDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Upload PDF
          </Button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground-muted" />
          <Input
            placeholder="Search documents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="h-10 rounded-lg border border-border bg-surface px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          >
            <option value="">All Subjects</option>
            {SUBJECTS.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-10 rounded-lg border border-border bg-surface px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          >
            <option value="">All Types</option>
            <option value="application/pdf">PDF</option>
          </select>
          <DropdownMenu>
            <DropdownMenuTrigger className="border-2 border-border bg-transparent hover:bg-muted hover:border-border-strong inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] h-11 px-4 py-2" aria-label="Sort options">
              <Filter className="h-4 w-4 mr-2" />
              Sort
              <ChevronDown className="h-4 w-4 ml-1" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Sort by</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => { setSortBy('uploadedAt'); setSortOrder('desc'); }}>Newest first</DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setSortBy('uploadedAt'); setSortOrder('asc'); }}>Oldest first</DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setSortBy('title'); setSortOrder('asc'); }}>Title A-Z</DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setSortBy('title'); setSortOrder('desc'); }}>Title Z-A</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => { setSortBy('fileSize'); setSortOrder('desc'); }}>Largest first</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} variant="elevated" padding="lg">
                <Skeleton className="h-12 w-12 rounded-xl mb-4" variant="circular" />
                <Skeleton className="h-4 w-3/4 rounded" />
                <Skeleton className="h-4 w-1/2 rounded mt-2" />
                <Skeleton className="h-4 w-1/4 rounded mt-4" />
              </Card>
            ))}
          </div>
        ) : filteredDocuments.length === 0 ? (
          <Card variant="elevated" padding="lg" className="text-center py-12">
            <FileText className="mx-auto h-16 w-16 text-foreground-muted mb-4" />
            <h3 className="text-lg font-semibold text-foreground">No documents found</h3>
            <p className="text-foreground-muted mt-2">Try adjusting your filters or upload your first PDF</p>
            <Button variant="gradient" className="mt-4" onClick={() => setShowUploadDialog(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Upload your first PDF
            </Button>
          </Card>
        ) : viewMode === 'grid' ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredDocuments.map((doc, index) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <DocumentCard
                  document={doc}
                  onDownload={handleDownload}
                  onDelete={handleDelete}
                />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredDocuments.map((doc, index) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <DocumentListItem
                  document={doc}
                  onDownload={handleDownload}
                  onDelete={handleDelete}
                />
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)}>
            Previous
          </Button>
          <span className="text-sm text-foreground-muted">Page {currentPage} of {totalPages}</span>
          <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => handlePageChange(currentPage + 1)}>
            Next
          </Button>
        </div>
      )}

      {/* Upload Dialog */}
      <UploadDialog
        isOpen={showUploadDialog}
        onClose={() => setShowUploadDialog(false)}
        onSubmit={handleUpload}
      />
    </div>
  )
}

function DocumentCard({ document, onDownload, onDelete }: { document: any; onDownload: (id: string, fileName: string) => void; onDelete: (id: string) => void }) {
  const subject = SUBJECTS.find(s => s.id === document.subjectId)

  return (
    <Card variant="elevated" padding="lg" className="h-full flex flex-col">
      <div className="flex items-start justify-between mb-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
          <FileIcon className="h-6 w-6 text-foreground-muted" />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger className="hover:bg-muted hover:text-foreground inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] h-8 w-8" aria-label="Document actions">
            <MoreHorizontal className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onDownload(document.id, document.fileName)}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(document.id)} className="text-error-600 focus:text-error-600">
              <MoreHorizontal className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="flex items-center justify-between text-xs text-foreground-muted border-t border-border pt-3">
        <span>{formatDate(document.createdAt)}</span>
        <span>{formatFileSize(document.fileSize)}</span>
      </div>
      <div className="mt-4 flex gap-2">
        <Button variant="outline" size="sm" className="flex-1" onClick={() => onDownload(document.id, document.fileName)}>
          <Download className="h-4 w-4 mr-1" />
          Open
        </Button>
      </div>
    </Card>
  )
}

function DocumentListItem({ document, onDownload, onDelete }: { document: any; onDownload: (id: string, fileName: string) => void; onDelete: (id: string) => void }) {
  const subject = SUBJECTS.find(s => s.id === document.subjectId)

  return (
    <Card variant="elevated" padding="sm" className="flex items-center gap-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted flex-shrink-0">
        <FileIcon className="h-6 w-6 text-foreground-muted" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-foreground truncate">{document.title}</h3>
        <p className="text-sm text-foreground-muted truncate">{document.description || 'No description'}</p>
        <div className="flex flex-wrap gap-2 mt-2">
          {subject && <Badge variant="secondary" className="text-xs">{subject.name}</Badge>}
          <Badge variant="outline" className="text-xs capitalize">PDF</Badge>
          {getStatusBadge(document.extractionStatus)}
        </div>
      </div>
      <div className="text-right text-xs text-foreground-muted hidden sm:block w-32">
        <p>{formatDate(document.createdAt)}</p>
        <p>{formatFileSize(document.fileSize)}</p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => onDownload(document.id, document.fileName)}>
          <Download className="h-4 w-4" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger className="hover:bg-muted hover:text-foreground inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] h-8 w-8" aria-label="Document actions">
            <MoreHorizontal className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onDownload(document.id, document.fileName)}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(document.id)} className="text-error-600 focus:text-error-600">
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  )
}

function UploadDialog({ isOpen, onClose, onSubmit }: { isOpen: boolean; onClose: () => void; onSubmit: (e: React.FormEvent<HTMLFormElement>) => void }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-surface rounded-2xl shadow-xl p-6"
      >
        <h2 className="text-xl font-semibold text-foreground mb-4">Upload PDF</h2>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">PDF File</label>
            <input
              type="file"
              name="file"
              accept=".pdf"
              required
              className="w-full text-sm text-foreground-muted file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Class</label>
              <select name="classId" className="w-full h-10 rounded-lg border border-border bg-surface px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20">
                <option value="">Select Class</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Subject</label>
              <select name="subjectId" className="w-full h-10 rounded-lg border border-border bg-surface px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20">
                <option value="">Select Subject</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t border-border">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="gradient">
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}