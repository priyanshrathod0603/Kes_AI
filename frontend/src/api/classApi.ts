import { api } from './client'
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
  getClasses: async (): Promise<ApiResponse<{ data: SchoolClass[] }>> => {
    const response = await api.get('/academic')
    return response.data
  },

  createClass: async (name: string): Promise<ApiResponse<{ data: SchoolClass }>> => {
    const response = await api.post('/academic', { name })
    return response.data
  },

  getSubjects: async (params?: { classId?: string }): Promise<ApiResponse<{ data: Subject[] }>> => {
    const response = await api.get('/academic/subjects', { params })
    return response.data
  },

  createSubject: async (name: string, classId: string): Promise<ApiResponse<{ data: Subject }>> => {
    const response = await api.post('/academic/subjects', { name, classId })
    return response.data
  },

  getChapters: async (params?: { subjectId?: string }): Promise<ApiResponse<{ data: Chapter[] }>> => {
    const response = await api.get('/academic/chapters', { params })
    return response.data
  },

  createChapter: async (name: string, description: string | undefined, subjectId: string): Promise<ApiResponse<{ data: Chapter }>> => {
    const response = await api.post('/academic/chapters', { name, description, subjectId })
    return response.data
  },

  getTopics: async (params?: { chapterId?: string }): Promise<ApiResponse<{ data: Topic[] }>> => {
    const response = await api.get('/academic/topics', { params })
    return response.data
  },

  createTopic: async (name: string, chapterId: string): Promise<ApiResponse<{ data: Topic }>> => {
    const response = await api.post('/academic/topics', { name, chapterId })
    return response.data
  },
}