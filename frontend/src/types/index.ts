export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: {
    message: string
    code?: string
    details?: Record<string, string[]>
  }
  meta?: {
    page?: number
    limit?: number
    total?: number
  }
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface Document {
  id: string
  title: string
  fileName: string
  fileType: string
  fileSize: number
  documentType: string
  processed: boolean
  createdAt: string
  updatedAt: string
  schoolClassId: string | null
  subjectId: string | null
  chapterId: string | null
  topicId: string | null
  extractionStatus?: string
  extractionError?: string | null
  extractedAt?: string | null
  pageCount?: number
  characterCount?: number
}

export interface DocumentListResponse {
  data: Document[]
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface UploadDocumentParams {
  file: File
  classId?: string
  subjectId?: string
  chapterId?: string
  topicId?: string
  documentType?: string
}

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

export interface Quiz {
  id: string
  title: string
  description: string | null
  subjectId: string
  createdAt: string
  updatedAt: string
}

export interface ApiError {
  message: string
  code?: string
  status: number
  details?: Record<string, string[]>
}

export type NavItem = {
  label: string
  href: string
  icon: string
  isAction?: boolean
}