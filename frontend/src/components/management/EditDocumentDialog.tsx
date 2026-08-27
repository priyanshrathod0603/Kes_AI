'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FileText, Loader2, Check, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { useUpdateDocument, useClasses, useSubjects, useChapters, useTopics } from '@/hooks'
import { DOCUMENT_TYPES, type Document, type DocumentType } from '@/api'

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

const editDocumentFormSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be at most 200 characters')
    .trim(),
  documentType: z.string().min(1, 'Document type is required'),
  classId: z.string().optional(),
  subjectId: z.string().optional(),
  chapterId: z.string().optional(),
  topicId: z.string().optional(),
})

type EditDocumentFormValues = z.infer<typeof editDocumentFormSchema>

interface EditDocumentDialogProps {
  open: boolean
  onClose: () => void
  document: Document | null
  onSuccess?: () => void
}

export function EditDocumentDialog({
  open,
  onClose,
  document,
  onSuccess,
}: EditDocumentDialogProps) {
  const [serverError, setServerError] = useState<string | null>(null)
  const [selectedClassId, setSelectedClassId] = useState('')
  const [selectedSubjectId, setSelectedSubjectId] = useState('')
  const [selectedChapterId, setSelectedChapterId] = useState('')

  const { data: classes = [] } = useClasses()
  const { data: subjects = [] } = useSubjects(
    selectedClassId ? { classId: selectedClassId } : undefined,
    { enabled: !!selectedClassId }
  )
  const { data: chapters = [] } = useChapters(
    selectedSubjectId ? { subjectId: selectedSubjectId } : undefined,
    { enabled: !!selectedSubjectId }
  )
  const { data: topics = [] } = useTopics(
    selectedChapterId ? { chapterId: selectedChapterId } : undefined,
    { enabled: !!selectedChapterId }
  )

  const updateDocMutation = useUpdateDocument()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<EditDocumentFormValues>({
    resolver: zodResolver(editDocumentFormSchema),
    defaultValues: {
      title: document?.title ?? '',
      documentType: document?.documentType ?? 'STUDY_MATERIAL',
      classId: document?.schoolClassId ?? '',
      subjectId: document?.subjectId ?? '',
      chapterId: document?.chapterId ?? '',
      topicId: document?.topicId ?? '',
    },
  })

  useEffect(() => {
    if (document) {
      reset({
        title: document.title,
        documentType: document.documentType,
        classId: document.schoolClassId ?? '',
        subjectId: document.subjectId ?? '',
        chapterId: document.chapterId ?? '',
        topicId: document.topicId ?? '',
      })
      setSelectedClassId(document.schoolClassId ?? '')
      setSelectedSubjectId(document.subjectId ?? '')
      setSelectedChapterId(document.chapterId ?? '')
      setServerError(null)
    }
  }, [document, reset])

  const handleClose = () => {
    if (!updateDocMutation.isPending && !isSubmitting) {
      setServerError(null)
      onClose()
    }
  }

  const onSubmit = async (values: EditDocumentFormValues) => {
    if (!document) return
    setServerError(null)
    try {
      await updateDocMutation.mutateAsync({
        id: document.id,
        title: values.title,
        documentType: values.documentType,
        classId: values.classId || null,
        subjectId: values.subjectId || null,
        chapterId: values.chapterId || null,
        topicId: values.topicId || null,
      })
      onSuccess?.()
      onClose()
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: string }).message)
          : 'Failed to update document. Please try again.'
      setServerError(msg)
    }
  }

  const isPending = isSubmitting || updateDocMutation.isPending

  return (
    <Dialog open={open} onOpenChange={(isOpen) => (isOpen ? null : handleClose())}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
              <FileText className="h-4 w-4" />
            </div>
            <DialogTitle>Edit Document Details</DialogTitle>
          </div>
          <DialogDescription>
            Update document title, type, or academic taxonomy tags.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <div>
            <label htmlFor="editDocTitle" className="block text-sm font-medium text-foreground mb-1">
              Title <span className="text-error-600">*</span>
            </label>
            <input
              id="editDocTitle"
              type="text"
              placeholder="e.g. Chapter 1 Notes"
              disabled={isPending}
              {...register('title')}
              className="w-full h-10 rounded-xl border border-border bg-surface px-3 text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors disabled:opacity-50"
            />
            {errors.title && (
              <p className="mt-1 text-xs text-error-600 font-medium">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="editDocType" className="block text-sm font-medium text-foreground mb-1">
              Document Type <span className="text-error-600">*</span>
            </label>
            <select
              id="editDocType"
              disabled={isPending}
              {...register('documentType')}
              className="w-full h-10 rounded-xl border border-border bg-surface px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors disabled:opacity-50"
            >
              {DOCUMENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {typeLabel(t)}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="editDocClass" className="block text-xs font-medium text-foreground-muted mb-1">
                Class (Optional)
              </label>
              <select
                id="editDocClass"
                disabled={isPending}
                value={selectedClassId}
                onChange={(e) => {
                  const val = e.target.value
                  setSelectedClassId(val)
                  setSelectedSubjectId('')
                  setSelectedChapterId('')
                  setValue('classId', val)
                  setValue('subjectId', '')
                  setValue('chapterId', '')
                  setValue('topicId', '')
                }}
                className="w-full h-9 rounded-lg border border-border bg-surface px-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:opacity-50"
              >
                <option value="">None</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="editDocSubject" className="block text-xs font-medium text-foreground-muted mb-1">
                Subject (Optional)
              </label>
              <select
                id="editDocSubject"
                disabled={isPending || !selectedClassId}
                value={selectedSubjectId}
                onChange={(e) => {
                  const val = e.target.value
                  setSelectedSubjectId(val)
                  setSelectedChapterId('')
                  setValue('subjectId', val)
                  setValue('chapterId', '')
                  setValue('topicId', '')
                }}
                className="w-full h-9 rounded-lg border border-border bg-surface px-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:opacity-50"
              >
                <option value="">None</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="editDocChapter" className="block text-xs font-medium text-foreground-muted mb-1">
                Chapter (Optional)
              </label>
              <select
                id="editDocChapter"
                disabled={isPending || !selectedSubjectId}
                value={selectedChapterId}
                onChange={(e) => {
                  const val = e.target.value
                  setSelectedChapterId(val)
                  setValue('chapterId', val)
                  setValue('topicId', '')
                }}
                className="w-full h-9 rounded-lg border border-border bg-surface px-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:opacity-50"
              >
                <option value="">None</option>
                {chapters.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="editDocTopic" className="block text-xs font-medium text-foreground-muted mb-1">
                Topic (Optional)
              </label>
              <select
                id="editDocTopic"
                disabled={isPending || !selectedChapterId}
                {...register('topicId')}
                className="w-full h-9 rounded-lg border border-border bg-surface px-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:opacity-50"
              >
                <option value="">None</option>
                {topics.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {serverError && (
            <div className="flex items-start gap-2 rounded-xl border border-error-200 bg-error-50 p-3 text-sm text-error-700">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-1.5" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
