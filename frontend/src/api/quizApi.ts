import { api, unwrap } from './client'
import type { ApiResponse } from '@/types'

/**
 * Quiz endpoints are not implemented in the backend yet (the route is a
 * placeholder). We keep the surface so the UI can render an honest empty
 * state, but the data is never fake — it only comes back if the backend
 * actually returns it.
 */
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
    return unwrap<{ data: Quiz[] }>(response.data)
  },
}
