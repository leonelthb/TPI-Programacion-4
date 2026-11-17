
import { useQuery } from '@tanstack/react-query'
import { obtenerResumenPedidos } from '../services/pedido.service'

// Configuración visual de los indicadores.
const indicadores = [
  {
    clave: 'pendientes',
    titulo: 'Pedidos pendientes',
    descripcion: 'Esperando preparación',
    color: 'border-l-amber-500',
    fondo: 'bg-amber-50',
    texto: 'text-amber-700',
  },
  {
    clave: 'en_preparacion',
    titulo: 'En preparación',
    descripcion: 'Pedidos en curso',
    color: 'border-l-blue-500',
    fondo: 'bg-food-cream',
    texto: 'text-food-green',
  },
  {
    clave: 'entregados',
    titulo: 'Pedidos entregados',
    descripcion: 'Pedidos completados',
    color: 'border-l-green-600',
    fondo: 'bg-green-50',
    texto: 'text-green-700',
  },
  {
    clave: 'cancelados',
    titulo: 'Pedidos cancelados',
    descripcion: 'Pedidos anulados',
    color: 'border-l-red-500',
    fondo: 'bg-red-50',
    texto: 'text-red-700',
  },
  {
    clave: 'pedidos_hoy',
    titulo: 'Pedidos de hoy',
    descripcion: 'Pedidos creados durante el día',
    color: 'border-l-food-orange',
    fondo: 'bg-food-cream',
    texto: 'text-food-orange-dark',
  },
] as const

// Formatea los ingresos como moneda argentina.
function formatoPrecio(precio: number) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 2,
  }).format(precio)
}

export default function AdminResumenPage() {
  // Consulta los indicadores administrativos.
  const {
    data: resumen,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['admin-resumen-pedidos'],
    queryFn: obtenerResumenPedidos,
  })

  // Estado de carga.
  if (isLoading) {
    return (
      <main className="min-h-screen bg-food-background p-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 h-32 animate-pulse rounded-3xl bg-food-green/20" />

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="h-40 animate-pulse rounded-2xl border border-food-border bg-food-white"
              />
            ))}
          </div>
        </div>
      </main>
    )
  }

  // Estado de error.
  if (isError) {
    return (
      <main className="min-h-screen bg-food-background p-6">
        <div className="mx-auto max-w-7xl rounded-2xl border border-red-200 bg-food-white p-8">
          <h1 className="text-2xl font-bold text-food-green">
            Resumen administrativo
          </h1>

          <p className="mt-4 text-red-600">
            No se pudo cargar el resumen: {error.message}
          </p>

          <button
            type="button"
            onClick={() => void refetch()}
            className="mt-5 rounded-xl bg-food-green px-5 py-3 font-semibold text-white transition hover:bg-food-green-light"
          >
            Reintentar
          </button>
        </div>
      </main>
    )
  }

  if (!resumen) {
    return null
  }

  // Calculamos los ingresos entregados.
  const ingresosFormateados = formatoPrecio(
    resumen.ingresos_entregados,
  )

  return (
    <main className="min-h-screen bg-food-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* Encabezado del dashboard */}
        <header className="mb-8 overflow-hidden rounded-3xl bg-food-green px-6 py-8 text-white shadow-lg sm:px-10">
          <p className="text-sm font-bold uppercase tracking-widest text-food-orange">
            FOOD STORE
          </p>

          <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white sm:text-4xl">
                Panel de administración
              </h1>

              <p className="mt-3 max-w-xl text-white/75">
                Consultá el estado general de los pedidos y los
                principales indicadores del negocio.
              </p>
            </div>

            <button
              type="button"
              onClick={() => void refetch()}
              disabled={isFetching}
              className="rounded-xl border border-white/25 px-4 py-3 text-sm font-semibold text-white transition hover:bg-food-white/10 disabled:opacity-50"
            >
              {isFetching ? 'Actualizando...' : 'Actualizar datos'}
            </button>
          </div>

          <div className="mt-6 h-1 w-20 rounded-full bg-food-orange" />
        </header>

        {/* Título de indicadores */}
        <section className="mb-6">
          <p className="text-sm font-bold uppercase tracking-wider text-food-orange">
            Estado del negocio
          </p>

          <h2 className="mt-1 text-2xl font-bold text-food-green">
            Resumen general
          </h2>

          <p className="mt-2 text-food-muted">
            Indicadores correspondientes a los pedidos registrados.
          </p>
        </section>

        {/* Tarjetas de indicadores */}
        <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {indicadores.map((indicador) => (
            <article
              key={indicador.clave}
              className={`rounded-2xl border border-food-border border-l-4 ${indicador.color} bg-food-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-food-muted">
                    {indicador.titulo}
                  </p>

                  <p className="mt-2 text-4xl font-bold text-food-green">
                    {resumen[indicador.clave]}
                  </p>
                </div>

                <div
                  className={`rounded-xl p-3 ${indicador.fondo}`}
                >
                  <span className={`text-lg font-bold ${indicador.texto}`}>
                    {resumen[indicador.clave]}
                  </span>
                </div>
              </div>

              <p className="mt-5 border-t border-food-border pt-4 text-sm text-food-muted">
                {indicador.descripcion}
              </p>
            </article>
          ))}

          {/* Tarjeta de ingresos */}
          <article className="relative overflow-hidden rounded-2xl border border-food-green bg-food-green p-6 text-white shadow-md transition duration-300 hover:-translate-y-1 hover:shadow-xl sm:col-span-2 lg:col-span-1">
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-food-white/5" />

            <div className="relative">
              <p className="text-sm font-semibold text-white/75">
                Ingresos entregados
              </p>

              <p className="mt-4 text-3xl font-bold text-white sm:text-4xl">
                {ingresosFormateados}
              </p>

              <p className="mt-5 border-t border-white/20 pt-4 text-sm text-white/70">
                Total acumulado de pedidos entregados.
              </p>
            </div>

            <div className="absolute bottom-0 left-0 h-1 w-full bg-food-orange" />
          </article>
        </section>

        {/* Pie de página */}
        <footer className="mt-12 border-t border-food-border py-6 text-center">
          <p className="text-sm text-food-muted">
            Food Store · Panel de administración
          </p>
        </footer>
      </div>
    </main>
  )
}
