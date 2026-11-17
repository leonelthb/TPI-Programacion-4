import type { Categoria } from './categoria'

// Producto recibido desde el backend.
export interface Producto {
  id: number
  nombre: string
  descripcion: string | null
  precio_base: number
  imagen_url: string | null
  stock: number
  disponible: boolean
  activo: boolean
  categoria: Categoria
}

// Datos necesarios para crear un producto.
export interface ProductoCreate {
  nombre: string
  descripcion?: string | null
  precio_base: number
  imagen_url?: string | null
  stock: number
  disponible: boolean
  categoria_id: number
}

// Datos para actualizar un producto.
export interface ProductoUpdate {
  nombre?: string
  descripcion?: string | null
  precio_base?: number
  imagen_url?: string | null
  stock?: number
  disponible?: boolean
  categoria_id?: number
}

// Datos para modificar el stock.
export interface ProductoStockUpdate {
  stock: number
  disponible: boolean
}


// Respuesta del listado paginado de productos.
export interface ProductosPaginados {
  total: number
  items: Producto[]
}