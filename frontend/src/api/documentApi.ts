import { api } from './client'

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

function extractPayload<T>(response: { data?: unknown }): T {
  const raw = response?.data as { success?: boolean; data?: unknown } | undefined
  if (raw && typeof raw === 'object' && 'success' in raw) {
    const d1 = raw.data as { data?: unknown } | undefined
    if (d1 && typeof d1 === 'object' && 'data' in d1) {
      return (d1.data ?? d1) as T
    }
    return (raw.data ?? raw) as T
  }
  return response?.data as T
}

export const documentApi = {
  /** GET /api/pdf?classId=&subjectId=&...&page=&limit= */
  getDocuments: async (params?: {
    classId?: string
    subjectId?: string
    chapterId?: string
    topicId?: string
    documentType?: string
    page?: number
    limit?: number
  }): Promise<DocumentListResponse> => {
    const response = await api.get('/pdf', { params })
    const payload = extractPayload<any>(response)
    if (payload && Array.isArray(payload.data)) {
      return {
        data: payload.data,
        page: payload.page ?? 1,
        limit: payload.limit ?? 20,
        total: payload.total ?? payload.data.length,
        totalPages: payload.totalPages ?? (payload.limit ? Math.ceil(payload.total / payload.limit) : 1),
      }
    }
    if (Array.isArray(payload)) {
      return {
        data: payload,
        page: 1,
        limit: payload.length,
        total: payload.length,
        totalPages: 1,
      }
    }
    return {
      data: [],
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0,
    }
  },

  getDocument: async (id: string): Promise<Document | null> => {
    const response = await api.get(`/pdf/${id}`)
    return extractPayload<Document>(response) ?? null
  },

  getDocumentContent: async (id: string): Promise<DocumentContent | null> => {
    const response = await api.get(`/pdf/${id}/content`)
    return extractPayload<DocumentContent>(response) ?? null
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

  uploadDocument: async (params: UploadDocumentParams): Promise<{ message?: string; data: Document }> => {
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
    const doc = extractPayload<Document>(response)
    return { message: (response.data as any)?.message, data: doc }
  },

  deleteDocument: async (id: string): Promise<void> => {
    await api.delete(`/pdf/${id}`)
  },

  updateDocument: async (
    id: string,
    params: {
      title?: string
      documentType?: string
      classId?: string | null
      subjectId?: string | null
      chapterId?: string | null
      topicId?: string | null
    }
  ): Promise<Document> => {
    const response = await api.put(`/pdf/${id}`, params)
    return extractPayload<Document>(response) as Document
  },
}
