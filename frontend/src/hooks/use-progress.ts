import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { progressApi } from '@/api'
import type { ProgressStats, ActivityItem, Notification } from '@/types'

export function useProgressStats() {
  return useQuery({
    queryKey: ['progress', 'stats'],
    queryFn: () => progressApi.getStats().then((res) => res.data!),
  })
}

export function useWeeklyStudyTime() {
  return useQuery({
    queryKey: ['progress', 'weekly-study-time'],
    queryFn: () => progressApi.getWeeklyStudyTime().then((res) => res.data!),
  })
}

export function useSubjectPerformance() {
  return useQuery({
    queryKey: ['progress', 'subject-performance'],
    queryFn: () => progressApi.getSubjectPerformance().then((res) => res.data!),
  })
}

export function useQuizPerformance() {
  return useQuery({
    queryKey: ['progress', 'quiz-performance'],
    queryFn: () => progressApi.getQuizPerformance().then((res) => res.data!),
  })
}

export function useLearningStreak() {
  return useQuery({
    queryKey: ['progress', 'learning-streak'],
    queryFn: () => progressApi.getLearningStreak().then((res) => res.data!),
  })
}

export function useActivity(params?: { page?: number; limit?: number; type?: string }) {
  return useQuery({
    queryKey: ['progress', 'activity', params],
    queryFn: () => progressApi.getActivity(params).then((res) => res.data!),
  })
}

export function useNotifications(params?: { page?: number; limit?: number; unreadOnly?: boolean }) {
  return useQuery({
    queryKey: ['notifications', params],
    queryFn: () => progressApi.getNotifications(params).then((res) => res.data!),
  })
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => progressApi.markNotificationRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => progressApi.markAllNotificationsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}