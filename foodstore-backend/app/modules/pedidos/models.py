
from datetime import datetime, timezone
from typing import TYPE_CHECKING, Optional

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.modules.usuarios.models import Usuario
    from app.modules.productos.models import Producto


class Pedido(SQLModel, table=True):
    """
    Representa un pedido realizado por un usuario.
    """

    __tablename__ = "pedidos"

    # Clave primaria.
    id: Optional[int] = Field(default=None, primary_key=True)

    # Usuario que realizó el pedido.
    usuario_id: int = Field(
        foreign_key="usuarios.id",
        index=True
    )

    # Estado inicial del pedido.
    estado: str = Field(default="PENDIENTE")

    # Forma de pago seleccionada.
    forma_pago: str

    # Dirección de entrega.
    direccion_entrega: str

    # Notas adicionales opcionales.
    notas: Optional[str] = Field(default=None)

    # Total calculado al momento de crear el pedido.
    total: float = Field(default=0.0, ge=0)

    # Fechas de creación y última actualización.
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )

    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )

    # Relación N:1 con Usuario.
    usuario: Optional["Usuario"] = Relationship(
        back_populates="pedidos"
    )

    # Relación 1:N: un pedido contiene varios detalles.
    items: list["DetallePedido"] = Relationship(
        back_populates="pedido"
    )


class DetallePedido(SQLModel, table=True):
    """
    Representa una línea de producto dentro de un pedido.

    Guarda una copia del nombre y del precio del producto
    para conservar los datos originales de la compra.
    """

    __tablename__ = "detalles_pedido"

    # Clave primaria.
    id: Optional[int] = Field(default=None, primary_key=True)

    # Pedido al que pertenece esta línea.
    pedido_id: int = Field(
        foreign_key="pedidos.id",
        index=True
    )

    # Producto asociado a la línea.
    producto_id: int = Field(
        foreign_key="productos.id",
        index=True
    )

    # Cantidad comprada.
    cantidad: int = Field(ge=1)

    # Copia del nombre del producto al realizar la compra.
    nombre_producto: str

    # Copia del precio unitario al realizar la compra.
    precio_unitario: float = Field(ge=0)

    # Resultado de precio_unitario * cantidad.
    subtotal: float = Field(ge=0)

    # Relación N:1 con Pedido.
    pedido: Optional["Pedido"] = Relationship(
        back_populates="items"
    )

    # Relación N:1 con Producto.
    producto: Optional["Producto"] = Relationship(
        back_populates="detalles"
    )
