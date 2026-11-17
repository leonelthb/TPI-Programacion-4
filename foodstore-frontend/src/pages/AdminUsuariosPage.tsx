
import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  tableFeatures,
  useTable,
} from '@tanstack/react-table'
import type { ColumnDef } from '@tanstack/react-table'
import axios from 'axios'

import { useUsuarios } from '../hooks/useUsuarios'
import { actualizarEstadoUsuario } from '../services/usuario.service'

import type { Usuario } from '../types/usuario'

// Características básicas de TanStack Table v9.
const features = tableFeatures({})

export default function AdminUsuariosPage() {
  const queryClient = useQueryClient()

  // Filtro para mostrar todos, activos o deshabilitados.
  const [filtroEstado, setFiltroEstado] = useState<
    'todos' | 'activos' | 'deshabilitados'
  >('todos')

  // Consultamos los usuarios.
  const {
    data: usuarios = [],
    isLoading,
    isError,
    error,
  } = useUsuarios()

  // Activar o desactivar una cuenta.
  const mutation = useMutation({
    mutationFn: ({
      id,
      disabled,
    }: {
      id: number
      disabled: boolean
    }) => actualizarEstadoUsuario(id, disabled),

    onSuccess: async () => {
      // Actualizamos la tabla después del cambio.
      await queryClient.invalidateQueries({
        queryKey: ['admin-usuarios'],
      })
    },
  })

  // Aplicamos el filtro seleccionado.
  const usuariosFiltrados = usuarios.filter((usuario) => {
    if (filtroEstado === 'activos') {
      return !usuario.disabled
    }

    if (filtroEstado === 'deshabilitados') {
      return usuario.disabled
    }

    return true
  })

  // Definición de las columnas.
  const columnas: ColumnDef<typeof features, Usuario>[] = [
    {
      accessorKey: 'id',
      header: 'ID',
    },
    {
      accessorKey: 'full_name',
      header: 'Nombre completo',
    },
    {
      accessorKey: 'username',
      header: 'Usuario',
    },
    {
      accessorKey: 'email',
      header: 'Email',
    },
    {
      accessorKey: 'role',
      header: 'Rol',
      cell: (info) =>
        info.getValue<string>() === 'admin'
          ? 'Administrador'
          : 'Cliente',
    },
    {
      accessorKey: 'disabled',
      header: 'Estado',
      cell: (info) => {
        const disabled = info.getValue<boolean>()

        return (
          <span
            className={
              disabled
                ? 'rounded-full bg-red-100 px-3 py-1 text-red-700'
                : 'rounded-full bg-green-100 px-3 py-1 text-green-700'
            }
          >
            {disabled ? 'Deshabilitado' : 'Activo'}
          </span>
        )
      },
    },
    {
      id: 'acciones',
      header: 'Acciones',
      cell: (info) => {
        const usuario = info.row.original

        return (
          <button
            type="button"
            disabled={mutation.isPending}
            onClick={() => {
              const nuevoEstado = !usuario.disabled

              const accion = nuevoEstado
                ? 'deshabilitar'
                : 'activar'

              const confirmar = window.confirm(
                `¿Querés ${accion} la cuenta de ${usuario.username}?`
              )

              if (confirmar) {
                mutation.mutate({
                  id: usuario.id,
                  disabled: nuevoEstado,
                })
              }
            }}
            className={
              usuario.disabled
                ? 'rounded-lg border border-green-700 px-3 py-2 text-green-700 hover:bg-green-50 disabled:opacity-50'
                : 'rounded-lg border border-red-600 px-3 py-2 text-red-600 hover:bg-red-50 disabled:opacity-50'
            }
          >
            {usuario.disabled ? 'Activar' : 'Deshabilitar'}
          </button>
        )
      },
    },
  ]

  // Instancia de TanStack Table v9.
  const tabla = useTable({
    features,
    columns: columnas,
    data: usuariosFiltrados,
  })

  // Extraemos el mensaje de error del backend.
  const mensajeError = axios.isAxiosError(error)
    ? error.response?.data?.detail
    : null

  const mensajeMutation = axios.isAxiosError(mutation.error)
    ? mutation.error.response?.data?.detail
    : null

  if (isLoading) {
    return (
      <main className="p-6">
        <p>Cargando usuarios...</p>
      </main>
    )
  }

  if (isError) {
    return (
      <main className="p-6">
        <h1 className="mb-4 text-2xl font-bold">
          Administración de usuarios
        </h1>

        <p className="text-red-600">
          {typeof mensajeError === 'string'
            ? mensajeError
            : 'No se pudieron cargar los usuarios.'}
        </p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-food-background p-6">
      <div className="mx-auto max-w-7xl">

        {/* Encabezado */}
        <div className="mb-6">
          <h1 className="mb-2 text-3xl font-bold">
            Administración de usuarios
          </h1>

          <p className="text-food-muted">
            Consultá los usuarios registrados y administrá el estado de sus cuentas.
          </p>
        </div>

        {/* Error al cambiar el estado */}
        {mutation.isError && (
          <p className="mb-5 rounded-lg bg-red-100 p-3 text-red-700">
            {typeof mensajeMutation === 'string'
              ? mensajeMutation
              : 'No se pudo actualizar el estado del usuario.'}
          </p>
        )}

        {/* Filtro */}
        <div className="mb-6 max-w-md">
          <label
            htmlFor="filtroUsuarios"
            className="mb-2 block font-medium"
          >
            Estado de las cuentas
          </label>

          <select
            id="filtroUsuarios"
            value={filtroEstado}
            onChange={(event) =>
              setFiltroEstado(
                event.target.value as
                  | 'todos'
                  | 'activos'
                  | 'deshabilitados'
              )
            }
            className="w-full rounded-lg border border-food-border bg-food-white p-3"
          >
            <option value="todos">Todos</option>
            <option value="activos">Activos</option>
            <option value="deshabilitados">Deshabilitados</option>
          </select>
        </div>

        <p className="mb-3 text-sm text-food-muted">
          Usuarios encontrados: {usuariosFiltrados.length}
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
                    No hay usuarios para mostrar.
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
