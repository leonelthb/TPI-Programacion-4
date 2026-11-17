import { useForm } from '@tanstack/react-form'
import { useNavigate, Link } from 'react-router-dom'

import { register } from '../services/auth.service'

export function RegisterPage() {
  const navigate = useNavigate()

  const form = useForm({
    defaultValues: {
      username: '',
      full_name: '',
      email: '',
      password: '',
    },

    onSubmit: async ({ value }) => {
      await register(value)
      navigate('/login')
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
          Crear cuenta
        </h1>

        <form.Field name="username">
          {(field) => (
            <div>
              <label htmlFor="username">Usuario</label>
              <input
                id="username"
                className="w-full rounded-lg border p-3"
                value={field.state.value}
                onChange={(event) => field.handleChange(event.target.value)}
                required
              />
            </div>
          )}
        </form.Field>

        <form.Field name="full_name">
          {(field) => (
            <div>
              <label htmlFor="full_name">Nombre completo</label>
              <input
                id="full_name"
                className="w-full rounded-lg border p-3"
                value={field.state.value}
                onChange={(event) => field.handleChange(event.target.value)}
                required
              />
            </div>
          )}
        </form.Field>

        <form.Field name="email">
          {(field) => (
            <div>
              <label htmlFor="email">Correo electrónico</label>
              <input
                id="email"
                type="email"
                className="w-full rounded-lg border p-3"
                value={field.state.value}
                onChange={(event) => field.handleChange(event.target.value)}
                required
              />
            </div>
          )}
        </form.Field>

        <form.Field name="password">
          {(field) => (
            <div>
              <label htmlFor="password">Contraseña</label>
              <input
                id="password"
                type="password"
                minLength={8}
                className="w-full rounded-lg border p-3"
                value={field.state.value}
                onChange={(event) => field.handleChange(event.target.value)}
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
              {isSubmitting ? 'Registrando...' : 'Registrarme'}
            </button>
          )}
        </form.Subscribe>

        <p className="text-center text-sm">
          ¿Ya tenés una cuenta?{' '}
          <Link to="/login" className="font-semibold text-food-orange-dark">
            Iniciar sesión
          </Link>
        </p>
      </form>
    </main>
  )
}