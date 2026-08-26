import { useMutation } from '@tanstack/react-query'
import { aiApi, type AIChatResponse, type AIChatRequest } from '@/api'

interface UseAIChatOptions {
  systemPrompt?: string
}

export function useAIChat(options: UseAIChatOptions = {}) {
  const mutation = useMutation<AIChatResponse, Error, string>({
    mutationFn: async (prompt: string) => {
      const req: AIChatRequest = { prompt }
      if (options.systemPrompt) req.systemPrompt = options.systemPrompt
      const res = await aiApi.chat(req)
      if (!res.success) {
        const msg =
          (res.error && res.error.message) ||
          'AI request failed'
        throw new Error(msg)
      }
      const data = res.data
      if (!data || typeof data.response !== 'string' || data.response.length === 0) {
        throw new Error('Empty AI response')
      }
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
