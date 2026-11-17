
import { useQuery } from '@tanstack/react-query'

import {
  listarCategorias,
  listarCategoriasAdmin,
} from '../services/categoria.service'

// Consulta las categorías activas para el catálogo público.
export function useCategorias() {
  return useQuery({
    queryKey: ['categorias'],
    queryFn: listarCategorias,
  })
}

// Consulta categorías para el panel administrativo.
// activo=true: activas.
// activo=false: inactivas.
// activo=undefined: todas.
export function useCategoriasAdmin(activo?: boolean) {
  return useQuery({
    queryKey: ['admin-categorias', activo],
    queryFn: () =>
      listarCategoriasAdmin(
        activo === undefined ? undefined : { activo }
      ),
  })
}
