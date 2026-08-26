import { api } from './client'
import type { ApiResponse, ProgressStats, ActivityItem, Notification } from '@/types'

export const progressApi = {
  getStats: async (): Promise<ApiResponse<ProgressStats>> => {
    const response = await api.get('/progress/stats')
    return response.data
  },

  getWeeklyStudyTime: async (): Promise<ApiResponse<ProgressStats['weeklyStudyTime']>> => {
    const response = await api.get('/progress/weekly-study-time')
    return response.data
  },

  getSubjectPerformance: async (): Promise<ApiResponse<ProgressStats['subjectPerformance']>> => {
    const response = await api.get('/progress/subject-performance')
    return response.data
  },

  getQuizPerformance: async (): Promise<ApiResponse<ProgressStats['quizPerformance']>> => {
    const response = await api.get('/progress/quiz-performance')
    return response.data
  },

  getLearningStreak: async (): Promise<ApiResponse<ProgressStats['learningStreak']>> => {
    const response = await api.get('/progress/learning-streak')
    return response.data
  },

  getActivity: async (params?: { page?: number; limit?: number; type?: string }): Promise<ApiResponse<ActivityItem[]>> => {
    const response = await api.get('/progress/activity', { params })
    return response.data
  },

  getNotifications: async (params?: { page?: number; limit?: number; unreadOnly?: boolean }): Promise<ApiResponse<Notification[]>> => {
    const response = await api.get('/notifications', { params })
    return response.data
  },

  markNotificationRead: async (id: string): Promise<ApiResponse<Notification>> => {
    const response = await api.patch(`/notifications/${id}/read`)
    return response.data
  },

  markAllNotificationsRead: async (): Promise<ApiResponse> => {
    const response = await api.patch('/notifications/read-all')
    return response.data
  },
}