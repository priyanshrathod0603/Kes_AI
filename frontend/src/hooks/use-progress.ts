import { useQuery } from '@tanstack/react-query'
import { progressApi } from '@/api'

/**
 * The backend does not yet expose progress endpoints. This hook is wired
 * to the real API path so the moment the backend adds it, the dashboard
 * will start showing real numbers. Until then the data is null and the
 * dashboard renders honest empty states.
 */
export function useProgressStats() {
  return useQuery({
    queryKey: ['progress', 'stats'],
    queryFn: () => progressApi.getStats(),
  })
}
