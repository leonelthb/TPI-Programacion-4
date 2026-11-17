
import { useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

import { ProductosPage } from './pages/ProductosPage'
import { SessionBar } from './components/SessionBar'
import { ThemeToggle } from './components/ThemeToggle'
import { useAuthStore } from './store/authStore'
import { ProtectedRoute } from './routes/ProtectedRoute'

import { CarritoPage } from './pages/CarritoPage'
import CheckoutPage from './pages/CheckoutPage'
import AdminPedidosPage from './pages/AdminPedidosPage'
import MisPedidosPage from './pages/MisPedidosPage'
import AdminProductosPage from './pages/AdminProductosPage'
import AdminCategoriasPage from './pages/AdminCategoriasPage'
import AdminUsuariosPage from './pages/AdminUsuariosPage'
import AdminResumenPage from './pages/AdminResumenPage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { UnauthorizedPage } from './pages/UnauthorizedPage'


function App() {
  const checkSession = useAuthStore((state) => state.checkSession)

  useEffect(() => {
    void checkSession()
  }, [checkSession])

  return (
    <>
      <Routes>
      {/* Rutas públicas */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      {/* Resumen administrativo */}
      <Route
        path="/admin/resumen"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <>
              <SessionBar />
              <AdminResumenPage />
            </>
          </ProtectedRoute>
        }
      />
      {/* Catálogo público */}
      <Route
        path="/productos"
        element={
          <>
            <SessionBar />
            <ProductosPage />
          </>
        }
      />

      {/* Administración de pedidos */}
      <Route
        path="/admin/pedidos"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <>
              <SessionBar />
              <AdminPedidosPage />
            </>
          </ProtectedRoute>
        }
      />

      {/* Administración de productos */}
      <Route
        path="/admin/productos"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <>
              <SessionBar />
              <AdminProductosPage />
            </>
          </ProtectedRoute>
        }
      />

      {/* Administración de categorías */}
      <Route
        path="/admin/categorias"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <>
              <SessionBar />
              <AdminCategoriasPage />
            </>
          </ProtectedRoute>
        }
      />

      {/* Administración de usuarios */}
      <Route
        path="/admin/usuarios"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <>
              <SessionBar />
              <AdminUsuariosPage />
            </>
          </ProtectedRoute>
        }
      />

      {/* Carrito de compras */}
      <Route
        path="/carrito"
        element={
          <>
            <SessionBar />
            <CarritoPage />
          </>
        }
      />

      {/* Checkout: requiere sesión iniciada */}
      <Route
        path="/checkout"
        element={
          <ProtectedRoute>
            <>
              <SessionBar />
              <CheckoutPage />
            </>
          </ProtectedRoute>
        }
      />

      {/* Mis pedidos: requiere sesión iniciada */}
      <Route
        path="/mis-pedidos"
        element={
          <ProtectedRoute>
            <>
              <SessionBar />
              <MisPedidosPage />
            </>
          </ProtectedRoute>
        }
      />

      {/* Redirecciones */}
      <Route path="/" element={<Navigate to="/productos" replace />} />
      <Route path="*" element={<Navigate to="/productos" replace />} />
      </Routes>
      <ThemeToggle />
    </>
  )
}

export default App
