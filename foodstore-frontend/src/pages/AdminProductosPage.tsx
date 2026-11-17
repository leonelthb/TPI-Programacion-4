import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { tableFeatures, useTable } from '@tanstack/react-table'
import type { ColumnDef } from '@tanstack/react-table'
import axios from 'axios'

import {
  listarProductosAdmin,
  crearProducto,
  actualizarProducto,
  actualizarStockProducto,
  eliminarProducto,
} from '../services/producto.service'
import { useCategorias } from '../hooks/useCategorias'
import type {
  Producto,
  ProductoCreate,
  ProductoUpdate,
  ProductoStockUpdate,
} from '../types/producto'

// Características básicas de TanStack Table.
const features = tableFeatures({})

// Datos utilizados por el formulario de alta y edición.
interface ProductoFormValues {
  nombre: string
  descripcion: string
  precio_base: number
  imagen_url: string
  stock: number
  disponible: boolean
  categoria_id: number
}

// Formatea los precios en pesos argentinos.
const formatoPrecio = (precio: number) =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
  }).format(precio)

// Formulario reutilizable para crear y editar productos.
function ProductoForm({
  producto,
  categorias,
  onGuardar,
  onCancelar,
  guardando,
}: {
  producto: Producto | null
  categorias: { id: number; nombre: string }[]
  onGuardar: (valores: ProductoFormValues) => Promise<void>
  onCancelar: () => void
  guardando: boolean
}) {
  const form = useForm({
    defaultValues: {
      nombre: producto?.nombre ?? '',
      descripcion: producto?.descripcion ?? '',
      precio_base: producto?.precio_base ?? 0,
      imagen_url: producto?.imagen_url ?? '',
      stock: producto?.stock ?? 0,
      disponible: producto?.disponible ?? true,
      categoria_id: producto?.categoria.id ?? 0,
    } as ProductoFormValues,
    onSubmit: async ({ value }) => {
      await onGuardar(value)
    },
  })

  return (
    <section className="mb-8 rounded-xl border bg-food-white p-6">
      <h2 className="mb-5 text-xl font-bold">
        {producto ? 'Editar producto' : 'Nuevo producto'}
      </h2>

      <form
        onSubmit={(event) => {
          event.preventDefault()
          event.stopPropagation()
          void form.handleSubmit()
        }}
        className="grid gap-4 sm:grid-cols-2"
      >
        {/* Nombre del producto. */}
        <form.Field
          name="nombre"
          validators={{
            onChange: ({ value }) =>
              value.trim().length === 0
                ? 'El nombre es obligatorio.'
                : undefined,
          }}
        >
          {(field) => (
            <div>
              <label className="mb-1 block font-medium">Nombre</label>
              <input
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
                className="w-full rounded-lg border p-3"
              />
              {field.state.meta.errors.length > 0 && (
                <p className="mt-1 text-sm text-red-600">
                  {field.state.meta.errors.join(', ')}
                </p>
              )}
            </div>
          )}
        </form.Field>

        {/* Categoría asociada. */}
        <form.Field
          name="categoria_id"
          validators={{
            onChange: ({ value }) =>
              value <= 0 ? 'Seleccioná una categoría.' : undefined,
          }}
        >
          {(field) => (
            <div>
              <label className="mb-1 block font-medium">Categoría</label>
              <select
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(Number(event.target.value))}
                className="w-full rounded-lg border bg-food-white p-3"
              >
                <option value={0}>Seleccionar categoría</option>
                {categorias.map((categoria) => (
                  <option key={categoria.id} value={categoria.id}>
                    {categoria.nombre}
                  </option>
                ))}
              </select>
              {field.state.meta.errors.length > 0 && (
                <p className="mt-1 text-sm text-red-600">
                  {field.state.meta.errors.join(', ')}
                </p>
              )}
            </div>
          )}
        </form.Field>

        {/* Precio base. */}
        <form.Field
          name="precio_base"
          validators={{
            onChange: ({ value }) =>
              !Number.isFinite(value) || value <= 0
                ? 'El precio debe ser mayor que cero.'
                : undefined,
          }}
        >
          {(field) => (
            <div>
              <label className="mb-1 block font-medium">Precio base</label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(Number(event.target.value))}
                className="w-full rounded-lg border p-3"
              />
              {field.state.meta.errors.length > 0 && (
                <p className="mt-1 text-sm text-red-600">
                  {field.state.meta.errors.join(', ')}
                </p>
              )}
            </div>
          )}
        </form.Field>

        {/* Stock inicial o valor al editar el producto. */}
        <form.Field
          name="stock"
          validators={{
            onChange: ({ value }) =>
              !Number.isInteger(value) || value < 0
                ? 'El stock debe ser un entero igual o mayor a cero.'
                : undefined,
          }}
        >
          {(field) => (
            <div>
              <label className="mb-1 block font-medium">Stock</label>
              <input
                type="number"
                min="0"
                step="1"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) =>
                  field.handleChange(
                    event.target.value === '' ? 0 : Number(event.target.value),
                  )
                }
                className="w-full rounded-lg border p-3"
              />
              {field.state.meta.errors.length > 0 && (
                <p className="mt-1 text-sm text-red-600">
                  {field.state.meta.errors.join(', ')}
                </p>
              )}
            </div>
          )}
        </form.Field>

        {/* Descripción. */}
        <form.Field name="descripcion">
          {(field) => (
            <div className="sm:col-span-2">
              <label className="mb-1 block font-medium">Descripción</label>
              <textarea
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
                rows={3}
                className="w-full rounded-lg border p-3"
              />
            </div>
          )}
        </form.Field>

        {/* URL de imagen. */}
        <form.Field name="imagen_url">
          {(field) => (
            <div className="sm:col-span-2">
              <label className="mb-1 block font-medium">URL de imagen</label>
              <input
                type="url"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
                placeholder="https://..."
                className="w-full rounded-lg border p-3"
              />
            </div>
          )}
        </form.Field>

        {/* Disponibilidad comercial. */}
        <form.Field name="disponible">
          {(field) => (
            <label className="flex items-center gap-3 sm:col-span-2">
              <input
                type="checkbox"
                checked={field.state.value}
                onChange={(event) => field.handleChange(event.target.checked)}
                className="h-4 w-4"
              />
              Producto disponible para la venta
            </label>
          )}
        </form.Field>

        {/* Acciones del formulario. */}
        <div className="flex flex-wrap gap-3 sm:col-span-2">
          <button
            type="submit"
            disabled={guardando}
            className="rounded-lg bg-food-green px-5 py-3 font-semibold text-white hover:bg-food-green-light disabled:opacity-50"
          >
            {guardando
              ? 'Guardando...'
              : producto
                ? 'Guardar cambios'
                : 'Crear producto'}
          </button>
          <button
            type="button"
            onClick={onCancelar}
            className="rounded-lg border px-5 py-3"
          >
            Cancelar
          </button>
        </div>
      </form>
    </section>
  )
}

