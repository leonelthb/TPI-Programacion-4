
import { useQuery } from '@tanstack/react-query'

import { listarUsuarios } from '../services/usuario.service'

// Consulta todos los usuarios para el panel administrativo.
export function useUsuarios() {
  return useQuery({
    queryKey: ['admin-usuarios'],
    queryFn: listarUsuarios,
  })
}

