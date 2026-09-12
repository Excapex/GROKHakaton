import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ConvexProvider, ConvexReactClient } from 'convex/react'
import './index.css'
import App from './App.tsx'

// Samo javni Convex URL sme da nosi VITE_ prefiks (docs/TOOLSTACK.md §3).
const convexUrl = import.meta.env.VITE_CONVEX_URL as string | undefined
const convex = convexUrl ? new ConvexReactClient(convexUrl) : null

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {convex ? (
      <ConvexProvider client={convex}>
        <App backendConfigured />
      </ConvexProvider>
    ) : (
      <App backendConfigured={false} />
    )}
  </StrictMode>,
)
