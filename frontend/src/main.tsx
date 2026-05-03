import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#1E2330',
            color: '#F0F0F5',
            border: '1px solid #2A2D3E',
            borderRadius: '12px',
            fontSize: '14px',
            fontFamily: 'Inter, sans-serif',
          },
          success: { iconTheme: { primary: '#22C55E', secondary: '#1E2330' } },
          error:   { iconTheme: { primary: '#EF4444', secondary: '#1E2330' } },
          duration: 3500,
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
)
