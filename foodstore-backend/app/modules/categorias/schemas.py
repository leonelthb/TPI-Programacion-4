
from typing import Optional

from sqlmodel import Field, SQLModel


class CategoriaCreate(SQLModel):
    """
    Datos necesarios para crear una categoría.
    """

    nombre: str = Field(min_length=2, max_length=100)
    descripcion: Optional[str] = None


class CategoriaUpdate(SQLModel):
    """
    Campos modificables de una categoría.

    Los campos son opcionales para permitir actualizar
    solamente los datos enviados.
    """

    nombre: Optional[str] = Field(
        default=None,
        min_length=2,
        max_length=100
    )

    descripcion: Optional[str] = None


class CategoriaRead(SQLModel):
    """
    Datos públicos que devuelve la API.
    """

    id: int
    nombre: str
    descripcion: Optional[str] = None
    activo: bool
