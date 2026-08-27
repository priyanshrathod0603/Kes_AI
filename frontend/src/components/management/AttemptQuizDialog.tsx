'use client'

import { useState } from 'react'
import { HelpCircle, CheckCircle2, XCircle, RotateCcw, Award } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import type { Quiz, QuizQuestion } from '@/types'

interface AttemptQuizDialogProps {
  open: boolean
  onClose: () => void
  quiz: Quiz | null
}

export function AttemptQuizDialog({ open, onClose, quiz }: AttemptQuizDialogProps) {
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({})
  const [submitted, setSubmitted] = useState(false)

  const questions = quiz?.questions ?? []

  const handleClose = () => {
    setUserAnswers({})
    setSubmitted(false)
    onClose()
  }

  const handleSelectOption = (qIdx: number, option: string) => {
    if (submitted) return
    setUserAnswers((prev) => ({
      ...prev,
      [qIdx]: option,
    }))
  }

  const handleSubmit = () => {
    setSubmitted(true)
  }

  const handleReset = () => {
    setUserAnswers({})
    setSubmitted(false)
  }

  // Calculate score
  const score = questions.reduce((acc: number, q: QuizQuestion, idx: number) => {
    return acc + (userAnswers[idx] === q.correctOption ? 1 : 0)
  }, 0)

  if (!quiz) return null

  return (
    <Dialog open={open} onOpenChange={(isOpen) => (isOpen ? null : handleClose())}>
      <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
              <HelpCircle className="h-4 w-4" />
            </div>
            <DialogTitle>{quiz.title}</DialogTitle>
          </div>
          {quiz.description && (
            <DialogDescription>{quiz.description}</DialogDescription>
          )}
        </DialogHeader>

        {questions.length === 0 ? (
          <div className="py-6 text-center text-sm text-foreground-muted">
            This quiz has no questions yet.
          </div>
        ) : (
          <div className="space-y-6 pt-2">
            {submitted && (
              <div className="p-4 rounded-xl border border-primary-200 bg-primary-50 text-primary-900 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Award className="h-6 w-6 text-primary-600" />
                  <div>
                    <h4 className="font-bold text-base">Quiz Completed!</h4>
                    <p className="text-xs text-primary-700">
                      You scored {score} out of {questions.length} (
                      {Math.round((score / questions.length) * 100)}%)
                    </p>
                  </div>
                </div>
                <Button size="sm" variant="outline" onClick={handleReset}>
                  <RotateCcw className="h-3.5 w-3.5 mr-1" /> Retake
                </Button>
              </div>
            )}

            <div className="space-y-6">
              {questions.map((q, qIdx) => {
                const selected = userAnswers[qIdx]
                const isCorrect = selected === q.correctOption

                return (
                  <div
                    key={q.id || qIdx}
                    className="p-4 rounded-xl border border-border bg-surface space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-semibold text-sm text-foreground">
                        {qIdx + 1}. {q.questionText}
                      </span>
                      {submitted && (
                        <span>
                          {isCorrect ? (
                            <Badge variant="success" className="text-xs gap-1">
                              <CheckCircle2 className="h-3 w-3" /> Correct
                            </Badge>
                          ) : (
                            <Badge variant="destructive" className="text-xs gap-1">
                              <XCircle className="h-3 w-3" /> Incorrect
                            </Badge>
                          )}
                        </span>
                      )}
                    </div>

                    <div className="space-y-2">
                      {(['A', 'B', 'C', 'D'] as const).map((opt) => {
                        const optKey = `option${opt}` as keyof typeof q
                        const text = String(q[optKey] ?? '')
                        const isChosen = selected === opt
                        const isActualCorrect = q.correctOption === opt

                        let style =
                          'border-border hover:bg-muted/50 text-foreground'
                        if (isChosen && !submitted) {
                          style =
                            'border-primary-500 bg-primary-50 text-primary-700 font-medium'
                        } else if (submitted) {
                          if (isActualCorrect) {
                            style =
                              'border-success-500 bg-success-50 text-success-800 font-medium'
                          } else if (isChosen && !isActualCorrect) {
                            style =
                              'border-error-500 bg-error-50 text-error-800 font-medium'
                          }
                        }

                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => handleSelectOption(qIdx, opt)}
                            disabled={submitted}
                            className={`w-full text-left p-3 rounded-xl border text-xs transition-colors flex items-center justify-between ${style}`}
                          >
                            <span>
                              <strong className="mr-2">{opt}.</strong> {text}
                            </span>
                            {submitted && isActualCorrect && (
                              <CheckCircle2 className="h-4 w-4 text-success-600 shrink-0" />
                            )}
                            {submitted && isChosen && !isActualCorrect && (
                              <XCircle className="h-4 w-4 text-error-600 shrink-0" />
                            )}
                          </button>
                        )
                      })}
                    </div>

                    {submitted && q.explanation && (
                      <div className="p-2.5 rounded-lg bg-muted/40 text-xs text-foreground-muted">
                        <strong className="text-foreground">Explanation:</strong> {q.explanation}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button type="button" variant="ghost" onClick={handleClose}>
                Close
              </Button>
              {!submitted && (
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={Object.keys(userAnswers).length === 0}
                >
                  Submit Answers
                </Button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
