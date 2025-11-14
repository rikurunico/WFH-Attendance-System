import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App.jsx'

// Configure React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // Data considered fresh for 2 minutes
      cacheTime: 1000 * 60 * 5, // Cache persists for 5 minutes
      refetchOnWindowFocus: true, // Auto-refetch when user returns to tab
      retry: 2, // Retry failed requests twice
      refetchOnReconnect: true, // Refetch when internet reconnects
    },
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
)
