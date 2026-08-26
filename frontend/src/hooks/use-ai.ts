import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { aiApi } from '@/api'
import type { AIChatRequest, AIMessage } from '@/types'

export function useAIChat() {
  const queryClient = useQueryClient()

  const sendMessageMutation = useMutation({
    mutationFn: (request: AIChatRequest) => aiApi.chat(request),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['ai', 'history'] })
      return response.data
    },
  })

  const regenerateMutation = useMutation({
    mutationFn: (messageId: string) => aiApi.regenerateResponse(messageId),
  })

  const simplifyMutation = useMutation({
    mutationFn: (messageId: string) => aiApi.simplifyResponse(messageId),
  })

  const exampleMutation = useMutation({
    mutationFn: (messageId: string) => aiApi.generateExample(messageId),
  })

  const quizMutation = useMutation({
    mutationFn: (messageId: string) => aiApi.generateQuiz(messageId),
  })

  const summarizeMutation = useMutation({
    mutationFn: (messageId: string) => aiApi.summarizeResponse(messageId),
  })

  return {
    sendMessage: sendMessageMutation.mutateAsync,
    regenerate: regenerateMutation.mutateAsync,
    simplify: simplifyMutation.mutateAsync,
    example: exampleMutation.mutateAsync,
    quiz: quizMutation.mutateAsync,
    summarize: summarizeMutation.mutateAsync,
    isSending: sendMessageMutation.isPending,
    isRegenerating: regenerateMutation.isPending,
    isSimplifying: simplifyMutation.isPending,
    isGeneratingExample: exampleMutation.isPending,
    isGeneratingQuiz: quizMutation.isPending,
    isSummarizing: summarizeMutation.isPending,
  }
}

export function useAIHistory(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['ai', 'history', params],
    queryFn: () => aiApi.getHistory(params).then((res) => res.data!),
  })
}

export function useAIConversation(id: string) {
  return useQuery({
    queryKey: ['ai', 'conversation', id],
    queryFn: () => aiApi.getConversation(id).then((res) => res.data!),
    enabled: !!id,
  })
}

export function useDeleteConversation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => aiApi.deleteConversation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai', 'history'] })
    },
  })
}