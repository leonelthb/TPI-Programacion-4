// Categoría recibida desde el backend.
export interface Categoria {
  id: number
  nombre: string
  descripcion: string | null
  activo: boolean
}

// Datos para crear una categoría.
export interface CategoriaCreate {
  nombre: string
  descripcion?: string | null
}

// Datos para actualizar una categoría.
export interface CategoriaUpdate {
  nombre?: string
  descripcion?: string | null
}