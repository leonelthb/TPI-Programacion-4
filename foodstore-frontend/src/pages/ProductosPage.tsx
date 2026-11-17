
import { useState } from 'react'

import { useCartStore } from '../store/cartStore'
import { useProductos } from '../hooks/useProductos'
import { useCategorias } from '../hooks/useCategorias'

const PRODUCTOS_POR_PAGINA = 4

// Formatea los precios en pesos argentinos.
function formatoPrecio(precio: number) {
  return precio.toLocaleString('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 2,
  })
}

export function ProductosPage() {
  const [busqueda, setBusqueda] = useState('')
  const [categoriaId, setCategoriaId] = useState('')
  const [pagina, setPagina] = useState(0)

  // Operación para agregar productos al carrito.
  const agregar = useCartStore((state) => state.agregar)

  // Consulta las categorías disponibles.
  const {
    data: categorias,
    isLoading: cargandoCategorias,
  } = useCategorias()

  // Calcula cuántos productos se deben omitir.
  const skip = pagina * PRODUCTOS_POR_PAGINA

  // Consulta productos aplicando búsqueda, categoría y paginación.
  const {
    data,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useProductos({
    skip,
    limit: PRODUCTOS_POR_PAGINA,
    search: busqueda || undefined,
    categoria_id: categoriaId
      ? Number(categoriaId)
      : undefined,
  })

  // Calcula los resultados de paginación.
  const productos = data?.items ?? []
  const totalProductos = data?.total ?? 0

  const totalPaginas = Math.ceil(
    totalProductos / PRODUCTOS_POR_PAGINA,
  )

  // Pantalla de carga con tarjetas skeleton.
  if (isLoading) {
    return (
      <main className="min-h-screen bg-food-background p-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <div className="mb-3 h-4 w-32 animate-pulse rounded bg-food-border" />
            <div className="mb-3 h-9 w-64 animate-pulse rounded bg-food-border" />
            <div className="h-4 w-80 max-w-full animate-pulse rounded bg-food-border" />
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="overflow-hidden rounded-2xl border border-food-border bg-food-white"
              >
                <div className="h-48 animate-pulse bg-food-cream" />

                <div className="space-y-4 p-5">
                  <div className="h-5 w-3/4 animate-pulse rounded bg-food-border" />
                  <div className="h-4 w-1/2 animate-pulse rounded bg-food-border" />
                  <div className="h-6 w-2/3 animate-pulse rounded bg-food-border" />
                  <div className="h-11 animate-pulse rounded-lg bg-food-border" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    )
  }

  // Pantalla de error.
  if (isError) {
    return (
      <main className="min-h-screen bg-food-background p-6">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border border-red-200 bg-food-white p-8 text-center shadow-sm">
            <h1 className="mb-3 text-2xl font-bold text-food-green">
              No pudimos cargar el catálogo
            </h1>

            <p className="mb-5 text-food-muted">
              Ocurrió un problema al consultar los productos.
            </p>

            <button
              type="button"
              onClick={() => void refetch()}
              className="rounded-xl bg-food-orange px-6 py-3 font-semibold text-white transition hover:bg-food-green-light"
            >
              Reintentar
            </button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-food-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* Encabezado del catálogo */}
        <section className="mb-8 overflow-hidden rounded-3xl bg-food-green px-6 py-10 text-white shadow-lg sm:px-10">
          <div className="max-w-2xl">
            <span className="mb-4 inline-block rounded-full bg-food-white/10 px-4 py-2 text-sm font-semibold tracking-wide text-food-cream">
              FOOD STORE
            </span>

            <h1 className="text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
              Elegí algo rico para hoy
            </h1>

            <p className="mt-4 max-w-xl text-base leading-relaxed text-white/75 sm:text-lg">
              Descubrí nuestro menú, elegí tus favoritos y recibí tu pedido
              en la comodidad de tu casa.
            </p>

            <div className="mt-6 h-1 w-20 rounded-full bg-food-orange" />
          </div>
        </section>

        {/* Título y cantidad de productos */}
        <section className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="mb-1 text-sm font-semibold uppercase tracking-wider text-food-orange">
              Nuestro menú
            </p>

            <h2 className="text-2xl font-bold text-food-green sm:text-3xl">
              Nuestros productos
            </h2>

            <p className="mt-2 text-food-muted">
              Encontrá tu próxima comida favorita.
            </p>
          </div>

          <span className="rounded-full border border-food-border bg-food-white px-4 py-2 text-sm font-semibold text-food-green">
            {totalProductos} productos
          </span>
        </section>

        {/* Buscador y filtros */}
        <section className="mb-8 rounded-2xl border border-food-border bg-food-white p-5 shadow-sm">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

            <div>
              <label
                htmlFor="busquedaProductos"
                className="mb-2 block text-sm font-semibold text-food-green"
              >
                Buscar productos
              </label>

              <input
                id="busquedaProductos"
                type="search"
                placeholder="Ej.: hamburguesa, pizza..."
                value={busqueda}
                onChange={(event) => {
                  setBusqueda(event.target.value)
                  setPagina(0)
                }}
                autoComplete="off"
                className="w-full rounded-xl border border-food-border bg-food-background px-4 py-3 outline-none transition focus:border-food-orange focus:ring-2 focus:ring-food-orange/20"
              />
            </div>

            <div>
              <label
                htmlFor="categoriaProductos"
                className="mb-2 block text-sm font-semibold text-food-green"
              >
                Filtrar por categoría
              </label>

              <select
                id="categoriaProductos"
                value={categoriaId}
                onChange={(event) => {
                  setCategoriaId(event.target.value)
                  setPagina(0)
                }}
                disabled={cargandoCategorias}
                className="w-full rounded-xl border border-food-border bg-food-background px-4 py-3 outline-none transition focus:border-food-orange focus:ring-2 focus:ring-food-orange/20 disabled:opacity-60"
              >
                <option value="">Todas las categorías</option>

                {categorias?.map((categoria) => (
                  <option key={categoria.id} value={categoria.id}>
                    {categoria.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {(busqueda || categoriaId) && (
            <button
              type="button"
              onClick={() => {
                setBusqueda('')
                setCategoriaId('')
                setPagina(0)
              }}
              className="mt-4 text-sm font-semibold text-food-orange-dark transition hover:text-food-green"
            >
              Limpiar filtros
            </button>
          )}
        </section>

        {/* Indicador de actualización */}
        {isFetching && (
          <p className="mb-4 text-sm font-medium text-food-muted">
            Actualizando resultados...
          </p>
        )}

        {/* Listado de productos */}
        {productos.length === 0 ? (
          <section className="rounded-2xl border border-food-border bg-food-white px-6 py-16 text-center shadow-sm">
            <h3 className="text-xl font-bold text-food-green">
              No encontramos productos
            </h3>

            <p className="mt-2 text-food-muted">
              Probá con otra búsqueda o seleccioná una categoría diferente.
            </p>

            <button
              type="button"
              onClick={() => {
                setBusqueda('')
                setCategoriaId('')
                setPagina(0)
              }}
              className="mt-5 rounded-xl bg-food-green px-5 py-3 font-semibold text-white transition hover:bg-food-green-light"
            >
              Ver todos los productos
            </button>
          </section>
        ) : (
          <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {productos.map((producto) => {
              const puedeComprar =
                producto.activo &&
                producto.disponible &&
                producto.stock > 0

              return (
                <article
                  key={producto.id}
                  className="group overflow-hidden rounded-2xl border border-food-border bg-food-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  {/* Imagen del producto */}
                  <div className="relative h-52 overflow-hidden bg-food-cream">
                    {producto.imagen_url ? (
                      <img
                        src={producto.imagen_url}
                        alt={producto.nombre}
                        loading="lazy"
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gradient-to-br from-food-cream to-white">
                        <span className="text-sm font-semibold tracking-wide text-food-muted">
                          FOOD STORE
                        </span>
                      </div>
                    )}

                    {/* Categoría */}
                    <span className="absolute left-3 top-3 rounded-full bg-food-white/95 px-3 py-1.5 text-xs font-bold text-food-green shadow-sm">
                      {producto.categoria.nombre}
                    </span>

                    {/* Disponibilidad */}
                    {!puedeComprar && (
                      <span className="absolute bottom-3 right-3 rounded-full bg-red-700 px-3 py-1.5 text-xs font-semibold text-white">
                        {producto.stock <= 0 ? 'Sin stock' : 'No disponible'}
                      </span>
                    )}
                  </div>

                  {/* Información */}
                  <div className="flex min-h-64 flex-col p-5">
                    <h3 className="text-lg font-bold text-food-green transition group-hover:text-food-orange-dark">
                      {producto.nombre}
                    </h3>

                    <p className="mt-2 min-h-12 text-sm leading-relaxed text-food-muted">
                      {producto.descripcion || 'Un producto de nuestro menú.'}
                    </p>

                    <div className="mt-auto pt-5">
                      <div className="mb-4 flex items-end justify-between gap-2">
                        <div>
                          <p className="text-xs font-medium text-food-muted">
                            Precio
                          </p>

                          <p className="mt-1 text-xl font-bold text-food-orange-dark">
                            {formatoPrecio(producto.precio_base)}
                          </p>
                        </div>

                        <p className="text-xs text-food-muted">
                          Stock: {producto.stock}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => agregar(producto)}
                        disabled={!puedeComprar}
                        className="w-full rounded-xl bg-food-green px-4 py-3 font-semibold text-white transition hover:bg-food-green-light disabled:cursor-not-allowed disabled:bg-food-border disabled:text-food-muted"
                      >
                        {puedeComprar
                          ? 'Agregar al carrito'
                          : 'No disponible'}
                      </button>
                    </div>
                  </div>
                </article>
              )
            })}
          </section>
        )}

        {/* Paginación */}
        {totalPaginas > 1 && (
          <nav
            aria-label="Paginación de productos"
            className="mt-10 flex flex-wrap items-center justify-center gap-4"
          >
            <button
              type="button"
              onClick={() => setPagina((actual) => actual - 1)}
              disabled={pagina === 0 || isFetching}
              className="rounded-xl border border-food-border bg-food-white px-5 py-3 font-semibold text-food-green transition hover:border-food-orange hover:bg-food-cream disabled:cursor-not-allowed disabled:opacity-40"
            >
              Anterior
            </button>

            <span className="rounded-xl bg-food-green px-5 py-3 text-sm font-semibold text-white">
              Página {pagina + 1} de {totalPaginas}
            </span>

            <button
              type="button"
              onClick={() => setPagina((actual) => actual + 1)}
              disabled={pagina + 1 >= totalPaginas || isFetching}
              className="rounded-xl border border-food-border bg-food-white px-5 py-3 font-semibold text-food-green transition hover:border-food-orange hover:bg-food-cream disabled:cursor-not-allowed disabled:opacity-40"
            >
              Siguiente
            </button>
          </nav>
        )}

        {/* Pie del catálogo */}
        <footer className="mt-14 border-t border-food-border py-6 text-center">
          <p className="text-sm text-food-muted">
            Food Store · Gracias por elegirnos.
          </p>
        </footer>

      </div>
    </main>
  )
}
