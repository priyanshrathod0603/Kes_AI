'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { GraduationCap, Loader2, X, Check, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { useUpdateClass } from '@/hooks'
import type { SchoolClass } from '@/types'

const editClassFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Class name is required')
    .max(100, 'Class name must be at most 100 characters')
    .trim(),
})

type EditClassFormValues = z.infer<typeof editClassFormSchema>

interface EditClassDialogProps {
  open: boolean
  onClose: () => void
  schoolClass: SchoolClass | null
  onSuccess?: () => void
}

export function EditClassDialog({ open, onClose, schoolClass, onSuccess }: EditClassDialogProps) {
  const [serverError, setServerError] = useState<string | null>(null)
  const updateClassMutation = useUpdateClass()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EditClassFormValues>({
    resolver: zodResolver(editClassFormSchema),
    defaultValues: {
      name: schoolClass?.name ?? '',
    },
  })

  useEffect(() => {
    if (schoolClass) {
      reset({ name: schoolClass.name })
      setServerError(null)
    }
  }, [schoolClass, reset])

  const handleClose = () => {
    if (!updateClassMutation.isPending && !isSubmitting) {
      setServerError(null)
      onClose()
    }
  }

  const onSubmit = async (values: EditClassFormValues) => {
    if (!schoolClass) return
    setServerError(null)
    try {
      await updateClassMutation.mutateAsync({
        id: schoolClass.id,
        name: values.name,
      })
      onSuccess?.()
      onClose()
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: string }).message)
          : 'Failed to update class. Please try again.'
      setServerError(msg)
    }
  }

  const isPending = isSubmitting || updateClassMutation.isPending

  return (
    <Dialog open={open} onOpenChange={(isOpen) => (isOpen ? null : handleClose())}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
              <GraduationCap className="h-4 w-4" />
            </div>
            <DialogTitle>Edit Class</DialogTitle>
          </div>
          <DialogDescription>
            Update the class name. Changes apply across all associated subjects and materials.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <div>
            <label htmlFor="editClassName" className="block text-sm font-medium text-foreground mb-1">
              Class Name <span className="text-error-600">*</span>
            </label>
            <input
              id="editClassName"
              type="text"
              placeholder="e.g. Class 10"
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
