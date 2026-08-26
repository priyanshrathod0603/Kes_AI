import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { documentApi, type Document, type DocumentListResponse, type UploadDocumentParams } from '@/api'

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
      const res = await documentApi.getDocuments(params)
      return res.data ?? emptyList
    },
  })
}

export function useDocument(id: string | undefined) {
  return useQuery<Document | null>({
    queryKey: ['documents', id] as const,
    queryFn: async () => {
      if (!id) return null
      const res = await documentApi.getDocument(id)
      return res.data?.data ?? null
    },
    enabled: !!id,
  })
}

export function useDocumentContent(id: string | undefined) {
  return useQuery({
    queryKey: ['documents', id, 'content'] as const,
    queryFn: async () => {
      if (!id) return null
      const res = await documentApi.getDocumentContent(id)
      return res.data?.data ?? null
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
