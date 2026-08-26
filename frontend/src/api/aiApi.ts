import { api, unwrap } from './client'
import type { ApiResponse } from '@/types'

export interface AIChatRequest {
  prompt: string
  systemPrompt?: string
}

export interface AIChatResponse {
  response: string
  provider: string
  model: string
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

export const aiApi = {
  /**
   * Send a chat prompt to the backend AI service.
   * Backend endpoint: POST /api/ai/test
   * Body: { systemPrompt?, prompt }
   * Axios response:  { data: { success, data: { response, provider, model, usage } } }
   * After unwrap():  { success, data: { response, provider, model, usage } }
   */
  chat: async (request: AIChatRequest): Promise<ApiResponse<AIChatResponse>> => {
    const response = await api.post('/ai/test', request)
    return unwrap<AIChatResponse>(response.data)
  },
}
