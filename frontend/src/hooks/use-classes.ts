import { useQuery, useMutation } from '@tanstack/react-query'
import { academicApi } from '@/api'
import type { SchoolClass, Subject, Chapter, Topic } from '@/types'

export function useClasses() {
  return useQuery({
    queryKey: ['classes'],
    queryFn: () => academicApi.getClasses().then((res) => res.data?.data || []),
  })
}

export function useSubjects(params?: { classId?: string }) {
  return useQuery({
    queryKey: ['subjects', params],
    queryFn: () => academicApi.getSubjects(params).then((res) => res.data?.data || []),
  })
}

export function useChapters(params?: { subjectId?: string }) {
  return useQuery({
    queryKey: ['chapters', params],
    queryFn: () => academicApi.getChapters(params).then((res) => res.data?.data || []),
  })
}

export function useTopics(params?: { chapterId?: string }) {
  return useQuery({
    queryKey: ['topics', params],
    queryFn: () => academicApi.getTopics(params).then((res) => res.data?.data || []),
  })
}

export function useCreateClass() {
  return useMutation({
    mutationFn: (name: string) => academicApi.createClass(name),
  })
}

export function useCreateSubject() {
  return useMutation({
    mutationFn: ({ name, classId }: { name: string; classId: string }) => academicApi.createSubject(name, classId),
  })
}

export function useCreateChapter() {
  return useMutation({
    mutationFn: ({ name, description, subjectId }: { name: string; description?: string; subjectId: string }) => academicApi.createChapter(name, description, subjectId),
  })
}

export function useCreateTopic() {
  return useMutation({
    mutationFn: ({ name, chapterId }: { name: string; chapterId: string }) => academicApi.createTopic(name, chapterId),
  })
}