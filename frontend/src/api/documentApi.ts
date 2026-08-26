import { api } from './client'
import type { ApiResponse, StudyMaterial } from '@/types'

export const documentApi = {
  getMaterials: async (params?: {
    subjectId?: string
    chapterId?: string
    topicId?: string
    type?: string
    search?: string
    page?: number
    limit?: number
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
    favoritesOnly?: boolean
  }): Promise<ApiResponse<StudyMaterial[]>> => {
    const response = await api.get('/documents', { params })
    return response.data
  },

  getMaterial: async (id: string): Promise<ApiResponse<StudyMaterial>> => {
    const response = await api.get(`/documents/${id}`)
    return response.data
  },

  getDownloadUrl: async (id: string): Promise<ApiResponse<{ url: string }>> => {
    const response = await api.get(`/documents/${id}/download`)
    return response.data
  },

  toggleFavorite: async (id: string): Promise<ApiResponse<StudyMaterial>> => {
    const response = await api.post(`/documents/${id}/favorite`)
    return response.data
  },

  getFavorites: async (): Promise<ApiResponse<StudyMaterial[]>> => {
    const response = await api.get('/documents/favorites')
    return response.data
  },

  getRecent: async (limit = 10): Promise<ApiResponse<StudyMaterial[]>> => {
    const response = await api.get('/documents/recent', { params: { limit } })
    return response.data
  },
}