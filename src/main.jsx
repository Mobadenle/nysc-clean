import { StrictMode } from 'react'
import { createRoot }  from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import './styles/tokens.css'
import './styles/animations.css'
import './styles/globals.css'

import { AuthProvider } from './context/AuthContext'
import { AppProvider }  from './context/AppContext'
import App              from './App'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry:                1,
      refetchOnWindowFocus: false,
      staleTime:            30_000,
    },
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppProvider>
          <App />
        </AppProvider>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>
)