// Formulario específico para el PATCH de stock y disponibilidad.
function StockForm({
  producto,
  onGuardar,
  onCancelar,
  guardando,
}: {
  producto: Producto
  onGuardar: (datos: ProductoStockUpdate) => Promise<void>
  onCancelar: () => void
  guardando: boolean
}) {
  const form = useForm({
    defaultValues: {
      stock: producto.stock,
      disponible: producto.disponible,
    },
    onSubmit: async ({ value }) => {
      await onGuardar(value)
    },
  })

  return (
    <section className="mb-8 rounded-xl border border-food-border bg-food-white p-6">
      <h2 className="mb-2 text-xl font-bold">Actualizar stock y disponibilidad</h2>
      <p className="mb-5 text-sm text-food-muted">Producto: {producto.nombre}</p>

      <form
        onSubmit={(event) => {
          event.preventDefault()
          event.stopPropagation()
          void form.handleSubmit()
        }}
        className="grid gap-4 sm:grid-cols-2"
      >
        <form.Field
          name="stock"
          validators={{
            onChange: ({ value }) =>
              !Number.isInteger(value) || value < 0
                ? 'El stock debe ser un entero igual o mayor a cero.'
                : undefined,
          }}
        >
          {(field) => (
            <div>
              <label className="mb-1 block font-medium">Cantidad en stock</label>
              <input
                type="number"
                min="0"
                step="1"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) =>
                  field.handleChange(
                    event.target.value === '' ? 0 : Number(event.target.value),
                  )
                }
                className="w-full rounded-lg border p-3"
              />
              {field.state.meta.errors.length > 0 && (
                <p className="mt-1 text-sm text-red-600">
                  {field.state.meta.errors.join(', ')}
                </p>
              )}
            </div>
          )}
        </form.Field>

        <form.Field name="disponible">
          {(field) => (
            <label className="flex items-center gap-3 self-center">
              <input
                type="checkbox"
                checked={field.state.value}
                onChange={(event) => field.handleChange(event.target.checked)}
                className="h-4 w-4"
              />
              Disponible para la venta
            </label>
          )}
        </form.Field>

        <div className="flex flex-wrap gap-3 sm:col-span-2">
          <button
            type="submit"
            disabled={guardando}
            className="rounded-lg bg-food-green px-5 py-3 font-semibold text-white hover:bg-food-green-light disabled:opacity-50"
          >
            {guardando ? 'Actualizando...' : 'Actualizar stock'}
          </button>
          <button
            type="button"
            onClick={onCancelar}
            className="rounded-lg border px-5 py-3"
          >
            Cancelar
          </button>
        </div>
      </form>
    </section>
  )
}

