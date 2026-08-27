import { api, unwrap } from './client'
import type { ApiResponse } from '@/types'

export interface SchoolClass {
  id: string
  name: string
  createdAt: string
  updatedAt: string
}

export interface Subject {
  id: string
  name: string
  classId: string
  createdAt: string
  updatedAt: string
}

export interface Chapter {
  id: string
  name: string
  description: string | null
  subjectId: string
  createdAt: string
  updatedAt: string
}

export interface Topic {
  id: string
  name: string
  chapterId: string
  createdAt: string
  updatedAt: string
}

export const academicApi = {
  /** GET /api/academic → { success, data: { data: SchoolClass[] } } */
  getClasses: async (): Promise<ApiResponse<{ data: SchoolClass[] }>> => {
    const response = await api.get('/academic')
    return unwrap<{ data: SchoolClass[] }>(response.data)
  },

  createClass: async (name: string): Promise<ApiResponse<{ data: SchoolClass }>> => {
    const response = await api.post('/academic', { name })
    return unwrap<{ data: SchoolClass }>(response.data)
  },

  updateClass: async (id: string, name: string): Promise<ApiResponse<{ data: SchoolClass }>> => {
    const response = await api.put(`/academic/${id}`, { name })
    return unwrap<{ data: SchoolClass }>(response.data)
  },

  deleteClass: async (id: string): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/academic/${id}`)
    return unwrap<void>(response.data)
  },

  /** GET /api/academic/subjects?classId=... → { success, data: { data: Subject[] } } */
  getSubjects: async (params?: { classId?: string }): Promise<ApiResponse<{ data: Subject[] }>> => {
    const response = await api.get('/academic/subjects', { params })
    return unwrap<{ data: Subject[] }>(response.data)
  },

  createSubject: async (name: string, classId: string): Promise<ApiResponse<{ data: Subject }>> => {
    const response = await api.post('/academic/subjects', { name, classId })
    return unwrap<{ data: Subject }>(response.data)
  },

  updateSubject: async (
    id: string,
    name: string,
    classId?: string
  ): Promise<ApiResponse<{ data: Subject }>> => {
    const response = await api.put(`/academic/subjects/${id}`, { name, classId })
    return unwrap<{ data: Subject }>(response.data)
  },

  deleteSubject: async (id: string): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/academic/subjects/${id}`)
    return unwrap<void>(response.data)
  },

  getChapters: async (params?: { subjectId?: string }): Promise<ApiResponse<{ data: Chapter[] }>> => {
    const response = await api.get('/academic/chapters', { params })
    return unwrap<{ data: Chapter[] }>(response.data)
  },

  createChapter: async (
    name: string,
    description: string | undefined,
    subjectId: string
  ): Promise<ApiResponse<{ data: Chapter }>> => {
    const response = await api.post('/academic/chapters', { name, description, subjectId })
    return unwrap<{ data: Chapter }>(response.data)
  },

  updateChapter: async (
    id: string,
    name: string,
    description?: string,
    subjectId?: string
  ): Promise<ApiResponse<{ data: Chapter }>> => {
    const response = await api.put(`/academic/chapters/${id}`, { name, description, subjectId })
    return unwrap<{ data: Chapter }>(response.data)
  },

  deleteChapter: async (id: string): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/academic/chapters/${id}`)
    return unwrap<void>(response.data)
  },

  getTopics: async (params?: { chapterId?: string }): Promise<ApiResponse<{ data: Topic[] }>> => {
    const response = await api.get('/academic/topics', { params })
    return unwrap<{ data: Topic[] }>(response.data)
  },

  createTopic: async (name: string, chapterId: string): Promise<ApiResponse<{ data: Topic }>> => {
    const response = await api.post('/academic/topics', { name, chapterId })
    return unwrap<{ data: Topic }>(response.data)
  },

  updateTopic: async (
    id: string,
    name: string,
    chapterId?: string
  ): Promise<ApiResponse<{ data: Topic }>> => {
    const response = await api.put(`/academic/topics/${id}`, { name, chapterId })
    return unwrap<{ data: Topic }>(response.data)
  },

  deleteTopic: async (id: string): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/academic/topics/${id}`)
    return unwrap<void>(response.data)
  },
}
