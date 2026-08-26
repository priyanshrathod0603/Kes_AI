import { api } from './client'
import type { ApiResponse } from '@/types'

export interface Quiz {
  id: string
  title: string
  description: string | null
  subjectId: string
  createdAt: string
  updatedAt: string
}

export const quizApi = {
  getQuizzes: async (params?: { subjectId?: string }): Promise<ApiResponse<{ data: Quiz[] }>> => {
    const response = await api.get('/quizzes', { params })
    return response.data
  },
}