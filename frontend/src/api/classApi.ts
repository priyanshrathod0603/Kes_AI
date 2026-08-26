import { api } from './client'
import type { ApiResponse, Class, Subject, Chapter, Topic } from '@/types'

export const classApi = {
  getClasses: async (): Promise<ApiResponse<Class[]>> => {
    const response = await api.get('/classes')
    return response.data
  },

  getClass: async (id: string): Promise<ApiResponse<Class>> => {
    const response = await api.get(`/classes/${id}`)
    return response.data
  },

  getSubjects: async (classId: string): Promise<ApiResponse<Subject[]>> => {
    const response = await api.get(`/classes/${classId}/subjects`)
    return response.data
  },

  getSubject: async (classId: string, subjectId: string): Promise<ApiResponse<Subject>> => {
    const response = await api.get(`/classes/${classId}/subjects/${subjectId}`)
    return response.data
  },

  getChapters: async (classId: string, subjectId: string): Promise<ApiResponse<Chapter[]>> => {
    const response = await api.get(`/classes/${classId}/subjects/${subjectId}/chapters`)
    return response.data
  },

  getChapter: async (classId: string, subjectId: string, chapterId: string): Promise<ApiResponse<Chapter>> => {
    const response = await api.get(`/classes/${classId}/subjects/${subjectId}/chapters/${chapterId}`)
    return response.data
  },

  getTopics: async (classId: string, subjectId: string, chapterId: string): Promise<ApiResponse<Topic[]>> => {
    const response = await api.get(`/classes/${classId}/subjects/${subjectId}/chapters/${chapterId}/topics`)
    return response.data
  },

  getTopic: async (classId: string, subjectId: string, chapterId: string, topicId: string): Promise<ApiResponse<Topic>> => {
    const response = await api.get(`/classes/${classId}/subjects/${subjectId}/chapters/${chapterId}/topics/${topicId}`)
    return response.data
  },

  updateTopicProgress: async (classId: string, subjectId: string, chapterId: string, topicId: string, completed: boolean): Promise<ApiResponse<Topic>> => {
    const response = await api.patch(`/classes/${classId}/subjects/${subjectId}/chapters/${chapterId}/topics/${topicId}/progress`, { completed })
    return response.data
  },
}