import { api } from './client'
import type { ApiResponse } from '@/types'

export const progressApi = {
  getStats: async (): Promise<ApiResponse<null>> => {
    // Return empty stats for now - backend doesn't have progress endpoint yet
    return { data: null, success: true }
  },
}