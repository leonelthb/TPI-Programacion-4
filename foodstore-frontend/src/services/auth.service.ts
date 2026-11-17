import api from './api'

import type {
  Usuario,
  UsuarioCreate,
} from '../types/usuario'

// Respuesta estándar de las operaciones de autenticación.
interface AuthMessage {
  message: string
}

// Registrar un usuario nuevo.
export async function register(
  data: UsuarioCreate,
): Promise<Usuario> {
  const response = await api.post<Usuario>(
    '/auth/register',
    data,
  )

  return response.data
}

// Iniciar sesión.
export async function login(
  username: string,
  password: string,
): Promise<AuthMessage> {

  // FastAPI recibe el login como formulario OAuth2,
  // no como un objeto JSON.
  const formData = new URLSearchParams()

  formData.append('username', username)
  formData.append('password', password)

  const response = await api.post<AuthMessage>(
    '/auth/login',
    formData,
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    },
  )

  return response.data
}

// Cerrar sesión eliminando la cookie HttpOnly.
export async function logout(): Promise<AuthMessage> {
  const response = await api.post<AuthMessage>('/auth/logout')

  return response.data
}

// Obtener el perfil del usuario autenticado.
export async function getCurrentUser(): Promise<Usuario> {
  const response = await api.get<Usuario>('/auth/me')

  return response.data
}