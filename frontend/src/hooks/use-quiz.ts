import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { quizApi, type Quiz, type CreateQuizInput, type UpdateQuizInput } from '@/api'

export function useQuizzes(params?: { subjectId?: string; chapterId?: string }) {
  return useQuery<Quiz[]>({
    queryKey: ['quizzes', params],
    queryFn: () => quizApi.getQuizzes(params),
  })
}

export function useQuiz(id: string | undefined) {
  return useQuery<Quiz | null>({
    queryKey: ['quizzes', id],
    queryFn: () => (id ? quizApi.getQuizById(id) : null),
    enabled: !!id,
  })
}

export function useCreateQuiz() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateQuizInput) => quizApi.createQuiz(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['quizzes'] })
    },
  })
}

export function useUpdateQuiz() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & UpdateQuizInput) => quizApi.updateQuiz(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['quizzes'] })
    },
  })
}

export function useDeleteQuiz() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => quizApi.deleteQuiz(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['quizzes'] })
    },
  })
}
