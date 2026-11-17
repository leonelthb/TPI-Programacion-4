
import { useQuery, keepPreviousData } from '@tanstack/react-query'

import {
  listarProductos,
  type ProductoFiltros,
} from '../services/producto.service'

export function useProductos(filtros?: ProductoFiltros) {
  return useQuery({
    queryKey: ['productos', filtros],
    queryFn: () => listarProductos(filtros),

    // Conserva los resultados anteriores mientras busca los nuevos.
    placeholderData: keepPreviousData,
  })
}
