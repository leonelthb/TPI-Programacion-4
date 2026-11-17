
import { useState, type FormEvent } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'

import { useCartStore } from '../store/cartStore'
import { crearPedido } from '../services/pedido.service'
import type { FormaPago } from '../types/pedido'

// Formatea importes como moneda argentina.
function formatoPrecio(precio: number) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 2,
  }).format(precio)
}

export default function CheckoutPage() {
  const navigate = useNavigate()

  // Datos y operaciones del carrito.
  const items = useCartStore((state) => state.items)
  const total = useCartStore((state) => state.total)
  const vaciar = useCartStore((state) => state.vaciar)

  // Datos del formulario.
  const [direccion, setDireccion] = useState('')
  const [formaPago, setFormaPago] =
    useState<FormaPago>('EFECTIVO')
  const [notas, setNotas] = useState('')

  // Envía el pedido al backend.
  const mutation = useMutation({
    mutationFn: crearPedido,

    onSuccess: () => {
      // Vaciamos el carrito solamente si el pedido fue confirmado.
      vaciar()

      // Redirigimos al usuario a sus pedidos.
      navigate('/mis-pedidos')
    },
  })

  // Evitamos confirmar una compra sin productos.
  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-food-background px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-3xl rounded-3xl border border-food-border bg-food-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-food-green">
            Tu carrito está vacío
          </h1>

          <p className="mt-3 text-food-muted">
            Agregá productos antes de confirmar tu pedido.
          </p>

          <Link
            to="/productos"
            className="mt-6 inline-flex rounded-xl bg-food-orange px-6 py-3 font-semibold text-white transition hover:bg-food-green-light"
          >
            Volver al catálogo
          </Link>
        </div>
      </main>
    )
  }

  // Procesa el formulario y prepara los datos para la API.
  function manejarEnvio(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    // Validación adicional de la dirección.
    const direccionLimpia = direccion.trim()

    if (direccionLimpia.length < 5 || direccionLimpia.length > 200) {
      return
    }

    // Enviamos únicamente los identificadores y cantidades.
    // Los precios serán calculados nuevamente por el backend.
    const pedido = {
      items: items.map((item) => ({
        producto_id: item.producto_id,
        cantidad: item.cantidad,
      })),
      forma_pago: formaPago,
      direccion_entrega: direccionLimpia,
      notas: notas.trim() || null,
    }

    mutation.mutate(pedido)
  }

  // Extrae el mensaje de error devuelto por FastAPI.
  const mensajeError = axios.isAxiosError(mutation.error)
    ? mutation.error.response?.data?.detail
    : null

  return (
    <main className="min-h-screen bg-food-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">

        {/* Encabezado */}
        <header className="mb-8 overflow-hidden rounded-3xl bg-food-green px-6 py-8 text-white shadow-lg sm:px-10">
          <p className="text-sm font-bold uppercase tracking-widest text-food-orange">
            FOOD STORE
          </p>

          <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">
            Confirmá tu pedido
          </h1>

          <p className="mt-3 max-w-xl text-white/75">
            Completá los datos de entrega y elegí cómo querés pagar.
          </p>

          <div className="mt-5 h-1 w-20 rounded-full bg-food-orange" />
        </header>

        <form
          onSubmit={manejarEnvio}
          className="grid grid-cols-1 items-start gap-6 lg:grid-cols-5"
        >

          {/* Datos de entrega y pago */}
          <section className="rounded-2xl border border-food-border bg-food-white p-6 shadow-sm lg:col-span-3">
            <div className="mb-6">
              <p className="text-sm font-bold uppercase tracking-wider text-food-orange">
                Información
              </p>

              <h2 className="mt-1 text-2xl font-bold text-food-green">
                Datos del pedido
              </h2>

              <p className="mt-2 text-sm text-food-muted">
                Indicá dónde recibirás tu compra y seleccioná la forma de pago.
              </p>
            </div>

            <div className="space-y-6">

              {/* Dirección */}
              <div>
                <label
                  htmlFor="direccion"
                  className="mb-2 block text-sm font-semibold text-food-green"
                >
                  Dirección de entrega
                </label>

                <input
                  id="direccion"
                  type="text"
                  value={direccion}
                  onChange={(event) =>
                    setDireccion(event.target.value)
                  }
                  minLength={5}
                  maxLength={200}
                  required
                  placeholder="Calle, número, barrio y localidad"
                  className="w-full rounded-xl border border-food-border bg-food-background px-4 py-3 outline-none transition focus:border-food-orange focus:ring-2 focus:ring-food-orange/20"
                />

                <p className="mt-2 text-xs text-food-muted">
                  Ingresá entre 5 y 200 caracteres.
                </p>
              </div>

              {/* Forma de pago */}
              <div>
                <label
                  htmlFor="formaPago"
                  className="mb-2 block text-sm font-semibold text-food-green"
                >
                  Forma de pago
                </label>

                <select
                  id="formaPago"
                  value={formaPago}
                  onChange={(event) =>
                    setFormaPago(event.target.value as FormaPago)
                  }
                  className="w-full rounded-xl border border-food-border bg-food-background px-4 py-3 outline-none transition focus:border-food-orange focus:ring-2 focus:ring-food-orange/20"
                >
                  <option value="EFECTIVO">
                    Efectivo
                  </option>

                  <option value="TRANSFERENCIA">
                    Transferencia
                  </option>
                </select>

                <p className="mt-2 text-xs text-food-muted">
                  El pago se realiza de manera manual. No se utiliza una pasarela de pago.
                </p>
              </div>

              {/* Notas */}
              <div>
                <label
                  htmlFor="notas"
                  className="mb-2 block text-sm font-semibold text-food-green"
                >
                  Notas adicionales
                  <span className="ml-2 font-normal text-food-muted">
                    (opcional)
                  </span>
                </label>

                <textarea
                  id="notas"
                  value={notas}
                  onChange={(event) =>
                    setNotas(event.target.value)
                  }
                  rows={4}
                  placeholder="Indicaciones para preparar o entregar tu pedido..."
                  className="w-full resize-y rounded-xl border border-food-border bg-food-background px-4 py-3 outline-none transition focus:border-food-orange focus:ring-2 focus:ring-food-orange/20"
                />
              </div>
            </div>

            {/* Error devuelto por el backend */}
            {mutation.isError && (
              <div
                role="alert"
                className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
              >
                <p className="font-semibold">
                  No se pudo confirmar el pedido.
                </p>

                <p className="mt-1">
                  {typeof mensajeError === 'string'
                    ? mensajeError
                    : 'Ocurrió un error. Revisá los datos e intentá nuevamente.'}
                </p>
              </div>
            )}

            {/* Confirmar */}
            <button
              type="submit"
              disabled={mutation.isPending || items.length === 0}
              className="mt-8 w-full rounded-xl bg-food-orange px-5 py-4 font-bold text-white shadow-sm transition hover:bg-food-green-light disabled:cursor-not-allowed disabled:opacity-50"
            >
              {mutation.isPending
                ? 'Confirmando pedido...'
                : 'Confirmar pedido'}
            </button>

            <Link
              to="/carrito"
              className="mt-4 block text-center text-sm font-semibold text-food-green transition hover:text-food-orange-dark"
            >
              Volver al carrito
            </Link>
          </section>

          {/* Resumen de compra */}
          <aside className="rounded-2xl border border-food-border bg-food-white p-6 shadow-sm lg:sticky lg:top-28 lg:col-span-2">
            <p className="text-sm font-bold uppercase tracking-wider text-food-orange">
              Tu compra
            </p>

            <h2 className="mt-1 text-xl font-bold text-food-green">
              Resumen del pedido
            </h2>

            <p className="mt-2 text-sm text-food-muted">
              Productos seleccionados: {items.length}
            </p>

            <div className="mt-6 max-h-80 space-y-4 overflow-y-auto border-b border-food-border pb-5">
              {items.map((item) => (
                <div
                  key={item.producto_id}
                  className="flex justify-between gap-4"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-food-green">
                      {item.nombre}
                    </p>

                    <p className="mt-1 text-sm text-food-muted">
                      {item.cantidad} x {formatoPrecio(item.precio_unitario)}
                    </p>
                  </div>

                  <p className="shrink-0 font-semibold text-food-text">
                    {formatoPrecio(
                      item.precio_unitario * item.cantidad,
                    )}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-5 flex items-center justify-between gap-3">
              <span className="font-semibold text-food-green">
                Total
              </span>

              <span className="text-2xl font-bold text-food-orange-dark">
                {formatoPrecio(total())}
              </span>
            </div>

            <div className="mt-6 rounded-xl bg-food-cream p-4">
              <p className="text-sm font-semibold text-food-green">
                Antes de confirmar
              </p>

              <p className="mt-2 text-xs leading-relaxed text-food-muted">
                El backend verificará nuevamente los productos,
                las cantidades, el stock y los precios antes de
                registrar el pedido.
              </p>
            </div>
          </aside>
        </form>

        {/* Pie */}
        <footer className="mt-12 border-t border-food-border py-6 text-center">
          <p className="text-sm text-food-muted">
            Food Store · Gracias por elegirnos.
          </p>
        </footer>
      </div>
    </main>
  )
}
