import api from './api'

import type {
  Pedido,
  PedidoCreate,
  PedidosPaginados,
  EstadoPedido,
  CambioEstado,
  ResumenPedidos,
} from '../types/pedido'

// Parámetros para filtrar y paginar pedidos.
interface PedidoFiltros {
  skip?: number
  limit?: number
  estado?: EstadoPedido
}

// Crear un pedido desde el carrito.
export async function crearPedido(
  data: PedidoCreate,
): Promise<Pedido> {
  const response = await api.post<Pedido>(
    '/pedidos/',
    data,
  )

  return response.data
}

// Listar pedidos propios o todos si el usuario es admin.
export async function listarPedidos(
  filtros?: PedidoFiltros,
): Promise<PedidosPaginados> {
  const response = await api.get<PedidosPaginados>(
    '/pedidos/',
    { params: filtros },
  )

  return response.data
}

// Obtener el detalle de un pedido.
export async function obtenerPedido(
  id: number,
): Promise<Pedido> {
  const response = await api.get<Pedido>(
    `/pedidos/${id}`,
  )

  return response.data
}

// Cambiar el estado de un pedido (operación administrativa).
export async function cambiarEstadoPedido(
  id: number,
  estado: EstadoPedido,
): Promise<Pedido> {
  const data: CambioEstado = { estado }

  const response = await api.patch<Pedido>(
    `/pedidos/${id}/estado`,
    data,
  )

  return response.data
}

// Cancelar un pedido propio que todavía está pendiente.
export async function cancelarPedido(
  id: number,
): Promise<Pedido> {
  const response = await api.patch<Pedido>(
    `/pedidos/${id}/cancelar`,
  )

  return response.data
}

// Obtener los indicadores del panel administrativo.
export async function obtenerResumenPedidos(): Promise<ResumenPedidos> {
  const response = await api.get<ResumenPedidos>(
    '/pedidos/resumen',
  )

  return response.data
}