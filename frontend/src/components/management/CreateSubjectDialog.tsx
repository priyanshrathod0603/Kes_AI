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
import { useCreateSubject, useClasses } from '@/hooks'

const createSubjectFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Subject name is required')
    .max(100, 'Subject name must be at most 100 characters')
    .trim(),
  classId: z.string().min(1, 'Please select a class'),
})

type CreateSubjectFormValues = z.infer<typeof createSubjectFormSchema>

interface CreateSubjectDialogProps {
  open: boolean
  onClose: () => void
  defaultClassId?: string
  onSuccess?: () => void
}

export function CreateSubjectDialog({
  open,
  onClose,
  defaultClassId,
  onSuccess,
}: CreateSubjectDialogProps) {
  const [serverError, setServerError] = useState<string | null>(null)
  const { data: classes = [], isLoading: classesLoading } = useClasses()
  const createSubjectMutation = useCreateSubject()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateSubjectFormValues>({
    resolver: zodResolver(createSubjectFormSchema),
    defaultValues: {
      name: '',
      classId: defaultClassId ?? '',
    },
  })

  useEffect(() => {
    if (defaultClassId) {
      setValue('classId', defaultClassId)
    }
  }, [defaultClassId, setValue])

  const handleClose = () => {
    if (!createSubjectMutation.isPending && !isSubmitting) {
      reset({ name: '', classId: defaultClassId ?? '' })
      setServerError(null)
      onClose()
    }
  }

  const onSubmit = async (values: CreateSubjectFormValues) => {
    setServerError(null)
    try {
      await createSubjectMutation.mutateAsync({
        name: values.name,
        classId: values.classId,
      })
      reset({ name: '', classId: defaultClassId ?? '' })
      onSuccess?.()
      onClose()
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: string }).message)
          : 'Failed to create subject. Please try again.'
      setServerError(msg)
    }
  }

  const isPending = isSubmitting || createSubjectMutation.isPending

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
            <DialogTitle>Add New Subject</DialogTitle>
          </div>
          <DialogDescription>
            Add a subject under a specific class to organize chapters and learning materials.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <div>
            <label htmlFor="subjectClass" className="block text-sm font-medium text-foreground mb-1">
              Class <span className="text-error-600">*</span>
            </label>
            <select
              id="subjectClass"
              disabled={isPending || classesLoading}
              {...register('classId')}
              className="w-full h-10 rounded-xl border border-border bg-surface px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors disabled:opacity-50"
            >
              <option value="">{classesLoading ? 'Loading classes…' : 'Select a class'}</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {errors.classId && (
              <p className="mt-1 text-xs text-error-600 font-medium">{errors.classId.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="subjectName" className="block text-sm font-medium text-foreground mb-1">
              Subject Name <span className="text-error-600">*</span>
            </label>
            <input
              id="subjectName"
              type="text"
              placeholder="e.g. Mathematics, Physics, English Literature"
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
            <Button type="submit" disabled={isPending || classes.length === 0}>
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                  Creating…
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-1.5" />
                  Create Subject
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
