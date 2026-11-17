
import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'

import {
  listarPedidos,
  cambiarEstadoPedido,
} from '../services/pedido.service'

import type { EstadoPedido } from '../types/pedido'

// Traduce los estados para mostrarlos en pantalla.
const nombreEstado = (estado: EstadoPedido) => {
  const estados: Record<EstadoPedido, string> = {
    PENDIENTE: 'Pendiente',
    EN_PREPARACION: 'En preparación',
    ENTREGADO: 'Entregado',
    CANCELADO: 'Cancelado',
  }

  return estados[estado]
}

// Formatea los importes en pesos argentinos.
const formatoPrecio = (precio: number) =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
  }).format(precio)

export default function AdminPedidosPage() {
  const queryClient = useQueryClient()

  // Estado del filtro seleccionado.
  const [estadoFiltro, setEstadoFiltro] = useState('TODOS')

  // Consultamos los pedidos, aplicando el filtro seleccionado.
  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['admin-pedidos', estadoFiltro],
    queryFn: () =>
      listarPedidos({
        skip: 0,
        limit: 100,
        ...(estadoFiltro !== 'TODOS' && {
          estado: estadoFiltro as EstadoPedido,
        }),
      }),
  })

  // Cambia el estado de un pedido desde el panel administrativo.
  const mutation = useMutation({
    mutationFn: ({
      id,
      estado,
    }: {
      id: number
      estado: EstadoPedido
    }) => cambiarEstadoPedido(id, estado),

    onSuccess: () => {
      // Actualizamos los listados después de cambiar un estado.
      queryClient.invalidateQueries({
        queryKey: ['admin-pedidos'],
      })

      queryClient.invalidateQueries({
        queryKey: ['mis-pedidos'],
      })
    },
  })

  const pedidos = data?.items ?? []

  // Extraemos los errores devueltos por FastAPI.
  const mensajeError = axios.isAxiosError(error)
    ? error.response?.data?.detail
    : null

  const mensajeMutation = axios.isAxiosError(mutation.error)
    ? mutation.error.response?.data?.detail
    : null

  if (isLoading) {
    return (
      <main className="p-6">
        <p>Cargando pedidos...</p>
      </main>
    )
  }

  if (isError) {
    return (
      <main className="p-6">
        <h1 className="mb-4 text-2xl font-bold">
          Administración de pedidos
        </h1>

        <p className="text-red-600">
          {typeof mensajeError === 'string'
            ? mensajeError
            : 'No se pudieron cargar los pedidos.'}
        </p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-food-background p-6">
      <div className="mx-auto max-w-6xl">

        <h1 className="mb-2 text-3xl font-bold">
          Administración de pedidos
        </h1>

        <p className="mb-6 text-food-muted">
          Consultá y administrá los pedidos de los clientes.
        </p>

        {/* Filtro por estado */}
        <div className="mb-6 max-w-xs">
          <label
            htmlFor="estadoFiltro"
            className="mb-2 block font-medium"
          >
            Filtrar por estado
          </label>

          <select
            id="estadoFiltro"
            value={estadoFiltro}
            onChange={(event) => setEstadoFiltro(event.target.value)}
            className="w-full rounded-lg border border-food-border bg-food-white p-3"
          >
            <option value="TODOS">Todos los pedidos</option>
            <option value="PENDIENTE">Pendientes</option>
            <option value="EN_PREPARACION">En preparación</option>
            <option value="ENTREGADO">Entregados</option>
            <option value="CANCELADO">Cancelados</option>
          </select>
        </div>

        {/* Error al modificar un pedido */}
        {mutation.isError && (
          <p className="mb-4 rounded-lg bg-red-100 p-3 text-red-700">
            {typeof mensajeMutation === 'string'
              ? mensajeMutation
              : 'No se pudo modificar el pedido.'}
          </p>
        )}

        {/* Listado de pedidos */}
        {pedidos.length === 0 ? (
          <section className="rounded-xl border bg-food-white p-8 text-center">
            <p className="text-food-muted">
              No hay pedidos para mostrar.
            </p>
          </section>
        ) : (
          <div className="space-y-5">
            {pedidos.map((pedido) => (
              <article
                key={pedido.id}
                className="rounded-xl border bg-food-white p-5"
              >
                {/* Encabezado */}
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-bold">
                      Pedido #{pedido.id}
                    </h2>

                    <p className="text-sm text-food-muted">
                      Cliente ID: {pedido.usuario_id}
                    </p>

                    <p className="text-sm text-food-muted">
                      {new Date(pedido.created_at).toLocaleString('es-AR')}
                    </p>
                  </div>

                  <span className="rounded-full bg-food-background px-3 py-2 text-sm font-semibold">
                    {nombreEstado(pedido.estado)}
                  </span>
                </div>

                {/* Información de entrega */}
                <div className="mb-4 grid gap-2 text-sm sm:grid-cols-2">
                  <p>
                    <strong>Forma de pago:</strong>{' '}
                    {pedido.forma_pago === 'EFECTIVO'
                      ? 'Efectivo'
                      : 'Transferencia'}
                  </p>

                  <p>
                    <strong>Dirección:</strong>{' '}
                    {pedido.direccion_entrega}
                  </p>
                </div>

                {pedido.notas && (
                  <p className="mb-4 text-sm text-food-muted">
                    <strong>Notas:</strong> {pedido.notas}
                  </p>
                )}

                {/* Productos */}
                <div className="space-y-3 border-t py-4">
                  {pedido.items.map((item, index) => (
                    <div
                      key={`${pedido.id}-${item.producto_id}-${index}`}
                      className="flex justify-between gap-3 text-sm"
                    >
                      <div>
                        <p className="font-medium">
                          {item.nombre_producto}
                        </p>

                        <p className="text-food-muted">
                          {item.cantidad} x{' '}
                          {formatoPrecio(item.precio_unitario)}
                        </p>
                      </div>

                      <p className="font-semibold">
                        {formatoPrecio(item.subtotal)}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Total y acciones administrativas */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-t pt-4">
                  <p className="text-lg font-bold">
                    Total: {formatoPrecio(pedido.total)}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {pedido.estado === 'PENDIENTE' && (
                      <>
                        <button
                          type="button"
                          disabled={mutation.isPending}
                          onClick={() =>
                            mutation.mutate({
                              id: pedido.id,
                              estado: 'EN_PREPARACION',
                            })
                          }
                          className="rounded-lg bg-food-green px-4 py-2 font-semibold text-white hover:bg-food-green-light disabled:opacity-50"
                        >
                          Preparar pedido
                        </button>

                        <button
                          type="button"
                          disabled={mutation.isPending}
                          onClick={() =>
                            mutation.mutate({
                              id: pedido.id,
                              estado: 'CANCELADO',
                            })
                          }
                          className="rounded-lg border border-red-600 px-4 py-2 font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                        >
                          Cancelar
                        </button>
                      </>
                    )}

                    {pedido.estado === 'EN_PREPARACION' && (
                      <>
                        <button
                          type="button"
                          disabled={mutation.isPending}
                          onClick={() =>
                            mutation.mutate({
                              id: pedido.id,
                              estado: 'ENTREGADO',
                            })
                          }
                          className="rounded-lg bg-food-green px-4 py-2 font-semibold text-white hover:bg-food-green-light disabled:opacity-50"
                        >
                          Marcar entregado
                        </button>

                        <button
                          type="button"
                          disabled={mutation.isPending}
                          onClick={() =>
                            mutation.mutate({
                              id: pedido.id,
                              estado: 'CANCELADO',
                            })
                          }
                          className="rounded-lg border border-red-600 px-4 py-2 font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                        >
                          Cancelar
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
