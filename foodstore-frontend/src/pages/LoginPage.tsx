
import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'

import { useAuthStore } from '../store/authStore'

export function LoginPage() {
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)

  // Guarda los errores para mostrarlos en pantalla.
  const [error, setError] = useState('')

  const form = useForm({
    defaultValues: {
      username: '',
      password: '',
    },

    onSubmit: async ({ value }) => {
      setError('')

      try {
        await login(value.username, value.password)
        navigate('/productos')
      } catch (err) {
        // Obtiene el mensaje enviado por FastAPI.
        if (axios.isAxiosError(err)) {
          setError(
            err.response?.data?.detail ||
              'No se pudo conectar con el servidor.',
          )
        } else {
          setError('Ocurrió un error inesperado.')
        }
      }
    },
  })

  return (
    <main className="flex min-h-screen items-center justify-center bg-food-background p-6">
      <form
        className="w-full max-w-md space-y-5 rounded-xl bg-food-white p-8 shadow"
        onSubmit={(event) => {
          event.preventDefault()
          event.stopPropagation()
          void form.handleSubmit()
        }}
      >
        <h1 className="text-center text-2xl font-bold">
          Iniciar sesión
        </h1>

        {/* Mensaje de error */}
        {error && (
          <p className="rounded-lg bg-red-100 p-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <form.Field name="username">
          {(field) => (
            <div className="space-y-2">
              <label htmlFor="username" className="block font-medium">
                Usuario
              </label>

              <input
                id="username"
                className="w-full rounded-lg border p-3"
                value={field.state.value}
                onChange={(event) =>
                  field.handleChange(event.target.value)
                }
                required
              />
            </div>
          )}
        </form.Field>

        <form.Field name="password">
          {(field) => (
            <div className="space-y-2">
              <label htmlFor="password" className="block font-medium">
                Contraseña
              </label>

              <input
                id="password"
                type="password"
                className="w-full rounded-lg border p-3"
                value={field.state.value}
                onChange={(event) =>
                  field.handleChange(event.target.value)
                }
                required
              />
            </div>
          )}
        </form.Field>

        <form.Subscribe selector={(state) => state.isSubmitting}>
          {(isSubmitting) => (
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-food-green p-3 font-semibold text-white hover:bg-food-green-light disabled:opacity-50"
            >
              {isSubmitting ? 'Ingresando...' : 'Ingresar'}
            </button>
          )}
        </form.Subscribe>

        <p className="text-center text-sm">
          ¿No tenés una cuenta?{' '}
          <Link to="/register" className="font-semibold text-food-orange-dark">
            Registrarme
          </Link>
        </p>
      </form>
    </main>
  )
}
