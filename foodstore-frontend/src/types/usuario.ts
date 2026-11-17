// Información pública de un usuario devuelta por FastAPI.
export interface Usuario {
  id: number
  username: string
  full_name: string
  email: string
  role: 'admin' | 'user'
  disabled: boolean
  created_at: string
}

// Datos necesarios para registrar un usuario.
export interface UsuarioCreate {
  username: string
  full_name: string
  email: string
  password: string
}