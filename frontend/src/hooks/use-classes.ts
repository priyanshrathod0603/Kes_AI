import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { academicApi } from '@/api'
import type { SchoolClass, Subject, Chapter, Topic } from '@/types'

const extractList = <T,>(payload: { data?: { data?: T[] } } | undefined): T[] =>
  payload?.data?.data ?? []

export function useClasses() {
  return useQuery<SchoolClass[]>({
    queryKey: ['classes'],
    queryFn: () => academicApi.getClasses().then(extractList<SchoolClass>),
  })
}

export function useSubjects(params?: { classId?: string }, options?: { enabled?: boolean }) {
  return useQuery<Subject[]>({
    queryKey: ['subjects', params],
    queryFn: () => academicApi.getSubjects(params).then(extractList<Subject>),
    enabled: options?.enabled !== undefined ? options.enabled : true,
  })
}

export function useChapters(params?: { subjectId?: string }, options?: { enabled?: boolean }) {
  return useQuery<Chapter[]>({
    queryKey: ['chapters', params],
    queryFn: () => academicApi.getChapters(params).then(extractList<Chapter>),
    enabled: options?.enabled !== undefined ? options.enabled : true,
  })
}

export function useTopics(params?: { chapterId?: string }, options?: { enabled?: boolean }) {
  return useQuery<Topic[]>({
    queryKey: ['topics', params],
    queryFn: () => academicApi.getTopics(params).then(extractList<Topic>),
    enabled: options?.enabled !== undefined ? options.enabled : true,
  })
}

export function useCreateClass() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (name: string) => academicApi.createClass(name),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['classes'] }),
  })
}

export function useCreateSubject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ name, classId }: { name: string; classId: string }) =>
      academicApi.createSubject(name, classId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['subjects'] }),
  })
}

export function useCreateChapter() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ name, description, subjectId }: { name: string; description?: string; subjectId: string }) =>
      academicApi.createChapter(name, description, subjectId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['chapters'] }),
  })
}

export function useCreateTopic() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ name, chapterId }: { name: string; chapterId: string }) =>
      academicApi.createTopic(name, chapterId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['topics'] }),
  })
}
