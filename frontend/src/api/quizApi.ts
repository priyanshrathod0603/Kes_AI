import { api } from './client'

export interface Quiz {
  id: string
  title: string
  description: string | null
  subjectId: string
  createdAt: string
  updatedAt: string
}

export const quizApi = {
  getQuizzes: async (params?: { subjectId?: string }): Promise<Quiz[]> => {
    try {
      const response = await api.get('/quizzes', { params })
      const raw = response.data
      const payload = raw?.data?.data ?? raw?.data ?? raw
      if (Array.isArray(payload)) {
        return payload as Quiz[]
      }
      return []
    } catch {
      // Backend does not currently expose quiz data - return safe empty array
      return []
    }
  },
}
