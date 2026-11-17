import api from './api'
import type { Usuario } from '../types/usuario'

// Datos para activar o desactivar una cuenta.
interface UsuarioEstadoUpdate {
  disabled: boolean
}

// Obtener todos los usuarios.
// Esta operación requiere permisos de administrador.
export async function listarUsuarios(): Promise<Usuario[]> {
  const response = await api.get<Usuario[]>('/usuarios/')

  return response.data
}

// Obtener un usuario por su ID.
export async function obtenerUsuario(
  id: number,
): Promise<Usuario> {
  const response = await api.get<Usuario>(`/usuarios/${id}`)

  return response.data
}

// Activar o desactivar una cuenta.
export async function actualizarEstadoUsuario(
  id: number,
  disabled: boolean,
): Promise<Usuario> {
  const data: UsuarioEstadoUpdate = { disabled }

  const response = await api.patch<Usuario>(
    `/usuarios/${id}/estado`,
    data,
  )

  return response.data
}