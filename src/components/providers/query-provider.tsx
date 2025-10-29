/**
 * React Query Provider
 * Configure TanStack Query pour le data fetching et caching
 */

'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Cache pendant 5 minutes par défaut
            staleTime: 5 * 60 * 1000,
            // Garder en cache pendant 10 minutes
            gcTime: 10 * 60 * 1000,
            // Retry 1 fois en cas d'erreur
            retry: 1,
            // Refetch au focus de la fenêtre
            refetchOnWindowFocus: true,
            // Ne pas refetch au mount si data encore fraîche
            refetchOnMount: false,
          },
          mutations: {
            // Retry 0 fois pour les mutations
            retry: 0,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* DevTools uniquement en dev */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  )
}
