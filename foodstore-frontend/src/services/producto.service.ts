import api from './api'

import type {
  Producto,
  ProductoCreate,
  ProductoUpdate,
  ProductoStockUpdate,
  ProductosPaginados,
} from '../types/producto'

// Parámetros disponibles para filtrar y paginar productos.
export interface ProductoFiltros {
  skip?: number
  limit?: number
  search?: string
  categoria_id?: number
  disponible?: boolean
}

// Filtros específicos del listado administrativo.
export interface ProductoFiltrosAdmin extends ProductoFiltros {
  activo?: boolean
}


// Obtener el listado paginado de productos.
export async function listarProductos(
  filtros?: ProductoFiltros,
): Promise<ProductosPaginados> {
  const response = await api.get<ProductosPaginados>(
    '/productos/',
    { params: filtros },
  )

  return response.data
}

// Lista productos para administración, incluyendo filtros de estado.
export async function listarProductosAdmin(
  filtros?: ProductoFiltrosAdmin
): Promise<ProductosPaginados> {
  const response = await api.get<ProductosPaginados>(
    '/productos/admin/listado',
    { params: filtros }
  )

  return response.data
}

// Obtener el detalle de un producto.
export async function obtenerProducto(
  id: number,
): Promise<Producto> {
  const response = await api.get<Producto>(
    `/productos/${id}`,
  )

  return response.data
}

// Crear un producto nuevo.
export async function crearProducto(
  data: ProductoCreate,
): Promise<Producto> {
  const response = await api.post<Producto>(
    '/productos/',
    data,
  )

  return response.data
}

// Actualizar los datos de un producto.
export async function actualizarProducto(
  id: number,
  data: ProductoUpdate,
): Promise<Producto> {
  const response = await api.put<Producto>(
    `/productos/${id}`,
    data,
  )

  return response.data
}

// Actualizar el stock y la disponibilidad.
export async function actualizarStockProducto(
  id: number,
  data: ProductoStockUpdate,
): Promise<Producto> {
  const response = await api.patch<Producto>(
    `/productos/${id}/stock`,
    data,
  )

  return response.data
}

// Dar de baja lógicamente un producto.
export async function eliminarProducto(
  id: number,
): Promise<void> {
  await api.delete(`/productos/${id}`)
}

