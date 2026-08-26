import { api } from './client'
import type { ApiResponse, Quiz, QuizAttempt, QuizQuestion } from '@/types'

export const quizApi = {
  getQuizzes: async (params?: {
    subjectId?: string
    chapterId?: string
    topicId?: string
    page?: number
    limit?: number
  }): Promise<ApiResponse<Quiz[]>> => {
    const response = await api.get('/quizzes', { params })
    return response.data
  },

  getQuiz: async (id: string): Promise<ApiResponse<Quiz>> => {
    const response = await api.get(`/quizzes/${id}`)
    return response.data
  },

  startQuiz: async (id: string): Promise<ApiResponse<{ attemptId: string; questions: QuizQuestion[] }>> => {
    const response = await api.post(`/quizzes/${id}/start`)
    return response.data
  },

  submitAnswer: async (attemptId: string, questionId: string, answer: string | number): Promise<ApiResponse> => {
    const response = await api.post(`/quizzes/attempts/${attemptId}/answers`, { questionId, answer })
    return response.data
  },

  submitQuiz: async (attemptId: string): Promise<ApiResponse<QuizAttempt>> => {
    const response = await api.post(`/quizzes/attempts/${attemptId}/submit`)
    return response.data
  },

  getAttempt: async (attemptId: string): Promise<ApiResponse<QuizAttempt>> => {
    const response = await api.get(`/quizzes/attempts/${attemptId}`)
    return response.data
  },

  getAttempts: async (quizId: string): Promise<ApiResponse<QuizAttempt[]>> => {
    const response = await api.get(`/quizzes/${quizId}/attempts`)
    return response.data
  },

  getQuestionExplanation: async (questionId: string): Promise<ApiResponse<{ explanation: string }>> => {
    const response = await api.get(`/quizzes/questions/${questionId}/explanation`)
    return response.data
  },
}