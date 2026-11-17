
import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  tableFeatures,
  useTable,
} from '@tanstack/react-table'
import type { ColumnDef } from '@tanstack/react-table'
import axios from 'axios'

import {
  crearCategoria,
  actualizarCategoria,
  eliminarCategoria,
} from '../services/categoria.service'

import { useCategoriasAdmin } from '../hooks/useCategorias'

import type {
  Categoria,
  CategoriaCreate,
  CategoriaUpdate,
} from '../types/categoria'

// Características básicas de la tabla.
const features = tableFeatures({})

// Valores utilizados por el formulario.
interface CategoriaFormValues {
  nombre: string
  descripcion: string
}

// Formulario reutilizable para crear y editar categorías.
function CategoriaForm({
  categoria,
  onGuardar,
  onCancelar,
  guardando,
}: {
  categoria: Categoria | null
  onGuardar: (valores: CategoriaFormValues) => Promise<void>
  onCancelar: () => void
  guardando: boolean
}) {
  const form = useForm({
    defaultValues: {
      nombre: categoria?.nombre ?? '',
      descripcion: categoria?.descripcion ?? '',
    } as CategoriaFormValues,

    onSubmit: async ({ value }) => {
      await onGuardar(value)
    },
  })

  return (
    <section className="mb-8 rounded-xl border bg-food-white p-6">
      <h2 className="mb-5 text-xl font-bold">
        {categoria ? 'Editar categoría' : 'Nueva categoría'}
      </h2>

      <form
        onSubmit={(event) => {
          event.preventDefault()
          event.stopPropagation()
          void form.handleSubmit()
        }}
        className="grid gap-4"
      >
        {/* Nombre */}
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
              <label className="mb-1 block font-medium">
                Nombre
              </label>

              <input
                type="text"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) =>
                  field.handleChange(event.target.value)
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

        {/* Descripción */}
        <form.Field name="descripcion">
          {(field) => (
            <div>
              <label className="mb-1 block font-medium">
                Descripción
              </label>

              <textarea
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) =>
                  field.handleChange(event.target.value)
                }
                rows={3}
                className="w-full rounded-lg border p-3"
              />
            </div>
          )}
        </form.Field>

        {/* Acciones */}
        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={guardando}
            className="rounded-lg bg-food-green px-5 py-3 font-semibold text-white hover:bg-food-green-light disabled:opacity-50"
          >
            {guardando
              ? 'Guardando...'
              : categoria
                ? 'Guardar cambios'
                : 'Crear categoría'}
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

