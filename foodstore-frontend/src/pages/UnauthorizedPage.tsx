import { Link } from 'react-router-dom'

export function UnauthorizedPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6">

      <h1 className="text-3xl font-bold">
        Acceso denegado
      </h1>

      <p className="text-food-muted">
        No tenés permisos para acceder a esta sección.
      </p>

      <Link
        to="/productos"
        className="rounded-lg bg-food-green px-5 py-2 text-white hover:bg-food-green-light"
      >
        Volver al catálogo
      </Link>

    </main>
  )
}