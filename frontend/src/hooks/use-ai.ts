import { useMutation } from '@tanstack/react-query'
import { aiApi, type AIChatRequest, type AIChatResponse } from '@/api'

interface UseAIChatOptions {
  systemPrompt?: string
}

export function useAIChat(options: UseAIChatOptions = {}) {
  const mutation = useMutation<AIChatResponse, Error, string>({
    mutationFn: async (prompt: string) => {
      const res = await aiApi.chat({ prompt, systemPrompt: options.systemPrompt })
      const data = res.data?.data
      if (!data) throw new Error('Empty AI response')
      return data
    },
  })

  return {
    sendMessage: mutation.mutateAsync,
    isSending: mutation.isPending,
    error: mutation.error,
    data: mutation.data,
  }
}
