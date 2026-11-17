
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import axios from 'axios'

import {
  listarPedidos,
  cancelarPedido,
} from '../services/pedido.service'

// Formatea importes en pesos argentinos.
function formatoPrecio(precio: number) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 2,
  }).format(precio)
}

// Traduce los estados y asigna un color a cada uno.
function obtenerEstado(estado: string) {
  const estados: Record<string, { nombre: string; estilo: string }> = {
    PENDIENTE: {
      nombre: 'Pendiente',
      estilo: 'bg-amber-100 text-amber-800 border-amber-200',
    },
    EN_PREPARACION: {
      nombre: 'En preparación',
      estilo: 'bg-food-cream text-food-green border-food-border',
    },
    ENTREGADO: {
      nombre: 'Entregado',
      estilo: 'bg-green-100 text-green-800 border-green-200',
    },
    CANCELADO: {
      nombre: 'Cancelado',
      estilo: 'bg-red-100 text-red-800 border-red-200',
    },
  }

  return estados[estado] ?? {
    nombre: estado,
    estilo: 'bg-food-background text-food-muted border-food-border',
  }
}

export default function MisPedidosPage() {
  const queryClient = useQueryClient()

  // Consultamos los pedidos del usuario autenticado.
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['mis-pedidos'],
    queryFn: () => listarPedidos({ skip: 0, limit: 20 }),
  })

  // Permite cancelar un pedido pendiente.
  const mutation = useMutation({
    mutationFn: cancelarPedido,

    onSuccess: async () => {
      // Actualizamos el listado después de cancelar.
      await queryClient.invalidateQueries({
        queryKey: ['mis-pedidos'],
      })

      await queryClient.invalidateQueries({
        queryKey: ['admin-resumen-pedidos'],
      })
    },
  })

  // Extraemos los mensajes de error de FastAPI.
  const mensajeError = axios.isAxiosError(error)
    ? error.response?.data?.detail
    : null

  const mensajeCancelacion = axios.isAxiosError(mutation.error)
    ? mutation.error.response?.data?.detail
    : null

  // Estado de carga.
  if (isLoading) {
    return (
      <main className="min-h-screen bg-food-background px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <h1 className="mb-4 text-3xl font-bold text-food-green">
            Mis pedidos
          </h1>

          <div className="space-y-4">
            {[1, 2].map((item) => (
              <div
                key={item}
                className="h-48 animate-pulse rounded-2xl border border-food-border bg-food-white"
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
      <main className="min-h-screen bg-food-background px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-5xl rounded-2xl border border-red-200 bg-food-white p-8">
          <h1 className="text-2xl font-bold text-food-green">
            Mis pedidos
          </h1>

          <p className="mt-4 text-red-600">
            {typeof mensajeError === 'string'
              ? mensajeError
              : 'No se pudieron cargar los pedidos.'}
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

  const pedidos = data?.items ?? []

  return (
    <main className="min-h-screen bg-food-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">

        {/* Encabezado */}
        <header className="mb-8 overflow-hidden rounded-3xl bg-food-green px-6 py-8 text-white shadow-lg sm:px-10">
          <p className="text-sm font-bold uppercase tracking-widest text-food-orange">
            FOOD STORE
          </p>

          <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">
            Mis pedidos
          </h1>

          <p className="mt-3 max-w-xl text-white/75">
            Consultá tus compras, revisá los productos y seguí el estado
            de cada pedido.
          </p>

          <div className="mt-5 h-1 w-20 rounded-full bg-food-orange" />
        </header>

        {/* Error al cancelar */}
        {mutation.isError && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {typeof mensajeCancelacion === 'string'
              ? mensajeCancelacion
              : 'No se pudo cancelar el pedido. Intentá nuevamente.'}
          </div>
        )}

        {/* Sin pedidos */}
        {pedidos.length === 0 ? (
          <section className="rounded-3xl border border-food-border bg-food-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-food-cream">
              <span className="text-3xl font-bold text-food-green">
                FS
              </span>
            </div>

            <h2 className="text-2xl font-bold text-food-green">
              Todavía no tenés pedidos
            </h2>

            <p className="mx-auto mt-3 max-w-md text-food-muted">
              Cuando realices una compra, aparecerá acá para que puedas
              consultar su estado y sus detalles.
            </p>

            <Link
              to="/productos"
              className="mt-7 inline-flex rounded-xl bg-food-orange px-6 py-3 font-semibold text-white transition hover:bg-food-green-light"
            >
              Explorar el menú
            </Link>
          </section>
        ) : (
          <div className="space-y-6">

            {/* Resumen de cantidad */}
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-bold text-food-green">
                Historial de compras
              </h2>

              <span className="rounded-full border border-food-border bg-food-white px-4 py-2 text-sm font-semibold text-food-green">
                {data?.total ?? pedidos.length} pedidos
              </span>
            </div>

            {/* Listado de pedidos */}
            {pedidos.map((pedido) => {
              const estado = obtenerEstado(pedido.estado)

              return (
                <article
                  key={pedido.id}
                  className="overflow-hidden rounded-2xl border border-food-border bg-food-white shadow-sm transition hover:shadow-md"
                >
                  {/* Encabezado del pedido */}
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-food-border bg-food-cream/50 p-5">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-food-orange-dark">
                        Número de pedido
                      </p>

                      <h3 className="mt-1 text-xl font-bold text-food-green">
                        Pedido #{pedido.id}
                      </h3>

                      <p className="mt-1 text-sm text-food-muted">
                        {new Date(pedido.created_at).toLocaleString('es-AR')}
                      </p>
                    </div>

                    {/* Estado del pedido */}
                    <span
                      className={`rounded-full border px-4 py-2 text-sm font-bold ${estado.estilo}`}
                    >
                      {estado.nombre}
                    </span>
                  </div>

                  <div className="p-5 sm:p-6">

                    {/* Información general */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-food-muted">
                          Forma de pago
                        </p>

                        <p className="mt-1 font-semibold text-food-green">
                          {pedido.forma_pago === 'EFECTIVO'
                            ? 'Efectivo'
                            : 'Transferencia'}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-food-muted">
                          Dirección de entrega
                        </p>

                        <p className="mt-1 font-semibold text-food-green">
                          {pedido.direccion_entrega}
                        </p>
                      </div>
                    </div>

                    {/* Notas */}
                    {pedido.notas && (
                      <div className="mt-4 rounded-xl bg-food-background p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-food-muted">
                          Notas del pedido
                        </p>

                        <p className="mt-1 text-sm text-food-text">
                          {pedido.notas}
                        </p>
                      </div>
                    )}

                    {/* Productos */}
                    <div className="mt-6 border-t border-food-border pt-5">
                      <h4 className="mb-4 font-bold text-food-green">
                        Productos del pedido
                      </h4>

                      <div className="space-y-4">
                        {pedido.items.map((item, index) => (
                          <div
                            key={`${pedido.id}-${item.producto_id}-${index}`}
                            className="flex justify-between gap-4"
                          >
                            <div>
                              <p className="font-semibold text-food-text">
                                {item.nombre_producto}
                              </p>

                              <p className="mt-1 text-sm text-food-muted">
                                {item.cantidad} x {formatoPrecio(item.precio_unitario)}
                              </p>
                            </div>

                            <p className="shrink-0 font-semibold text-food-green">
                              {formatoPrecio(item.subtotal)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Total y acciones */}
                    <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-food-border pt-5">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-food-muted">
                          Total del pedido
                        </p>

                        <p className="mt-1 text-2xl font-bold text-food-orange-dark">
                          {formatoPrecio(pedido.total)}
                        </p>
                      </div>

                      {pedido.estado === 'PENDIENTE' && (
                        <button
                          type="button"
                          onClick={() => {
                            const confirmar = window.confirm(
                              `¿Querés cancelar el pedido #${pedido.id}?`,
                            )

                            if (confirmar) {
                              mutation.mutate(pedido.id)
                            }
                          }}
                          disabled={mutation.isPending}
                          className="rounded-xl border border-red-200 px-5 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {mutation.isPending
                            ? 'Cancelando...'
                            : 'Cancelar pedido'}
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}

        {/* Seguir comprando */}
        <div className="mt-8 text-center">
          <Link
            to="/productos"
            className="inline-flex rounded-xl border border-food-border bg-food-white px-6 py-3 font-semibold text-food-green transition hover:border-food-orange hover:bg-food-cream"
          >
            Volver al catálogo
          </Link>
        </div>

        {/* Pie */}
        <footer className="mt-12 border-t border-food-border py-6 text-center">
          <p className="text-sm text-food-muted">
            Food Store · Gracias por elegirnos.
          </p>
        </footer>
      </div>
    </main>
  )
}
