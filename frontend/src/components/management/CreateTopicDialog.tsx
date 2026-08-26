'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FileText, Loader2, X, Plus, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { useCreateTopic, useChapters } from '@/hooks'

const createTopicFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Topic name is required')
    .max(100, 'Topic name must be at most 100 characters')
    .trim(),
  chapterId: z.string().min(1, 'Please select a chapter'),
})

type CreateTopicFormValues = z.infer<typeof createTopicFormSchema>

interface CreateTopicDialogProps {
  open: boolean
  onClose: () => void
  defaultChapterId?: string
  subjectId?: string
  onSuccess?: () => void
}

export function CreateTopicDialog({
  open,
  onClose,
  defaultChapterId,
  subjectId,
  onSuccess,
}: CreateTopicDialogProps) {
  const [serverError, setServerError] = useState<string | null>(null)
  const { data: chapters = [], isLoading: chaptersLoading } = useChapters(
    subjectId ? { subjectId } : undefined
  )
  const createTopicMutation = useCreateTopic()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateTopicFormValues>({
    resolver: zodResolver(createTopicFormSchema),
    defaultValues: {
      name: '',
      chapterId: defaultChapterId ?? '',
    },
  })

  useEffect(() => {
    if (defaultChapterId) {
      setValue('chapterId', defaultChapterId)
    }
  }, [defaultChapterId, setValue])

  const handleClose = () => {
    if (!createTopicMutation.isPending && !isSubmitting) {
      reset({ name: '', chapterId: defaultChapterId ?? '' })
      setServerError(null)
      onClose()
    }
  }

  const onSubmit = async (values: CreateTopicFormValues) => {
    setServerError(null)
    try {
      await createTopicMutation.mutateAsync({
        name: values.name,
        chapterId: values.chapterId,
      })
      reset({ name: '', chapterId: defaultChapterId ?? '' })
      onSuccess?.()
      onClose()
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: string }).message)
          : 'Failed to create topic. Please try again.'
      setServerError(msg)
    }
  }

  const isPending = isSubmitting || createTopicMutation.isPending

  return (
    <Dialog open={open} onOpenChange={(isOpen) => (isOpen ? null : handleClose())}>
      <DialogContent className="sm:max-w-md">
        <button
          type="button"
          aria-label="Close"
          onClick={handleClose}
          disabled={isPending}
          className="absolute right-4 top-4 rounded-md p-1 text-foreground-muted hover:text-foreground disabled:opacity-50 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
              <FileText className="h-4 w-4" />
            </div>
            <DialogTitle>Add New Topic</DialogTitle>
          </div>
          <DialogDescription>
            Add a specific topic under a chapter to organize study materials and questions.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <div>
            <label htmlFor="topicChapter" className="block text-sm font-medium text-foreground mb-1">
              Chapter <span className="text-error-600">*</span>
            </label>
            <select
              id="topicChapter"
              disabled={isPending || chaptersLoading || !!defaultChapterId}
              {...register('chapterId')}
              className="w-full h-10 rounded-xl border border-border bg-surface px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors disabled:opacity-50"
            >
              <option value="">{chaptersLoading ? 'Loading chapters…' : 'Select a chapter'}</option>
              {chapters.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {errors.chapterId && (
              <p className="mt-1 text-xs text-error-600 font-medium">{errors.chapterId.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="topicName" className="block text-sm font-medium text-foreground mb-1">
              Topic Name <span className="text-error-600">*</span>
            </label>
            <input
              id="topicName"
              type="text"
              placeholder="e.g. Conductors vs Insulators, Ohm's Law"
              disabled={isPending}
              {...register('name')}
              className="w-full h-10 rounded-xl border border-border bg-surface px-3 text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors disabled:opacity-50"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-error-600 font-medium">{errors.name.message}</p>
            )}
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
            <Button type="submit" disabled={isPending || chapters.length === 0}>
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                  Creating…
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-1.5" />
                  Create Topic
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
