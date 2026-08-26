import { api, unwrap } from './client'
import type { ApiResponse } from '@/types'

/**
 * The backend does not yet expose a progress endpoint. We probe it anyway
 * and surface whatever the backend actually returns. The UI uses this to
 * show a real empty state instead of fabricated charts.
 */
export const progressApi = {
  getStats: async (): Promise<ApiResponse<unknown>> => {
    try {
      const response = await api.get('/progress/stats')
      return unwrap<unknown>(response.data)
    } catch {
      return { success: false, data: null }
    }
  },
}
