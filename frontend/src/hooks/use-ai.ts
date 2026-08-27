import { useMutation } from '@tanstack/react-query'
import { aiApi, type AIChatResponse, type AIChatRequest } from '@/api'

interface UseAIChatOptions {
  systemPrompt?: string
}

type AIChatInput = string | { prompt: string; systemPrompt?: string }

export function useAIChat(options: UseAIChatOptions = {}) {
  const mutation = useMutation<AIChatResponse, Error, AIChatInput>({
    mutationFn: async (input: AIChatInput) => {
      const text = typeof input === 'string' ? input : input.prompt
      const dynamicSystemPrompt =
        typeof input === 'object' && input.systemPrompt ? input.systemPrompt : options.systemPrompt

      const req: AIChatRequest = { prompt: text }
      if (dynamicSystemPrompt) req.systemPrompt = dynamicSystemPrompt

      const res = await aiApi.chat(req)
      if (!res.success) {
        const msg = (res.error && res.error.message) || 'AI request failed'
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
