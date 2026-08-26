import axios, { AxiosError, type AxiosInstance } from 'axios'
import { API_BASE_URL } from '@/lib/constants'
import type { ApiError, ApiResponse } from '@/types'

/**
 * Backend envelope:
 *   success: { success: true,  message, data }
 *   error:   { success: false, message }
 */
interface BackendEnvelope<T> {
  success: boolean
  message?: string
  data?: T
}

class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 60_000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    console.log('[API Client] baseURL:', API_BASE_URL)
    this.setupInterceptors()
  }

  private setupInterceptors(): void {
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<BackendEnvelope<unknown>>) => {
        const data = error.response?.data
        const apiError: ApiError = {
          message:
            (data && typeof data.message === 'string' && data.message) ||
            error.message ||
            'An unexpected error occurred',
          status: error.response?.status || 500,
        }
        return Promise.reject(apiError)
      }
    )
  }

  public getClient(): AxiosInstance {
    return this.client
  }
}

export const apiClient = new ApiClient()
export const api = apiClient.getClient()

/**
 * Helper that unwraps a backend envelope into ApiResponse<T>.
 * Backend returns either { success, message, data } (for academic routes
 * data may itself contain { data: [...] } as the controller wraps it).
 */
export function unwrap<T>(payload: unknown): ApiResponse<T> {
  const env = payload as BackendEnvelope<unknown> | undefined
  if (env && typeof env === 'object' && 'success' in env) {
    return {
      success: !!env.success,
      data: env.data as T | undefined,
    }
  }
  return { success: true, data: payload as T }
}
