import { useQuery } from '@tanstack/react-query'
import { quizApi } from '@/api'
import type { Quiz } from '@/types'

export function useQuizzes(params?: { subjectId?: string }) {
  return useQuery<Quiz[]>({
    queryKey: ['quizzes', params],
    queryFn: () => quizApi.getQuizzes(params),
  })
}
