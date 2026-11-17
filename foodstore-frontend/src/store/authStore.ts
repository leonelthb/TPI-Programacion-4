import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

import type { Usuario } from '../types/usuario'
import {
  login as loginService,
  logout as logoutService,
  getCurrentUser,
} from '../services/auth.service'

// Estado y operaciones de autenticación.
interface AuthState {
  usuario: Usuario | null
  cargando: boolean

  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
  checkSession: () => Promise<void>
}

// Store global de autenticación.
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      usuario: null,
      cargando: true,

      // Inicia sesión y obtiene el perfil del usuario.
      login: async (username, password) => {
        set({ cargando: true })

        try {
          await loginService(username, password)

          const usuario = await getCurrentUser()

          set({ usuario })
        } catch (error) {
          set({ usuario: null })
          throw error
        } finally {
          set({ cargando: false })
        }
      },

      // Cierra la sesión en el backend y limpia el estado local.
      logout: async () => {
        try {
          await logoutService()
        } finally {
          set({ usuario: null })
        }
      },

      // Comprueba si existe una sesión válida al iniciar la aplicación.
      checkSession: async () => {
        set({ cargando: true })

        try {
          const usuario = await getCurrentUser()

          set({ usuario })
        } catch {
          set({ usuario: null })
        } finally {
          set({ cargando: false })
        }
      },
    }),

    {
      name: 'foodstore-auth',
      storage: createJSONStorage(() => localStorage),

      // Persistimos únicamente los datos públicos del usuario.
      partialize: (state) => ({
        usuario: state.usuario,
      }),
    },
  ),
)