import { useQuery } from '@tanstack/react-query'
import { classApi } from '@/api'
import type { Class, Subject, Chapter, Topic } from '@/types'

export function useClasses() {
  return useQuery({
    queryKey: ['classes'],
    queryFn: () => classApi.getClasses().then((res) => res.data!),
  })
}

export function useClass(id: string) {
  return useQuery({
    queryKey: ['classes', id],
    queryFn: () => classApi.getClass(id).then((res) => res.data!),
    enabled: !!id,
  })
}

export function useSubjects(classId: string) {
  return useQuery({
    queryKey: ['classes', classId, 'subjects'],
    queryFn: () => classApi.getSubjects(classId).then((res) => res.data!),
    enabled: !!classId,
  })
}

export function useSubject(classId: string, subjectId: string) {
  return useQuery({
    queryKey: ['classes', classId, 'subjects', subjectId],
    queryFn: () => classApi.getSubject(classId, subjectId).then((res) => res.data!),
    enabled: !!classId && !!subjectId,
  })
}

export function useChapters(classId: string, subjectId: string) {
  return useQuery({
    queryKey: ['classes', classId, 'subjects', subjectId, 'chapters'],
    queryFn: () => classApi.getChapters(classId, subjectId).then((res) => res.data!),
    enabled: !!classId && !!subjectId,
  })
}

export function useChapter(classId: string, subjectId: string, chapterId: string) {
  return useQuery({
    queryKey: ['classes', classId, 'subjects', subjectId, 'chapters', chapterId],
    queryFn: () => classApi.getChapter(classId, subjectId, chapterId).then((res) => res.data!),
    enabled: !!classId && !!subjectId && !!chapterId,
  })
}

export function useTopics(classId: string, subjectId: string, chapterId: string) {
  return useQuery({
    queryKey: ['classes', classId, 'subjects', subjectId, 'chapters', chapterId, 'topics'],
    queryFn: () => classApi.getTopics(classId, subjectId, chapterId).then((res) => res.data!),
    enabled: !!classId && !!subjectId && !!chapterId,
  })
}

export function useTopic(classId: string, subjectId: string, chapterId: string, topicId: string) {
  return useQuery({
    queryKey: ['classes', classId, 'subjects', subjectId, 'chapters', chapterId, 'topics', topicId],
    queryFn: () => classApi.getTopic(classId, subjectId, chapterId, topicId).then((res) => res.data!),
    enabled: !!classId && !!subjectId && !!chapterId && !!topicId,
  })
}

export function useUpdateTopicProgress() {
  return classApi.updateTopicProgress
}