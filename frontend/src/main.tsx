import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import { ThemeProvider } from './lib/ThemeContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <App />
        <Toaster
          position="bottom-right"
          toastOptions={{
            className: 'glass-card !bg-bg-elevated !text-text-primary !border-bg-border !rounded-xl !shadow-glow-sm',
            style: {
              fontSize: '14px',
              fontFamily: 'Inter, sans-serif',
            },
            success: { iconTheme: { primary: '#22C55E', secondary: 'transparent' } },
            error:   { iconTheme: { primary: '#EF4444', secondary: 'transparent' } },
            duration: 3500,
          }}
        />
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
)
