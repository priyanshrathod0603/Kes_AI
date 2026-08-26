'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { BookOpen, Loader2, X, Plus, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { useCreateChapter, useSubjects } from '@/hooks'

const createChapterFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Chapter name is required')
    .max(100, 'Chapter name must be at most 100 characters')
    .trim(),
  description: z
    .string()
    .max(500, 'Description must be at most 500 characters')
    .optional(),
  subjectId: z.string().min(1, 'Please select a subject'),
})

type CreateChapterFormValues = z.infer<typeof createChapterFormSchema>

interface CreateChapterDialogProps {
  open: boolean
  onClose: () => void
  defaultSubjectId?: string
  onSuccess?: () => void
}

export function CreateChapterDialog({
  open,
  onClose,
  defaultSubjectId,
  onSuccess,
}: CreateChapterDialogProps) {
  const [serverError, setServerError] = useState<string | null>(null)
  const { data: subjects = [], isLoading: subjectsLoading } = useSubjects()
  const createChapterMutation = useCreateChapter()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateChapterFormValues>({
    resolver: zodResolver(createChapterFormSchema),
    defaultValues: {
      name: '',
      description: '',
      subjectId: defaultSubjectId ?? '',
    },
  })

  useEffect(() => {
    if (defaultSubjectId) {
      setValue('subjectId', defaultSubjectId)
    }
  }, [defaultSubjectId, setValue])

  const handleClose = () => {
    if (!createChapterMutation.isPending && !isSubmitting) {
      reset({ name: '', description: '', subjectId: defaultSubjectId ?? '' })
      setServerError(null)
      onClose()
    }
  }

  const onSubmit = async (values: CreateChapterFormValues) => {
    setServerError(null)
    try {
      await createChapterMutation.mutateAsync({
        name: values.name,
        description: values.description?.trim() || undefined,
        subjectId: values.subjectId,
      })
      reset({ name: '', description: '', subjectId: defaultSubjectId ?? '' })
      onSuccess?.()
      onClose()
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: string }).message)
          : 'Failed to create chapter. Please try again.'
      setServerError(msg)
    }
  }

  const isPending = isSubmitting || createChapterMutation.isPending

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
              <BookOpen className="h-4 w-4" />
            </div>
            <DialogTitle>Add New Chapter</DialogTitle>
          </div>
          <DialogDescription>
            Create a chapter under a subject to organize syllabus topics and resources.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <div>
            <label htmlFor="chapterSubject" className="block text-sm font-medium text-foreground mb-1">
              Subject <span className="text-error-600">*</span>
            </label>
            <select
              id="chapterSubject"
              disabled={isPending || subjectsLoading || !!defaultSubjectId}
              {...register('subjectId')}
              className="w-full h-10 rounded-xl border border-border bg-surface px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors disabled:opacity-50"
            >
              <option value="">{subjectsLoading ? 'Loading subjects…' : 'Select a subject'}</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            {errors.subjectId && (
              <p className="mt-1 text-xs text-error-600 font-medium">{errors.subjectId.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="chapterName" className="block text-sm font-medium text-foreground mb-1">
              Chapter Name <span className="text-error-600">*</span>
            </label>
            <input
              id="chapterName"
              type="text"
              placeholder="e.g. Electric Current and Its Effects, Light Reflection"
              disabled={isPending}
              {...register('name')}
              className="w-full h-10 rounded-xl border border-border bg-surface px-3 text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors disabled:opacity-50"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-error-600 font-medium">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="chapterDescription" className="block text-sm font-medium text-foreground mb-1">
              Description <span className="text-xs text-foreground-muted font-normal">(Optional)</span>
            </label>
            <textarea
              id="chapterDescription"
              rows={2}
              placeholder="Brief overview of what this chapter covers"
              disabled={isPending}
              {...register('description')}
              className="w-full rounded-xl border border-border bg-surface p-3 text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors disabled:opacity-50 resize-none"
            />
            {errors.description && (
              <p className="mt-1 text-xs text-error-600 font-medium">{errors.description.message}</p>
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
            <Button type="submit" disabled={isPending || subjects.length === 0}>
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                  Creating…
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-1.5" />
                  Create Chapter
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
