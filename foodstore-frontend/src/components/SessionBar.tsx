
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useCartStore } from '../store/cartStore'

export function SessionBar() {
  const navigate = useNavigate()

  const usuario = useAuthStore((state) => state.usuario)
  const logout = useAuthStore((state) => state.logout)

  // Obtenemos el carrito y calculamos las unidades seleccionadas.
  const items = useCartStore((state) => state.items)

  const cantidadCarrito = items.reduce(
    (total, item) => total + item.cantidad,
    0,
  )

  // Cierra la sesión y vuelve al login.
  async function handleLogout() {
    await logout()
    navigate('/login', { replace: true })
  }

  // Los visitantes también pueden acceder a las pantallas de autenticación.
  if (!usuario) {
    return (
      <header className="sticky top-0 z-50 flex flex-wrap items-center justify-between gap-4 border-b border-food-border bg-food-white px-6 py-4 shadow-sm">
        <button
          type="button"
          onClick={() => navigate('/productos')}
          className="text-left text-lg font-bold tracking-wide text-food-green"
        >
          Food Store
        </button>
        <nav aria-label="Navegación de usuario" className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="rounded-lg border border-food-green px-4 py-2 text-sm font-semibold text-food-green transition hover:bg-food-cream"
          >
            Iniciar sesión
          </button>
          <button
            type="button"
            onClick={() => navigate('/register')}
            className="rounded-lg bg-food-orange px-4 py-2 text-sm font-semibold text-white transition hover:bg-food-green-light"
          >
            Registrarme
          </button>
        </nav>
      </header>
    )
  }

  return (
    <header className="sticky top-0 z-50 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 bg-food-green px-6 py-4 text-white shadow-lg">

      {/* Información del usuario */}
      <div>
        <button
          type="button"
          onClick={() => navigate('/productos')}
          className="text-left"
        >
          <p className="text-lg font-bold tracking-wide text-white">
            Food Store
          </p>
        </button>

        <p className="text-sm text-white/70">
          {usuario.full_name} ·{' '}
          {usuario.role === 'admin' ? 'Administrador' : 'Cliente'}
        </p>
      </div>

      {/* Navegación administrativa */}
      {usuario.role === 'admin' && (
        <nav className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => navigate('/admin/productos')}
            className="rounded-lg border border-white/20 px-3 py-2 text-sm font-medium text-white transition hover:border-food-orange hover:bg-food-green-light"
          >
            Productos
          </button>

          <button
            type="button"
            onClick={() => navigate('/admin/categorias')}
            className="rounded-lg border border-white/20 px-3 py-2 text-sm font-medium text-white transition hover:border-food-orange hover:bg-food-green-light"
          >
            Categorías
          </button>

          <button
            type="button"
            onClick={() => navigate('/admin/pedidos')}
            className="rounded-lg border border-white/20 px-3 py-2 text-sm font-medium text-white transition hover:border-food-orange hover:bg-food-green-light"
          >
            Pedidos
          </button>

          <button
            type="button"
            onClick={() => navigate('/admin/usuarios')}
            className="rounded-lg border border-white/20 px-3 py-2 text-sm font-medium text-white transition hover:border-food-orange hover:bg-food-green-light"
          >
            Usuarios
          </button>

          <button
            type="button"
            onClick={() => navigate('/admin/resumen')}
            className="rounded-lg bg-food-orange px-3 py-2 text-sm font-semibold text-white transition hover:bg-food-green-light"
          >
            Resumen
          </button>
        </nav>
      )}

      {/* Navegación del cliente */}
      {usuario.role === 'user' && (
        <nav className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => navigate('/productos')}
            className="rounded-lg border border-white/20 px-3 py-2 text-sm font-medium text-white transition hover:border-food-orange hover:bg-food-green-light"
          >
            Catálogo
          </button>

          <button
            type="button"
            onClick={() => navigate('/carrito')}
            className="rounded-lg bg-food-orange px-4 py-2 text-sm font-semibold text-white transition hover:bg-food-green-light"
          >
            Carrito ({cantidadCarrito})
          </button>

          <button
            type="button"
            onClick={() => navigate('/mis-pedidos')}
            className="rounded-lg border border-white/20 px-3 py-2 text-sm font-medium text-white transition hover:border-food-orange hover:bg-food-green-light"
          >
            Mis pedidos
          </button>
        </nav>
      )}

      {/* Cerrar sesión */}
      <button
        type="button"
        onClick={() => void handleLogout()}
        className="rounded-lg bg-food-orange px-4 py-2 text-sm font-semibold text-white transition hover:bg-food-green-light"
      >
        Cerrar sesión
      </button>
    </header>
  )
}
