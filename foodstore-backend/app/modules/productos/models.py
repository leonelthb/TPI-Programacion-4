


from typing import TYPE_CHECKING, Optional

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.modules.categorias.models import Categoria
    from app.modules.pedidos.models import DetallePedido


class Producto(SQLModel, table=True):
    """
    Representa un producto perteneciente a una categoría.

    El producto puede estar activo o inactivo y también
    puede habilitarse o deshabilitarse para la venta.
    """

    __tablename__ = "productos"

    # Clave primaria autoincremental.
    id: Optional[int] = Field(default=None, primary_key=True)

    # Clave foránea: identifica la categoría del producto.
    categoria_id: int = Field(
        foreign_key="categorias.id",
        index=True
    )

    nombre: str
    descripcion: Optional[str] = Field(default=None)

    # Precio base obligatorio y no negativo.
    precio_base: float = Field(ge=0)

    imagen_url: Optional[str] = Field(default=None)

    # Stock inicial en cero; nunca puede ser negativo.
    stock: int = Field(default=0, ge=0)

    # Indica si el producto puede venderse.
    disponible: bool = Field(default=True)

    # Baja lógica del producto.
    activo: bool = Field(default=True)

    # Relación N:1 con Categoria.
    categoria: Optional["Categoria"] = Relationship(
        back_populates="productos"
    )

    # Relación 1:N: un producto puede aparecer en varios detalles.
    detalles: list["DetallePedido"] = Relationship(
        back_populates="producto"
    )
