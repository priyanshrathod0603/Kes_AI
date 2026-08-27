'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { BookOpen, Loader2, Check, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { useUpdateSubject, useClasses } from '@/hooks'
import type { Subject } from '@/types'

const editSubjectFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Subject name is required')
    .max(100, 'Subject name must be at most 100 characters')
    .trim(),
  classId: z.string().min(1, 'Please select a class'),
})

type EditSubjectFormValues = z.infer<typeof editSubjectFormSchema>

interface EditSubjectDialogProps {
  open: boolean
  onClose: () => void
  subject: Subject | null
  onSuccess?: () => void
}

export function EditSubjectDialog({ open, onClose, subject, onSuccess }: EditSubjectDialogProps) {
  const [serverError, setServerError] = useState<string | null>(null)
  const { data: classes = [], isLoading: classesLoading } = useClasses()
  const updateSubjectMutation = useUpdateSubject()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EditSubjectFormValues>({
    resolver: zodResolver(editSubjectFormSchema),
    defaultValues: {
      name: subject?.name ?? '',
      classId: subject?.classId ?? '',
    },
  })

  useEffect(() => {
    if (subject) {
      reset({
        name: subject.name,
        classId: subject.classId,
      })
      setServerError(null)
    }
  }, [subject, reset])

  const handleClose = () => {
    if (!updateSubjectMutation.isPending && !isSubmitting) {
      setServerError(null)
      onClose()
    }
  }

  const onSubmit = async (values: EditSubjectFormValues) => {
    if (!subject) return
    setServerError(null)
    try {
      await updateSubjectMutation.mutateAsync({
        id: subject.id,
        name: values.name,
        classId: values.classId,
      })
      onSuccess?.()
      onClose()
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: string }).message)
          : 'Failed to update subject. Please try again.'
      setServerError(msg)
    }
  }

  const isPending = isSubmitting || updateSubjectMutation.isPending

  return (
    <Dialog open={open} onOpenChange={(isOpen) => (isOpen ? null : handleClose())}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
              <BookOpen className="h-4 w-4" />
            </div>
            <DialogTitle>Edit Subject</DialogTitle>
          </div>
          <DialogDescription>
            Update the subject details or reassign it to another class.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <div>
            <label htmlFor="editSubjectClass" className="block text-sm font-medium text-foreground mb-1">
              Class <span className="text-error-600">*</span>
            </label>
            <select
              id="editSubjectClass"
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
            <label htmlFor="editSubjectName" className="block text-sm font-medium text-foreground mb-1">
              Subject Name <span className="text-error-600">*</span>
            </label>
            <input
              id="editSubjectName"
              type="text"
              placeholder="e.g. Mathematics"
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
