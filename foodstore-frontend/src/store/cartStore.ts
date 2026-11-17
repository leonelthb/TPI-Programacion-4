import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

import type { Producto } from '../types/producto'

// Representa un producto dentro del carrito.
export interface CartItem {
  producto_id: number
  nombre: string
  precio_unitario: number
  cantidad: number
  stock_disponible: number
}

// Define el estado y las operaciones del carrito.
interface CartState {
  items: CartItem[]

  agregar: (producto: Producto, cantidad?: number) => void
  quitar: (productoId: number) => void
  cambiarCantidad: (productoId: number, cantidad: number) => void
  vaciar: () => void
  total: () => number
}

// Creamos el store global del carrito.
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      // Estado inicial.
      items: [],

      agregar: (producto, cantidad = 1) => {
  if (
    cantidad < 1 ||
    !producto.activo ||
    !producto.disponible ||
    producto.stock <= 0
  ) {
    return
  }

  set((state) => {
    const existente = state.items.find(
      (item) => item.producto_id === producto.id,
    )

    if (existente) {
      return {
        items: state.items.map((item) =>
          item.producto_id === producto.id
            ? {
                ...item,
                // Actualiza el stock conocido y limita la cantidad.
                stock_disponible: producto.stock,
                cantidad: Math.min(
                  item.cantidad + cantidad,
                  producto.stock,
                ),
              }
            : item,
        ),
      }
    }

    return {
      items: [
        ...state.items,
        {
          producto_id: producto.id,
          nombre: producto.nombre,
          precio_unitario: producto.precio_base,
          cantidad: Math.min(cantidad, producto.stock),
          stock_disponible: producto.stock,
        },
      ],
    }
  })
},
      // Elimina un producto del carrito.
      quitar: (productoId) => {
        set((state) => ({
          items: state.items.filter(
            (item) => item.producto_id !== productoId,
          ),
        }))
      },

      // Modifica la cantidad de un producto.
        cambiarCantidad: (productoId, cantidad) => {
          if (cantidad <= 0) {
            get().quitar(productoId)
            return
          }

          set((state) => ({
            items: state.items.map((item) => {
              if (item.producto_id !== productoId) {
                return item
              }

              // Si el carrito es anterior a este cambio, usamos su cantidad
              // como límite conservador hasta actualizar el producto.
              const stockMaximo =
                item.stock_disponible ?? item.cantidad

              return {
                ...item,
                cantidad: Math.min(cantidad, stockMaximo),
              }
            }),
          }))
        },

      // Vacía completamente el carrito.
      vaciar: () => {
        set({ items: [] })
      },

      // Calcula el importe total del carrito.
      total: () => {
        return get().items.reduce(
          (acumulado, item) =>
            acumulado + item.precio_unitario * item.cantidad,
          0,
        )
      },
    }),

    {
      name: 'foodstore-cart',
      storage: createJSONStorage(() => localStorage),
    },
  ),
)