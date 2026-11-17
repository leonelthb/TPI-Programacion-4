import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

import { QueryProvider } from './app/query-provider'
import './index.css'
import App from './App'

// Punto de entrada de nuestra aplicación.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* Proveedor global de consultas */}
    <QueryProvider>
      {/* Habilita la navegación entre páginas */}
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryProvider>
  </StrictMode>,
)