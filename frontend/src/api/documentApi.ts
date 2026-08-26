import { api, unwrap } from './client'
import type { ApiResponse } from '@/types'

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
  pageCount?: number | null
  characterCount?: number | null
}

export interface DocumentListResponse {
  data: Document[]
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface DocumentContent {
  documentId: string
  extractionStatus: string
  pageCount: number
  characterCount: number
  extractedAt: string | null
  text: string
  extractionError: string | null
}

export interface UploadDocumentParams {
  file: File
  classId?: string
  subjectId?: string
  chapterId?: string
  topicId?: string
  documentType?: string
}

export const DOCUMENT_TYPES = [
  'CHAPTER_MATERIAL',
  'WORKSHEET',
  'QUESTION_PAPER',
  'ANSWER_KEY',
  'STUDY_MATERIAL',
] as const

export type DocumentType = (typeof DOCUMENT_TYPES)[number]

export const documentApi = {
  /** GET /api/pdf?classId=&subjectId=&...&page=&limit= → { success, data: DocumentListResponse } */
  getDocuments: async (params?: {
    classId?: string
    subjectId?: string
    chapterId?: string
    topicId?: string
    documentType?: string
    page?: number
    limit?: number
  }): Promise<ApiResponse<DocumentListResponse>> => {
    const response = await api.get('/pdf', { params })
    return unwrap<DocumentListResponse>(response.data)
  },

  getDocument: async (id: string): Promise<ApiResponse<{ data: Document }>> => {
    const response = await api.get(`/pdf/${id}`)
    return unwrap<{ data: Document }>(response.data)
  },

  getDocumentContent: async (id: string): Promise<ApiResponse<{ data: DocumentContent }>> => {
    const response = await api.get(`/pdf/${id}/content`)
    return unwrap<{ data: DocumentContent }>(response.data)
  },

  /** GET /api/pdf/:id/file → binary stream (the actual PDF) */
  getDocumentFileUrl: (id: string): string => {
    const base = (api.defaults.baseURL as string) || ''
    return `${base.replace(/\/$/, '')}/pdf/${id}/file`
  },

  /** Returns a Blob for download. */
  downloadDocument: async (id: string): Promise<Blob> => {
    const response = await api.get(`/pdf/${id}/file`, { responseType: 'blob' })
    return response.data as Blob
  },

  uploadDocument: async (params: UploadDocumentParams): Promise<ApiResponse<{ message: string; data: Document }>> => {
    const formData = new FormData()
    formData.append('file', params.file)
    if (params.classId) formData.append('classId', params.classId)
    if (params.subjectId) formData.append('subjectId', params.subjectId)
    if (params.chapterId) formData.append('chapterId', params.chapterId)
    if (params.topicId) formData.append('topicId', params.topicId)
    if (params.documentType) formData.append('documentType', params.documentType)

    const response = await api.post('/pdf/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return unwrap<{ message: string; data: Document }>(response.data)
  },

  deleteDocument: async (id: string): Promise<ApiResponse> => {
    const response = await api.delete(`/pdf/${id}`)
    return unwrap(response.data)
  },
}
