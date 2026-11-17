from typing import Optional

from sqlmodel import Field, SQLModel

from app.modules.categorias.schemas import CategoriaRead


class ProductoCreate(SQLModel):
    """Datos necesarios para crear un producto."""

    nombre: str = Field(min_length=2, max_length=150)
    descripcion: Optional[str] = None
    precio_base: float = Field(ge=0)
    imagen_url: Optional[str] = None
    stock: int = Field(default=0, ge=0)
    disponible: bool = True
    categoria_id: int = Field(gt=0)


class ProductoUpdate(SQLModel):
    """Permite actualizar parcialmente un producto."""

    nombre: Optional[str] = Field(default=None, min_length=2, max_length=150)
    descripcion: Optional[str] = None
    precio_base: Optional[float] = Field(default=None, ge=0)
    imagen_url: Optional[str] = None
    stock: Optional[int] = Field(default=None, ge=0)
    disponible: Optional[bool] = None
    categoria_id: Optional[int] = Field(default=None, gt=0)


class ProductoRead(SQLModel):
    """Datos que se devuelven al consultar un producto."""

    id: int
    nombre: str
    descripcion: Optional[str] = None
    precio_base: float
    imagen_url: Optional[str] = None
    stock: int
    disponible: bool
    activo: bool
    categoria: CategoriaRead


class ProductoStockUpdate(SQLModel):
    """Datos para modificar el stock de un producto."""

    stock: int = Field(ge=0)
    disponible: bool


class ProductosPaginados(SQLModel):
    """Respuesta paginada del catálogo."""

    total: int
    items: list[ProductoRead]