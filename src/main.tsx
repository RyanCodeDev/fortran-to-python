import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Apply the saved theme before mounting the interface. Storage may be unavailable.
try {
  document.documentElement.dataset.theme = localStorage.getItem('reanimate-theme') === 'light' ? 'light' : 'dark'
} catch {
  document.documentElement.dataset.theme = 'dark'
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
