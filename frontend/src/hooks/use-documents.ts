import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { documentApi, type Document, type DocumentContent, type DocumentListResponse, type UploadDocumentParams } from '@/api'

const emptyList: DocumentListResponse = {
  data: [],
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0,
}

export function useDocuments(params?: {
  classId?: string
  subjectId?: string
  chapterId?: string
  topicId?: string
  documentType?: string
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}) {
  return useQuery<DocumentListResponse>({
    queryKey: ['documents', params] as const,
    queryFn: async () => {
      try {
        return await documentApi.getDocuments(params)
      } catch (err) {
        throw err
      }
    },
  })
}

export function useDocument(id: string | undefined) {
  return useQuery<Document | null>({
    queryKey: ['documents', id] as const,
    queryFn: async () => {
      if (!id) return null
      return await documentApi.getDocument(id)
    },
    enabled: !!id,
  })
}

export function useDocumentContent(id: string | undefined) {
  return useQuery<DocumentContent | null>({
    queryKey: ['documents', id, 'content'] as const,
    queryFn: async () => {
      if (!id) return null
      return await documentApi.getDocumentContent(id)
    },
    enabled: !!id,
  })
}

export function useDownloadDocument() {
  return useMutation({
    mutationFn: (id: string) => documentApi.downloadDocument(id),
  })
}

export function useUploadDocument() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (params: UploadDocumentParams) => documentApi.uploadDocument(params),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['documents'] })
    },
  })
}

export function useDeleteDocument() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => documentApi.deleteDocument(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['documents'] })
    },
  })
}

export function useUpdateDocument() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      ...params
    }: {
      id: string
      title?: string
      documentType?: string
      classId?: string | null
      subjectId?: string | null
      chapterId?: string | null
      topicId?: string | null
    }) => documentApi.updateDocument(id, params),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['documents'] })
    },
  })
}
