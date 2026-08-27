import { api, unwrap } from './client'
import type { ApiResponse } from '@/types'

export interface QuizQuestion {
  id?: string
  questionText: string
  optionA: string
  optionB: string
  optionC: string
  optionD: string
  correctOption: 'A' | 'B' | 'C' | 'D'
  explanation?: string | null
}

export interface Quiz {
  id: string
  title: string
  description: string | null
  subjectId: string | null
  chapterId: string | null
  createdAt: string
  updatedAt: string
  questions?: QuizQuestion[]
}

export interface CreateQuizInput {
  title: string
  description?: string | null
  subjectId?: string | null
  chapterId?: string | null
  questions?: QuizQuestion[]
}

export interface UpdateQuizInput {
  title?: string
  description?: string | null
  subjectId?: string | null
  chapterId?: string | null
  questions?: QuizQuestion[]
}

export const quizApi = {
  getQuizzes: async (params?: { subjectId?: string; chapterId?: string }): Promise<Quiz[]> => {
    try {
      const response = await api.get('/quizzes', { params })
      const raw = response.data
      const payload = raw?.data?.data ?? raw?.data ?? raw
      if (Array.isArray(payload)) {
        return payload as Quiz[]
      }
      return []
    } catch {
      return []
    }
  },

  getQuizById: async (id: string): Promise<Quiz | null> => {
    try {
      const response = await api.get(`/quizzes/${id}`)
      const raw = response.data
      return (raw?.data?.data ?? raw?.data ?? raw) as Quiz
    } catch {
      return null
    }
  },

  createQuiz: async (data: CreateQuizInput): Promise<ApiResponse<{ data: Quiz }>> => {
    const response = await api.post('/quizzes', data)
    return unwrap<{ data: Quiz }>(response.data)
  },

  updateQuiz: async (id: string, data: UpdateQuizInput): Promise<ApiResponse<{ data: Quiz }>> => {
    const response = await api.put(`/quizzes/${id}`, data)
    return unwrap<{ data: Quiz }>(response.data)
  },

  deleteQuiz: async (id: string): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/quizzes/${id}`)
    return unwrap<void>(response.data)
  },
}
