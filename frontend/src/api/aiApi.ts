import { api } from './client'
import type { ApiResponse } from '@/types'

export interface AIChatRequest {
  prompt: string
  systemPrompt?: string
}

export interface AIChatResponse {
  response: string
  provider: string
  model: string
  usage: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

export const aiApi = {
  chat: async (request: AIChatRequest): Promise<ApiResponse<AIChatResponse>> => {
    const response = await api.post('/ai/test', request)
    return response.data
  },
}