export default function AdminProductosPage() {
  const queryClient = useQueryClient()

  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState<
    'activos' | 'inactivos' | 'todos'
  >('activos')
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [productoEnEdicion, setProductoEnEdicion] = useState<Producto | null>(null)
  const [productoStockEnEdicion, setProductoStockEnEdicion] =
    useState<Producto | null>(null)

  // Listado administrativo: activos, inactivos o todos.
  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['admin-productos', busqueda, filtroEstado],
    queryFn: () =>
      listarProductosAdmin({
        skip: 0,
        limit: 100,
        ...(busqueda.trim() && { search: busqueda.trim() }),
        activo:
          filtroEstado === 'todos'
            ? undefined
            : filtroEstado === 'activos',
      }),
  })

  // Categorías activas para el formulario.
  const {
    data: categorias = [],
    isLoading: cargandoCategorias,
  } = useCategorias()

  // Alta y edición general del producto.
  const mutation = useMutation({
    mutationFn: async (valores: ProductoFormValues) => {
      if (productoEnEdicion) {
        const datos: ProductoUpdate = {
          ...valores,
          descripcion: valores.descripcion || null,
          imagen_url: valores.imagen_url || null,
        }
        return actualizarProducto(productoEnEdicion.id, datos)
      }

      const datos: ProductoCreate = {
        ...valores,
        descripcion: valores.descripcion || null,
        imagen_url: valores.imagen_url || null,
      }
      return crearProducto(datos)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-productos'] })
      await queryClient.invalidateQueries({ queryKey: ['productos'] })
      setMostrarFormulario(false)
      setProductoEnEdicion(null)
    },
  })

  // Baja lógica del producto.
  const eliminarMutation = useMutation({
    mutationFn: eliminarProducto,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-productos'] })
      await queryClient.invalidateQueries({ queryKey: ['productos'] })
    },
  })

  // Actualización específica de stock y disponibilidad mediante PATCH.
  const stockMutation = useMutation({
    mutationFn: ({
      id,
      datos,
    }: {
      id: number
      datos: ProductoStockUpdate
    }) => actualizarStockProducto(id, datos),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-productos'] })
      await queryClient.invalidateQueries({ queryKey: ['productos'] })
      setProductoStockEnEdicion(null)
    },
  })

  // Columnas de la tabla administrativa.
  const columnas: ColumnDef<typeof features, Producto>[] = [
    {
      accessorKey: 'id',
      header: 'ID',
    },
    {
      accessorKey: 'nombre',
      header: 'Producto',
    },
    {
      accessorFn: (producto) => producto.categoria.nombre,
      id: 'categoria',
      header: 'Categoría',
    },
    {
      accessorKey: 'precio_base',
      header: 'Precio',
      cell: (info) => formatoPrecio(info.getValue<number>()),
    },
    {
      accessorKey: 'stock',
      header: 'Stock',
    },
    {
      accessorKey: 'disponible',
      header: 'Disponibilidad',
      cell: (info) => {
        const disponible = info.getValue<boolean>()
        return (
          <span
            className={
              disponible
                ? 'rounded-full bg-green-100 px-3 py-1 text-green-700'
                : 'rounded-full bg-red-100 px-3 py-1 text-red-700'
            }
          >
            {disponible ? 'Disponible' : 'No disponible'}
          </span>
        )
      },
    },
    {
      id: 'acciones',
      header: 'Acciones',
      cell: (info) => {
        const producto = info.row.original
        return (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                setProductoEnEdicion(producto)
                setProductoStockEnEdicion(null)
                setMostrarFormulario(true)
                mutation.reset()
              }}
              className="rounded-lg border border-food-green px-3 py-2 text-food-green hover:bg-food-cream"
            >
              Editar
            </button>

            <button
              type="button"
              onClick={() => {
                setProductoStockEnEdicion(producto)
                setMostrarFormulario(false)
                setProductoEnEdicion(null)
                stockMutation.reset()
              }}
              className="rounded-lg border border-food-border px-3 py-2 text-food-muted hover:bg-food-background"
            >
              Stock
            </button>

            {producto.activo && (
              <button
                type="button"
                disabled={eliminarMutation.isPending}
                onClick={() => {
                  const confirmar = window.confirm(
                    `¿Querés dar de baja el producto "${producto.nombre}"?`,
                  )
                  if (confirmar) eliminarMutation.mutate(producto.id)
                }}
                className="rounded-lg border border-red-600 px-3 py-2 text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                Eliminar
              </button>
            )}
          </div>
        )
      },
    },
  ]

  // Instancia de TanStack Table v9.
  const tabla = useTable({
    features,
    columns: columnas,
    data: data?.items ?? [],
  })

  // Mensajes de error de las operaciones.
  const mensajeError = axios.isAxiosError(error)
    ? error.response?.data?.detail
    : null
  const mensajeMutation = axios.isAxiosError(mutation.error)
    ? mutation.error.response?.data?.detail
    : null
  const mensajeStockMutation = axios.isAxiosError(stockMutation.error)
    ? stockMutation.error.response?.data?.detail
    : null
  const mensajeEliminarMutation = axios.isAxiosError(eliminarMutation.error)
    ? eliminarMutation.error.response?.data?.detail
    : null

  if (isLoading) {
    return (
      <main className="p-6">
        <p>Cargando productos...</p>
      </main>
    )
  }

  if (isError) {
    return (
      <main className="p-6">
        <h1 className="mb-4 text-2xl font-bold">Administración de productos</h1>
        <p className="text-red-600">
          {typeof mensajeError === 'string'
            ? mensajeError
            : 'No se pudieron cargar los productos.'}
        </p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-food-background p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="mb-2 text-3xl font-bold">Administración de productos</h1>
            <p className="text-food-muted">
              Consultá y administrá los productos del catálogo.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setProductoEnEdicion(null)
              setProductoStockEnEdicion(null)
              setMostrarFormulario(true)
              mutation.reset()
            }}
            className="rounded-lg bg-food-green px-5 py-3 font-semibold text-white hover:bg-food-green-light"
          >
            Nuevo producto
          </button>
        </div>

        {/* Formulario de alta o edición. */}
        {mostrarFormulario && (
          cargandoCategorias ? (
            <p className="mb-6">Cargando categorías...</p>
          ) : (
            <ProductoForm
              key={productoEnEdicion?.id ?? 'nuevo'}
              producto={productoEnEdicion}
              categorias={categorias}
              guardando={mutation.isPending}
              onCancelar={() => {
                setMostrarFormulario(false)
                setProductoEnEdicion(null)
                mutation.reset()
              }}
              onGuardar={async (valores) => {
                await mutation.mutateAsync(valores)
              }}
            />
          )
        )}

        {mutation.isError && (
          <p className="mb-5 rounded-lg bg-red-100 p-3 text-red-700">
            {typeof mensajeMutation === 'string'
              ? mensajeMutation
              : 'No se pudo guardar el producto.'}
          </p>
        )}

        {/* Formulario específico para el PATCH de stock. */}
        {productoStockEnEdicion && (
          <StockForm
            key={productoStockEnEdicion.id}
            producto={productoStockEnEdicion}
            guardando={stockMutation.isPending}
            onCancelar={() => {
              setProductoStockEnEdicion(null)
              stockMutation.reset()
            }}
            onGuardar={async (datos) => {
              await stockMutation.mutateAsync({
                id: productoStockEnEdicion.id,
                datos,
              })
            }}
          />
        )}

        {stockMutation.isError && (
          <p className="mb-5 rounded-lg bg-red-100 p-3 text-red-700">
            {typeof mensajeStockMutation === 'string'
              ? mensajeStockMutation
              : 'No se pudo actualizar el stock.'}
          </p>
        )}

        {eliminarMutation.isError && (
          <p className="mb-5 rounded-lg bg-red-100 p-3 text-red-700">
            {typeof mensajeEliminarMutation === 'string'
              ? mensajeEliminarMutation
              : 'No se pudo eliminar el producto.'}
          </p>
        )}

        {/* Buscador de productos. */}
        <div className="mb-6 max-w-md">
          <label htmlFor="busquedaProducto" className="mb-2 block font-medium">
            Buscar producto
          </label>
          <input
            id="busquedaProducto"
            type="text"
            value={busqueda}
            onChange={(event) => setBusqueda(event.target.value)}
            placeholder="Escribí el nombre del producto..."
            className="w-full rounded-lg border border-food-border bg-food-white p-3"
          />
        </div>

        <p className="mb-3 text-sm text-food-muted">
          Productos encontrados: {data?.total ?? 0}
        </p>

        {/* Filtro por estado lógico. */}
        <div className="mb-6 max-w-md">
          <label htmlFor="filtroEstado" className="mb-2 block font-medium">
            Estado de los productos
          </label>
          <select
            id="filtroEstado"
            value={filtroEstado}
            onChange={(event) =>
              setFiltroEstado(
                event.target.value as 'activos' | 'inactivos' | 'todos',
              )
            }
            className="w-full rounded-lg border border-food-border bg-food-white p-3"
          >
            <option value="activos">Activos</option>
            <option value="inactivos">Inactivos</option>
            <option value="todos">Todos</option>
          </select>
        </div>

        {/* Tabla administrativa. */}
        <div className="overflow-x-auto rounded-xl border bg-food-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-food-background">
              {tabla.getHeaderGroups().map((grupo) => (
                <tr key={grupo.id}>
                  {grupo.headers.map((header) => (
                    <th key={header.id} className="px-4 py-3 font-semibold">
                      <tabla.FlexRender header={header} />
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {tabla.getRowModel().rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={columnas.length}
                    className="px-4 py-8 text-center text-food-muted"
                  >
                    No hay productos para mostrar.
                  </td>
                </tr>
              ) : (
                tabla.getRowModel().rows.map((fila) => (
                  <tr key={fila.id} className="border-t hover:bg-food-background">
                    {fila.getAllCells().map((celda) => (
                      <td key={celda.id} className="px-4 py-3">
                        <tabla.FlexRender cell={celda} />
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}
