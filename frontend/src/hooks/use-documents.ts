import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { documentApi } from '@/api'
import type { Document, DocumentListResponse, UploadDocumentParams } from '@/types'

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
  return useQuery({
    queryKey: ['documents', params],
    queryFn: () => documentApi.getDocuments(params).then((res) => res.data || { data: [], page: 1, limit: 20, total: 0, totalPages: 0 }),
  })
}

export function useDocument(id: string) {
  return useQuery({
    queryKey: ['documents', id],
    queryFn: () => documentApi.getDocument(id).then((res) => res.data?.data),
    enabled: !!id,
  })
}

export function useDocumentContent(id: string) {
  return useQuery({
    queryKey: ['documents', id, 'content'],
    queryFn: () => documentApi.getDocumentContent(id).then((res) => res.data?.data),
    enabled: !!id,
  })
}

export function useDownloadDocument() {
  return useMutation({
    mutationFn: (id: string) => documentApi.downloadDocument(id),
  })
}

export function useUploadDocument() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: UploadDocumentParams) => documentApi.uploadDocument(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] })
    },
  })
}

export function useDeleteDocument() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => documentApi.deleteDocument(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] })
    },
  })
}