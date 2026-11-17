// Formas de pago permitidas por el backend.
export type FormaPago = 'EFECTIVO' | 'TRANSFERENCIA'

// Estados posibles de un pedido.
export type EstadoPedido =
  | 'PENDIENTE'
  | 'EN_PREPARACION'
  | 'ENTREGADO'
  | 'CANCELADO'

// Datos de un producto dentro de un pedido.
export interface ItemPedidoCreate {
  producto_id: number
  cantidad: number
}

// Datos necesarios para crear un pedido.
export interface PedidoCreate {
  items: ItemPedidoCreate[]
  forma_pago: FormaPago
  direccion_entrega: string
  notas?: string | null
}

// Detalle de un pedido recibido desde el backend.
export interface DetallePedido {
  producto_id: number
  nombre_producto: string
  precio_unitario: number
  cantidad: number
  subtotal: number
}

// Pedido recibido desde el backend.
export interface Pedido {
  id: number
  usuario_id: number
  estado: EstadoPedido
  forma_pago: FormaPago
  direccion_entrega: string
  notas: string | null
  total: number
  created_at: string
  updated_at: string
  items: DetallePedido[]
}

// Resultado de los listados paginados.
export interface PedidosPaginados {
  total: number
  items: Pedido[]
}

// Datos para cambiar el estado de un pedido.
export interface CambioEstado {
  estado: EstadoPedido
}

// Información estadística del panel administrativo.
export interface ResumenPedidos {
  pendientes: number
  en_preparacion: number
  entregados: number
  cancelados: number
  pedidos_hoy: number
  ingresos_entregados: number
}