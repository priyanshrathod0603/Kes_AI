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

export function useUpdateClass() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => academicApi.updateClass(id, name),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['classes'] }),
  })
}

export function useDeleteClass() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => academicApi.deleteClass(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['classes'] })
      qc.invalidateQueries({ queryKey: ['subjects'] })
      qc.invalidateQueries({ queryKey: ['chapters'] })
      qc.invalidateQueries({ queryKey: ['topics'] })
      qc.invalidateQueries({ queryKey: ['documents'] })
    },
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

export function useUpdateSubject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, name, classId }: { id: string; name: string; classId?: string }) =>
      academicApi.updateSubject(id, name, classId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['subjects'] }),
  })
}

export function useDeleteSubject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => academicApi.deleteSubject(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['subjects'] })
      qc.invalidateQueries({ queryKey: ['chapters'] })
      qc.invalidateQueries({ queryKey: ['topics'] })
      qc.invalidateQueries({ queryKey: ['documents'] })
    },
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

export function useUpdateChapter() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      name,
      description,
      subjectId,
    }: {
      id: string
      name: string
      description?: string
      subjectId?: string
    }) => academicApi.updateChapter(id, name, description, subjectId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['chapters'] }),
  })
}

export function useDeleteChapter() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => academicApi.deleteChapter(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['chapters'] })
      qc.invalidateQueries({ queryKey: ['topics'] })
      qc.invalidateQueries({ queryKey: ['documents'] })
    },
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

export function useUpdateTopic() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, name, chapterId }: { id: string; name: string; chapterId?: string }) =>
      academicApi.updateTopic(id, name, chapterId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['topics'] }),
  })
}

export function useDeleteTopic() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => academicApi.deleteTopic(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['topics'] })
      qc.invalidateQueries({ queryKey: ['documents'] })
    },
  })
}
