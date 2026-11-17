import api from './api'

import type {
  Categoria,
  CategoriaCreate,
  CategoriaUpdate,
} from '../types/categoria'

// Obtener todas las categorías activas.
export async function listarCategorias(): Promise<Categoria[]> {
  const response = await api.get<Categoria[]>('/categorias/')

  return response.data
}

// Obtener una categoría por su ID.
export async function obtenerCategoria(
  id: number,
): Promise<Categoria> {
  const response = await api.get<Categoria>(`/categorias/${id}`)

  return response.data
}

// Crear una categoría.
export async function crearCategoria(
  data: CategoriaCreate,
): Promise<Categoria> {
  const response = await api.post<Categoria>(
    '/categorias/',
    data,
  )

  return response.data
}

// Actualizar una categoría.
export async function actualizarCategoria(
  id: number,
  data: CategoriaUpdate,
): Promise<Categoria> {
  const response = await api.put<Categoria>(
    `/categorias/${id}`,
    data,
  )

  return response.data
}

// Dar de baja lógicamente una categoría.
export async function eliminarCategoria(
  id: number,
): Promise<void> {
  await api.delete(`/categorias/${id}`)
}


// Filtros disponibles para el listado administrativo.
export interface CategoriaFiltrosAdmin {
  activo?: boolean
}

// Lista categorías para el panel de administración.
// Si no se envía activo, devuelve todas.
export async function listarCategoriasAdmin(
  filtros?: CategoriaFiltrosAdmin
): Promise<Categoria[]> {
  const { data } = await api.get<Categoria[]>(
    '/categorias/admin/listado',
    { params: filtros }
  )

  return data
}




