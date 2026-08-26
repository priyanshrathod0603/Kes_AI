import { useQuery } from '@tanstack/react-query'
import { quizApi } from '@/api'
import type { Quiz } from '@/types'

export function useQuizzes(params?: { subjectId?: string }) {
  return useQuery({
    queryKey: ['quizzes', params],
    queryFn: () => quizApi.getQuizzes(params).then((res) => res.data?.data || []),
  })
}