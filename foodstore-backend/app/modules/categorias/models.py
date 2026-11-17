


from typing import TYPE_CHECKING, Optional, List

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.modules.productos.models import Producto


class Categoria(SQLModel, table=True):
    """
    Representa una categoría del catálogo.

    Una categoría puede agrupar varios productos.
    La baja es lógica mediante el campo activo.
    """

    __tablename__ = "categorias"

    # Clave primaria autoincremental.
    id: Optional[int] = Field(default=None, primary_key=True)

    # Nombre obligatorio, único y de entre 2 y 100 caracteres.
    nombre: str = Field(
        min_length=2,
        max_length=100,
        unique=True,
        index=True
    )

    # Descripción opcional.
    descripcion: Optional[str] = Field(default=None)

    # Baja lógica: una categoría inactiva no se elimina físicamente.
    activo: bool = Field(default=True)

    # Relación 1:N: una categoría puede tener muchos productos.
    productos: List["Producto"] = Relationship(
        back_populates="categoria"
    )
