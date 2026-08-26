import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { documentApi } from '@/api'
import type { StudyMaterial } from '@/types'

export function useStudyMaterials(params?: {
  subjectId?: string
  chapterId?: string
  topicId?: string
  type?: string
  search?: string
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  favoritesOnly?: boolean
}) {
  return useQuery({
    queryKey: ['documents', params],
    queryFn: () => documentApi.getMaterials(params).then((res) => res.data!),
  })
}

export function useStudyMaterial(id: string) {
  return useQuery({
    queryKey: ['documents', id],
    queryFn: () => documentApi.getMaterial(id).then((res) => res.data!),
    enabled: !!id,
  })
}

export function useDownloadMaterial() {
  return useMutation({
    mutationFn: (id: string) => documentApi.getDownloadUrl(id),
  })
}

export function useToggleFavorite() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => documentApi.toggleFavorite(id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['documents'] })
      queryClient.invalidateQueries({ queryKey: ['documents', 'favorites'] })
      return response.data
    },
  })
}

export function useFavorites() {
  return useQuery({
    queryKey: ['documents', 'favorites'],
    queryFn: () => documentApi.getFavorites().then((res) => res.data!),
  })
}

export function useRecentMaterials(limit = 10) {
  return useQuery({
    queryKey: ['documents', 'recent', limit],
    queryFn: () => documentApi.getRecent(limit).then((res) => res.data!),
  })
}