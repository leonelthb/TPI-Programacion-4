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
  usuarioId: number | null
  carritosPorUsuario: Record<string, CartItem[]>

  activarUsuario: (usuarioId: number | null) => void
  agregar: (producto: Producto, cantidad?: number) => void
  quitar: (productoId: number) => void
  cambiarCantidad: (productoId: number, cantidad: number) => void
  vaciar: () => void
  total: () => number
}

function guardarItems(state: CartState, items: CartItem[]) {
  if (state.usuarioId === null) return { items }

  return {
    items,
    carritosPorUsuario: {
      ...state.carritosPorUsuario,
      [String(state.usuarioId)]: items,
    },
  }
}

// Creamos el store global con un carrito independiente para cada cuenta.
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      usuarioId: null,
      carritosPorUsuario: {},

      activarUsuario: (usuarioId) => {
        set((state) => {
          if (state.usuarioId === usuarioId) return state

          const carritosPorUsuario = { ...state.carritosPorUsuario }

          if (state.usuarioId !== null) {
            carritosPorUsuario[String(state.usuarioId)] = state.items
          }

          return {
            usuarioId,
            items:
              usuarioId === null
                ? []
                : carritosPorUsuario[String(usuarioId)] ?? [],
            carritosPorUsuario,
          }
        })
      },

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

          const items = existente
            ? state.items.map((item) =>
                item.producto_id === producto.id
                  ? {
                      ...item,
                      stock_disponible: producto.stock,
                      cantidad: Math.min(
                        item.cantidad + cantidad,
                        producto.stock,
                      ),
                    }
                  : item,
              )
            : [
                ...state.items,
                {
                  producto_id: producto.id,
                  nombre: producto.nombre,
                  precio_unitario: producto.precio_base,
                  cantidad: Math.min(cantidad, producto.stock),
                  stock_disponible: producto.stock,
                },
              ]

          return guardarItems(state, items)
        })
      },

      quitar: (productoId) => {
        set((state) =>
          guardarItems(
            state,
            state.items.filter((item) => item.producto_id !== productoId),
          ),
        )
      },

      cambiarCantidad: (productoId, cantidad) => {
        if (cantidad <= 0) {
          get().quitar(productoId)
          return
        }

        set((state) => {
          const items = state.items.map((item) => {
            if (item.producto_id !== productoId) return item

            const stockMaximo = item.stock_disponible ?? item.cantidad
            return { ...item, cantidad: Math.min(cantidad, stockMaximo) }
          })

          return guardarItems(state, items)
        })
      },

      vaciar: () => {
        set((state) => guardarItems(state, []))
      },

      total: () =>
        get().items.reduce(
          (acumulado, item) =>
            acumulado + item.precio_unitario * item.cantidad,
          0,
        ),
    }),
    {
      name: 'foodstore-carts-by-user',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        items: state.items,
        usuarioId: state.usuarioId,
        carritosPorUsuario: state.carritosPorUsuario,
      }),
    },
  ),
)
