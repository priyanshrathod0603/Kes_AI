import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { quizApi } from '@/api'
import type { Quiz, QuizAttempt } from '@/types'

export function useQuizzes(params?: {
  subjectId?: string
  chapterId?: string
  topicId?: string
  page?: number
  limit?: number
}) {
  return useQuery({
    queryKey: ['quizzes', params],
    queryFn: () => quizApi.getQuizzes(params).then((res) => res.data!),
  })
}

export function useQuiz(id: string) {
  return useQuery({
    queryKey: ['quizzes', id],
    queryFn: () => quizApi.getQuiz(id).then((res) => res.data!),
    enabled: !!id,
  })
}

export function useStartQuiz() {
  return useMutation({
    mutationFn: (id: string) => quizApi.startQuiz(id),
  })
}

export function useSubmitAnswer() {
  return useMutation({
    mutationFn: ({ attemptId, questionId, answer }: { attemptId: string; questionId: string; answer: string | number }) =>
      quizApi.submitAnswer(attemptId, questionId, answer),
  })
}

export function useSubmitQuiz() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (attemptId: string) => quizApi.submitQuiz(attemptId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizzes'] })
      queryClient.invalidateQueries({ queryKey: ['progress'] })
    },
  })
}

export function useQuizAttempt(attemptId: string) {
  return useQuery({
    queryKey: ['quizzes', 'attempts', attemptId],
    queryFn: () => quizApi.getAttempt(attemptId).then((res) => res.data!),
    enabled: !!attemptId,
  })
}

export function useQuizAttempts(quizId: string) {
  return useQuery({
    queryKey: ['quizzes', quizId, 'attempts'],
    queryFn: () => quizApi.getAttempts(quizId).then((res) => res.data!),
    enabled: !!quizId,
  })
}

export function useQuestionExplanation(questionId: string) {
  return useQuery({
    queryKey: ['quizzes', 'questions', questionId, 'explanation'],
    queryFn: () => quizApi.getQuestionExplanation(questionId).then((res) => res.data!),
    enabled: !!questionId,
  })
}