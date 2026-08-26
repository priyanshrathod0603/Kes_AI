import axios, { AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'
import { API_BASE_URL } from '@/lib/constants'
import type { ApiError, ApiResponse } from '@/types'

class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors(): void {
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ApiResponse>) => {
        const apiError: ApiError = {
          message: error.response?.data?.error?.message || error.message || 'An unexpected error occurred',
          code: error.response?.data?.error?.code,
          status: error.response?.status || 500,
          details: error.response?.data?.error?.details,
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