export default function AdminCategoriasPage() {
  const queryClient = useQueryClient()

  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState<
    'activos' | 'inactivos' | 'todos'
  >('activos')

  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [categoriaEnEdicion, setCategoriaEnEdicion] =
    useState<Categoria | null>(null)

  // Convertimos el filtro visual en el valor esperado por el hook.
  const activo =
    filtroEstado === 'todos'
      ? undefined
      : filtroEstado === 'activos'

  // Consultamos las categorías administrativas.
  const {
    data: categorias = [],
    isLoading,
    isError,
    error,
  } = useCategoriasAdmin(activo)

  // Crear o actualizar una categoría.
  const mutation = useMutation({
    mutationFn: async (valores: CategoriaFormValues) => {
      if (categoriaEnEdicion) {
        const datos: CategoriaUpdate = {
          nombre: valores.nombre.trim(),
          descripcion: valores.descripcion.trim() || null,
        }

        return actualizarCategoria(categoriaEnEdicion.id, datos)
      }

      const datos: CategoriaCreate = {
        nombre: valores.nombre.trim(),
        descripcion: valores.descripcion.trim() || null,
      }

      return crearCategoria(datos)
    },

    onSuccess: async () => {
      // Actualizamos las consultas públicas y administrativas.
      await queryClient.invalidateQueries({
        queryKey: ['admin-categorias'],
      })

      await queryClient.invalidateQueries({
        queryKey: ['categorias'],
      })

      setMostrarFormulario(false)
      setCategoriaEnEdicion(null)
    },
  })

  // Dar de baja lógicamente una categoría.
  const eliminarMutation = useMutation({
    mutationFn: eliminarCategoria,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['admin-categorias'],
      })

      await queryClient.invalidateQueries({
        queryKey: ['categorias'],
      })
    },
  })

  // Búsqueda local por nombre.
  const categoriasFiltradas = categorias.filter((categoria) =>
    categoria.nombre.toLowerCase().includes(busqueda.trim().toLowerCase())
  )

  // Definición de las columnas de la tabla.
  const columnas: ColumnDef<typeof features, Categoria>[] = [
    {
      accessorKey: 'id',
      header: 'ID',
    },
    {
      accessorKey: 'nombre',
      header: 'Nombre',
    },
    {
      accessorKey: 'descripcion',
      header: 'Descripción',
      cell: (info) => info.getValue<string | null>() || '-',
    },
    {
      accessorKey: 'activo',
      header: 'Estado',
      cell: (info) => {
        const activo = info.getValue<boolean>()

        return (
          <span
            className={
              activo
                ? 'rounded-full bg-green-100 px-3 py-1 text-green-700'
                : 'rounded-full bg-red-100 px-3 py-1 text-red-700'
            }
          >
            {activo ? 'Activa' : 'Inactiva'}
          </span>
        )
      },
    },
    {
      id: 'acciones',
      header: 'Acciones',
      cell: (info) => {
        const categoria = info.row.original

        return (
          <div className="flex gap-2">
            {/* Solo se pueden editar categorías activas. */}
            {categoria.activo && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setCategoriaEnEdicion(categoria)
                    setMostrarFormulario(true)
                    mutation.reset()
                  }}
                  className="rounded-lg border border-food-green px-3 py-2 text-food-green hover:bg-food-cream"
                >
                  Editar
                </button>

                <button
                  type="button"
                  disabled={eliminarMutation.isPending}
                  onClick={() => {
                    const confirmar = window.confirm(
                      `¿Querés dar de baja la categoría "${categoria.nombre}"?`
                    )

                    if (confirmar) {
                      eliminarMutation.mutate(categoria.id)
                    }
                  }}
                  className="rounded-lg border border-red-600 px-3 py-2 text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  Eliminar
                </button>
              </>
            )}

            {!categoria.activo && (
              <span className="text-sm text-food-muted">
                Sin acciones disponibles
              </span>
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
    data: categoriasFiltradas,
  })

  // Mensajes de error.
  const mensajeError = axios.isAxiosError(error)
    ? error.response?.data?.detail
    : null

  const mensajeMutation = axios.isAxiosError(mutation.error)
    ? mutation.error.response?.data?.detail
    : null

  const mensajeEliminar = axios.isAxiosError(eliminarMutation.error)
    ? eliminarMutation.error.response?.data?.detail
    : null

  if (isLoading) {
    return (
      <main className="p-6">
        <p>Cargando categorías...</p>
      </main>
    )
  }

  if (isError) {
    return (
      <main className="p-6">
        <h1 className="mb-4 text-2xl font-bold">
          Administración de categorías
        </h1>

        <p className="text-red-600">
          {typeof mensajeError === 'string'
            ? mensajeError
            : 'No se pudieron cargar las categorías.'}
        </p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-food-background p-6">
      <div className="mx-auto max-w-7xl">

        {/* Encabezado */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="mb-2 text-3xl font-bold">
              Administración de categorías
            </h1>

            <p className="text-food-muted">
              Consultá y administrá las categorías del catálogo.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setCategoriaEnEdicion(null)
              setMostrarFormulario(true)
              mutation.reset()
            }}
            className="rounded-lg bg-food-green px-5 py-3 font-semibold text-white hover:bg-food-green-light"
          >
            Nueva categoría
          </button>
        </div>

        {/* Formulario */}
        {mostrarFormulario && (
          <CategoriaForm
            key={categoriaEnEdicion?.id ?? 'nueva'}
            categoria={categoriaEnEdicion}
            guardando={mutation.isPending}
            onCancelar={() => {
              setMostrarFormulario(false)
              setCategoriaEnEdicion(null)
              mutation.reset()
            }}
            onGuardar={async (valores) => {
              await mutation.mutateAsync(valores)
            }}
          />
        )}

        {/* Error al guardar */}
        {mutation.isError && (
          <p className="mb-5 rounded-lg bg-red-100 p-3 text-red-700">
            {typeof mensajeMutation === 'string'
              ? mensajeMutation
              : 'No se pudo guardar la categoría.'}
          </p>
        )}

        {/* Error al eliminar */}
        {eliminarMutation.isError && (
          <p className="mb-5 rounded-lg bg-red-100 p-3 text-red-700">
            {typeof mensajeEliminar === 'string'
              ? mensajeEliminar
              : 'No se pudo eliminar la categoría.'}
          </p>
        )}

        {/* Buscador */}
        <div className="mb-6 max-w-md">
          <label
            htmlFor="busquedaCategoria"
            className="mb-2 block font-medium"
          >
            Buscar categoría
          </label>

          <input
            id="busquedaCategoria"
            type="text"
            value={busqueda}
            onChange={(event) => setBusqueda(event.target.value)}
            placeholder="Escribí el nombre de la categoría..."
            className="w-full rounded-lg border border-food-border bg-food-white p-3"
          />
        </div>

        {/* Filtro por estado */}
        <div className="mb-6 max-w-md">
          <label
            htmlFor="filtroEstadoCategorias"
            className="mb-2 block font-medium"
          >
            Estado de las categorías
          </label>

          <select
            id="filtroEstadoCategorias"
            value={filtroEstado}
            onChange={(event) =>
              setFiltroEstado(
                event.target.value as 'activos' | 'inactivos' | 'todos'
              )
            }
            className="w-full rounded-lg border border-food-border bg-food-white p-3"
          >
            <option value="activos">Activas</option>
            <option value="inactivos">Inactivas</option>
            <option value="todos">Todas</option>
          </select>
        </div>

        <p className="mb-3 text-sm text-food-muted">
          Categorías encontradas: {categoriasFiltradas.length}
        </p>

        {/* Tabla */}
        <div className="overflow-x-auto rounded-xl border bg-food-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-food-background">
              {tabla.getHeaderGroups().map((grupo) => (
                <tr key={grupo.id}>
                  {grupo.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-4 py-3 font-semibold"
                    >
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
                    No hay categorías para mostrar.
                  </td>
                </tr>
              ) : (
                tabla.getRowModel().rows.map((fila) => (
                  <tr
                    key={fila.id}
                    className="border-t hover:bg-food-background"
                  >
                    {fila.getAllCells().map((celda) => (
                      <td
                        key={celda.id}
                        className="px-4 py-3"
                      >
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
