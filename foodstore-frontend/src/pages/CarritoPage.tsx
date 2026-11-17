
import { Link } from 'react-router-dom'
import { useCartStore } from '../store/cartStore'

// Formatea importes en pesos argentinos.
function formatoPrecio(precio: number) {
  return precio.toLocaleString('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 2,
  })
}

export function CarritoPage() {
  // Recuperamos los datos y operaciones del carrito.
  const items = useCartStore((state) => state.items)
  const quitar = useCartStore((state) => state.quitar)
  const cambiarCantidad = useCartStore(
    (state) => state.cambiarCantidad,
  )
  const vaciar = useCartStore((state) => state.vaciar)
  const total = useCartStore((state) => state.total)

  const cantidadProductos = items.reduce(
    (cantidad, item) => cantidad + item.cantidad,
    0,
  )

  return (
    <main className="min-h-screen bg-food-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">

        {/* Encabezado */}
        <header className="mb-8">
          <p className="mb-2 text-sm font-bold uppercase tracking-widest text-food-orange">
            FOOD STORE
          </p>

          <h1 className="text-3xl font-bold text-food-green sm:text-4xl">
            Mi carrito
          </h1>

          <p className="mt-2 text-food-muted">
            Revisá tu selección antes de confirmar el pedido.
          </p>
        </header>

        {/* Carrito vacío */}
        {items.length === 0 ? (
          <section className="rounded-3xl border border-food-border bg-food-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-food-cream">
              <span className="text-3xl font-bold text-food-green">
                FS
              </span>
            </div>

            <h2 className="text-2xl font-bold text-food-green">
              Tu carrito está vacío
            </h2>

            <p className="mx-auto mt-3 max-w-md text-food-muted">
              Todavía no agregaste productos. Explorá nuestro menú y
              encontrá algo rico para disfrutar.
            </p>

            <Link
              to="/productos"
              className="mt-7 inline-flex rounded-xl bg-food-orange px-6 py-3 font-semibold text-white transition hover:bg-food-green-light"
            >
              Explorar el menú
            </Link>
          </section>
        ) : (
          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">

            {/* Listado de productos */}
            <section className="space-y-4 lg:col-span-2">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-food-green">
                  Productos seleccionados
                </h2>

                <span className="rounded-full bg-food-cream px-3 py-1 text-sm font-semibold text-food-green">
                  {cantidadProductos} unidades
                </span>
              </div>

              {items.map((item) => (
                <article
                  key={item.producto_id}
                  className="rounded-2xl border border-food-border bg-food-white p-5 shadow-sm transition hover:shadow-md"
                >
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                    {/* Información del producto */}
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg font-bold text-food-green">
                        {item.nombre}
                      </h3>

                      <p className="mt-2 text-sm text-food-muted">
                        Precio unitario
                      </p>

                      <p className="font-semibold text-food-text">
                        {formatoPrecio(item.precio_unitario)}
                      </p>

                      <p className="mt-3 text-sm font-medium text-food-orange-dark">
                        Subtotal: {formatoPrecio(
                          item.precio_unitario * item.cantidad,
                        )}
                      </p>
                    </div>

                    {/* Controles de cantidad */}
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-3 rounded-xl border border-food-border bg-food-background p-1">
                        <button
                          type="button"
                          aria-label={`Disminuir cantidad de ${item.nombre}`}
                          onClick={() =>
                            cambiarCantidad(
                              item.producto_id,
                              item.cantidad - 1,
                            )
                          }
                          className="flex h-9 w-9 items-center justify-center rounded-lg font-bold text-food-green transition hover:bg-food-cream"
                        >
                          -
                        </button>

                        <span className="min-w-6 text-center font-bold text-food-green">
                          {item.cantidad}
                        </span>

                        <button
                          type="button"
                          aria-label={`Aumentar cantidad de ${item.nombre}`}
                          onClick={() =>
                            cambiarCantidad(
                              item.producto_id,
                              item.cantidad + 1,
                            )
                          }
                          className="flex h-9 w-9 items-center justify-center rounded-lg bg-food-green font-bold text-white transition hover:bg-food-green-light"
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => quitar(item.producto_id)}
                        className="rounded-lg px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </article>
              ))}

              {/* Volver al catálogo */}
              <Link
                to="/productos"
                className="inline-flex items-center gap-2 pt-2 text-sm font-semibold text-food-green transition hover:text-food-orange-dark"
              >
                ← Seguir comprando
              </Link>
            </section>

            {/* Resumen de compra */}
            <aside className="rounded-2xl border border-food-border bg-food-white p-6 shadow-sm lg:sticky lg:top-28">
              <p className="text-sm font-bold uppercase tracking-wider text-food-orange">
                Tu pedido
              </p>

              <h2 className="mt-1 text-xl font-bold text-food-green">
                Resumen de compra
              </h2>

              <div className="mt-6 space-y-4 border-b border-food-border pb-5">
                <div className="flex justify-between gap-3 text-sm">
                  <span className="text-food-muted">
                    Productos
                  </span>

                  <span className="font-semibold text-food-text">
                    {items.length}
                  </span>
                </div>

                <div className="flex justify-between gap-3 text-sm">
                  <span className="text-food-muted">
                    Unidades
                  </span>

                  <span className="font-semibold text-food-text">
                    {cantidadProductos}
                  </span>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between gap-3">
                <span className="font-semibold text-food-green">
                  Total
                </span>

                <span className="text-2xl font-bold text-food-orange-dark">
                  {formatoPrecio(total())}
                </span>
              </div>

              <p className="mt-3 text-xs leading-relaxed text-food-muted">
                El importe final se calculará y verificará nuevamente
                al confirmar el pedido.
              </p>

              <Link
                to="/checkout"
                className="mt-7 block rounded-xl bg-food-orange px-5 py-4 text-center font-bold text-white shadow-sm transition hover:bg-food-green-light"
              >
                Finalizar compra
              </Link>

              <button
                type="button"
                onClick={() => {
                  const confirmar = window.confirm(
                    '¿Querés vaciar todos los productos del carrito?',
                  )

                  if (confirmar) {
                    vaciar()
                  }
                }}
                className="mt-3 w-full rounded-xl border border-food-border px-5 py-3 text-sm font-semibold text-food-muted transition hover:border-red-300 hover:bg-red-50 hover:text-red-600"
              >
                Vaciar carrito
              </button>
            </aside>
          </div>
        )}

        {/* Pie de página */}
        <footer className="mt-14 border-t border-food-border py-6 text-center">
          <p className="text-sm text-food-muted">
            Food Store · Gracias por elegirnos.
          </p>
        </footer>
      </div>
    </main>
  )
}
