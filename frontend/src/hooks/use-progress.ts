import { useQuery } from '@tanstack/react-query'
import { progressApi } from '@/api'

export function useProgressStats() {
  return useQuery({
    queryKey: ['progress', 'stats'],
    queryFn: () => progressApi.getStats().then((res) => res.data),
  })
}