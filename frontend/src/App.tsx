import { RouterProvider } from 'react-router-dom'
import { QueryProvider } from '@/lib/query-provider'
import { router } from '@/routes'
import { Toaster } from '@/components/ui/toaster'

function App() {
  return (
    <QueryProvider>
      <RouterProvider router={router} />
      <Toaster />
    </QueryProvider>
  )
}

export default App