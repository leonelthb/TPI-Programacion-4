import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'

import { useAuthStore } from '../store/authStore'

// Roles que pueden acceder a una ruta.
interface ProtectedRouteProps {
  children: ReactNode
  allowedRoles?: Array<'admin' | 'user'>
}

export function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {

  // Recuperamos los datos de autenticación.
  const usuario = useAuthStore((state) => state.usuario)
  const cargando = useAuthStore((state) => state.cargando)

  // Esperamos a que termine la comprobación de sesión.
  if (cargando) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p>Comprobando sesión...</p>
      </main>
    )
  }

  // Si no existe una sesión, enviamos al login.
  if (!usuario) {
    return <Navigate to="/login" replace />
  }

  // Si la ruta exige roles específicos, los verificamos.
  if (allowedRoles && !allowedRoles.includes(usuario.role)) {
    return <Navigate to="/unauthorized" replace />
  }

  // Si supera las verificaciones, mostramos la página.
  return <>{children}</>
}