
from datetime import datetime
from typing import Literal, Optional

from sqlmodel import Field, SQLModel


# Formas de pago permitidas.
FormaPago = Literal["EFECTIVO", "TRANSFERENCIA"]

# Estados permitidos para un pedido.
EstadoPedido = Literal[
    "PENDIENTE",
    "EN_PREPARACION",
    "ENTREGADO",
    "CANCELADO"
]


# Datos que recibe el backend por cada producto del pedido.
class ItemPedidoCreate(SQLModel):
    producto_id: int = Field(gt=0)
    cantidad: int = Field(ge=1)


# Datos necesarios para crear un pedido.
class PedidoCreate(SQLModel):
    items: list[ItemPedidoCreate] = Field(min_length=1)
    forma_pago: FormaPago
    direccion_entrega: str = Field(min_length=5, max_length=200)
    notas: Optional[str] = None


# Representación de cada línea del pedido.
class DetallePedidoRead(SQLModel):
    producto_id: int
    nombre_producto: str
    precio_unitario: float
    cantidad: int
    subtotal: float


# Representación completa de un pedido.
class PedidoRead(SQLModel):
    id: int
    usuario_id: int
    estado: EstadoPedido
    forma_pago: FormaPago
    direccion_entrega: str
    notas: Optional[str] = None
    total: float
    created_at: datetime
    updated_at: datetime
    items: list[DetallePedidoRead]


# Listado paginado de pedidos.
class PedidosPaginados(SQLModel):
    total: int
    items: list[PedidoRead]


# Datos para cambiar el estado de un pedido.
class CambioEstado(SQLModel):
    estado: EstadoPedido


# Indicadores del panel administrativo.
class ResumenPedidos(SQLModel):
    pendientes: int
    en_preparacion: int
    entregados: int
    cancelados: int
    pedidos_hoy: int
    ingresos_entregados: float
