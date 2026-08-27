'use client'

import { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { HelpCircle, Loader2, Plus, Trash2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { useCreateQuiz, useSubjects, useChapters } from '@/hooks'

const quizQuestionSchema = z.object({
  questionText: z.string().min(1, 'Question text is required'),
  optionA: z.string().min(1, 'Option A is required'),
  optionB: z.string().min(1, 'Option B is required'),
  optionC: z.string().min(1, 'Option C is required'),
  optionD: z.string().min(1, 'Option D is required'),
  correctOption: z.enum(['A', 'B', 'C', 'D']),
  explanation: z.string().optional(),
})

const createQuizFormSchema = z.object({
  title: z.string().min(1, 'Quiz title is required').max(200, 'Title too long'),
  description: z.string().max(1000).optional(),
  subjectId: z.string().optional(),
  chapterId: z.string().optional(),
  questions: z.array(quizQuestionSchema).min(1, 'Add at least one question'),
})

type CreateQuizFormValues = z.infer<typeof createQuizFormSchema>

interface CreateQuizDialogProps {
  open: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function CreateQuizDialog({ open, onClose, onSuccess }: CreateQuizDialogProps) {
  const [serverError, setServerError] = useState<string | null>(null)
  const [selectedSubjectId, setSelectedSubjectId] = useState('')

  const { data: subjects = [] } = useSubjects()
  const { data: chapters = [] } = useChapters(
    selectedSubjectId ? { subjectId: selectedSubjectId } : undefined,
    { enabled: !!selectedSubjectId }
  )

  const createQuizMutation = useCreateQuiz()

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateQuizFormValues>({
    resolver: zodResolver(createQuizFormSchema),
    defaultValues: {
      title: '',
      description: '',
      subjectId: '',
      chapterId: '',
      questions: [
        {
          questionText: '',
          optionA: '',
          optionB: '',
          optionC: '',
          optionD: '',
          correctOption: 'A',
          explanation: '',
        },
      ],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'questions',
  })

  const handleClose = () => {
    if (!createQuizMutation.isPending && !isSubmitting) {
      reset()
      setSelectedSubjectId('')
      setServerError(null)
      onClose()
    }
  }

  const onSubmit = async (values: CreateQuizFormValues) => {
    setServerError(null)
    try {
      await createQuizMutation.mutateAsync({
        title: values.title,
        description: values.description?.trim() || null,
        subjectId: values.subjectId || null,
        chapterId: values.chapterId || null,
        questions: values.questions,
      })
      reset()
      onSuccess?.()
      onClose()
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: string }).message)
          : 'Failed to create quiz. Please try again.'
      setServerError(msg)
    }
  }

  const isPending = isSubmitting || createQuizMutation.isPending

  return (
    <Dialog open={open} onOpenChange={(isOpen) => (isOpen ? null : handleClose())}>
      <DialogContent className="sm:max-w-xl max-h-[85vh]">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
              <HelpCircle className="h-4 w-4" />
            </div>
            <DialogTitle>Create New Quiz</DialogTitle>
          </div>
          <DialogDescription>
            Add a practice quiz with questions, options, and explanations.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <div>
            <label htmlFor="quizTitle" className="block text-sm font-medium text-foreground mb-1">
              Quiz Title <span className="text-error-600">*</span>
            </label>
            <input
              id="quizTitle"
              type="text"
              placeholder="e.g. Electric Current & Circuits Quiz"
              disabled={isPending}
              {...register('title')}
              className="w-full h-10 rounded-xl border border-border bg-surface px-3 text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors disabled:opacity-50"
            />
            {errors.title && (
              <p className="mt-1 text-xs text-error-600 font-medium">{errors.title.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="quizSubject" className="block text-xs font-medium text-foreground-muted mb-1">
                Subject (Optional)
              </label>
              <select
                id="quizSubject"
                disabled={isPending}
                value={selectedSubjectId}
                onChange={(e) => {
                  const val = e.target.value
                  setSelectedSubjectId(val)
                  setValue('subjectId', val)
                  setValue('chapterId', '')
                }}
                className="w-full h-9 rounded-lg border border-border bg-surface px-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:opacity-50"
              >
                <option value="">Select subject</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="quizChapter" className="block text-xs font-medium text-foreground-muted mb-1">
                Chapter (Optional)
              </label>
              <select
                id="quizChapter"
                disabled={isPending || !selectedSubjectId}
                {...register('chapterId')}
                className="w-full h-9 rounded-lg border border-border bg-surface px-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:opacity-50"
              >
                <option value="">Select chapter</option>
                {chapters.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="quizDesc" className="block text-xs font-medium text-foreground-muted mb-1">
              Description (Optional)
            </label>
            <textarea
              id="quizDesc"
              rows={2}
              placeholder="Short description of what this quiz covers"
              disabled={isPending}
              {...register('description')}
              className="w-full rounded-xl border border-border bg-surface p-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary-500/20 resize-none disabled:opacity-50"
            />
          </div>

          {/* Questions Section */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-foreground">
                Questions ({fields.length})
              </h4>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  append({
                    questionText: '',
                    optionA: '',
                    optionB: '',
                    optionC: '',
                    optionD: '',
                    correctOption: 'A',
                    explanation: '',
                  })
                }
                disabled={isPending}
              >
                <Plus className="h-3.5 w-3.5 mr-1" /> Add Question
              </Button>
            </div>

            {errors.questions?.message && (
              <p className="text-xs text-error-600 font-medium">{errors.questions.message}</p>
            )}

            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
              {fields.map((field, idx) => (
                <div key={field.id} className="p-4 rounded-xl border border-border bg-surface space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-primary-600 uppercase tracking-wider">
                      Question {idx + 1}
                    </span>
                    {fields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => remove(idx)}
                        disabled={isPending}
                        className="text-error-600 hover:text-error-700 p-1 text-xs inline-flex items-center gap-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Remove
                      </button>
                    )}
                  </div>

                  <input
                    type="text"
                    placeholder="Enter question text"
                    disabled={isPending}
                    {...register(`questions.${idx}.questionText`)}
                    className="w-full h-9 rounded-lg border border-border bg-surface px-3 text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Option A"
                      disabled={isPending}
                      {...register(`questions.${idx}.optionA`)}
                      className="h-8 rounded-lg border border-border bg-surface px-2.5 text-xs text-foreground placeholder:text-foreground-muted"
                    />
                    <input
                      type="text"
                      placeholder="Option B"
                      disabled={isPending}
                      {...register(`questions.${idx}.optionB`)}
                      className="h-8 rounded-lg border border-border bg-surface px-2.5 text-xs text-foreground placeholder:text-foreground-muted"
                    />
                    <input
                      type="text"
                      placeholder="Option C"
                      disabled={isPending}
                      {...register(`questions.${idx}.optionC`)}
                      className="h-8 rounded-lg border border-border bg-surface px-2.5 text-xs text-foreground placeholder:text-foreground-muted"
                    />
                    <input
                      type="text"
                      placeholder="Option D"
                      disabled={isPending}
                      {...register(`questions.${idx}.optionD`)}
                      className="h-8 rounded-lg border border-border bg-surface px-2.5 text-xs text-foreground placeholder:text-foreground-muted"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="text-xs font-medium text-foreground-muted">Correct Option:</label>
                    <select
                      {...register(`questions.${idx}.correctOption`)}
                      disabled={isPending}
                      className="h-8 rounded-lg border border-border bg-surface px-2 text-xs font-semibold text-primary-600 focus:outline-none"
                    >
                      <option value="A">Option A</option>
                      <option value="B">Option B</option>
                      <option value="C">Option C</option>
                      <option value="D">Option D</option>
                    </select>
                  </div>
                </div>
              ))}
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
                  Creating…
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-1.5" />
                  Create Quiz
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
