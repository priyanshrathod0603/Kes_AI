import { useMutation } from '@tanstack/react-query'
import { aiApi } from '@/api'
import type { AIChatRequest, AIChatResponse } from '@/types'

export function useAIChat() {
  const sendMessageMutation = useMutation({
    mutationFn: (request: AIChatRequest) => aiApi.chat(request),
  })

  return {
    sendMessage: sendMessageMutation.mutateAsync,
    isSending: sendMessageMutation.isPending,
    error: sendMessageMutation.error,
  }
}