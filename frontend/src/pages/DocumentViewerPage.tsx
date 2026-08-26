'use client'

import { useParams, Link } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, Download, ExternalLink, FileText, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { PageHeader, ErrorState, LoadingState } from '@/components/feedback/States'
import { useDocument, useDocumentContent } from '@/hooks'
import { documentApi } from '@/api'

export function DocumentViewerPage() {
  const { id } = useParams<{ id: string }>()
  const { data: doc, isLoading, error } = useDocument(id)
  const { data: content } = useDocumentContent(id)
  const [pdfError, setPdfError] = useState<string | null>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    setPdfError(null)
  }, [id])

  if (isLoading) return <LoadingState label="Loading document…" />
  if (error || !doc) {
    return (
      <ErrorState
        title="Document not found"
        description={
          error && typeof error === 'object' && 'message' in error
            ? String((error as { message: string }).message)
            : 'The document you requested could not be loaded.'
        }
      />
    )
  }

  const fileUrl = documentApi.getDocumentFileUrl(doc.id)

  return (
    <div>
      <PageHeader
        title={doc.title}
        back={{ to: '/study-material', label: 'Back to Study Material' }}
        actions={
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <a href={fileUrl} target="_blank" rel="noreferrer">
                <ExternalLink className="h-4 w-4 mr-1" /> Open in new tab
              </a>
            </Button>
            <Button asChild variant="outline" size="sm">
              <a href={fileUrl} download={doc.fileName}>
                <Download className="h-4 w-4 mr-1" /> Download
              </a>
            </Button>
          </div>
        }
      />

      <Card className="overflow-hidden">
        {pdfError ? (
          <div className="p-6">
            <ErrorState
              title="Can't preview this PDF"
              description={pdfError}
            />
            <div className="text-center mt-4">
              <Button asChild>
                <a href={fileUrl} download={doc.fileName}>
                  <Download className="h-4 w-4 mr-1" /> Download instead
                </a>
              </Button>
            </div>
          </div>
        ) : (
          <div className="relative w-full bg-muted" style={{ height: 'calc(100vh - 18rem)', minHeight: 480 }}>
            <iframe
              ref={iframeRef}
              src={fileUrl}
              title={doc.title}
              className="absolute inset-0 w-full h-full border-0 bg-white"
              onError={() => setPdfError('The browser could not render this PDF.')}
            />
            <div className="absolute inset-0 -z-10 flex items-center justify-center text-foreground-muted">
              <Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading PDF…
            </div>
          </div>
        )}
      </Card>

      {content && (
        <div className="mt-6 grid gap-3 sm:grid-cols-3 text-sm">
          <div className="rounded-lg border border-border bg-surface p-3">
            <p className="text-foreground-muted">Extraction status</p>
            <p className="font-medium text-foreground mt-0.5">{content.extractionStatus}</p>
          </div>
          {content.pageCount > 0 && (
            <div className="rounded-lg border border-border bg-surface p-3">
              <p className="text-foreground-muted">Pages</p>
              <p className="font-medium text-foreground mt-0.5">{content.pageCount}</p>
            </div>
          )}
          {content.characterCount > 0 && (
            <div className="rounded-lg border border-border bg-surface p-3">
              <p className="text-foreground-muted">Characters</p>
              <p className="font-medium text-foreground mt-0.5">{content.characterCount.toLocaleString()}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
