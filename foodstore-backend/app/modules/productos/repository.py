
from typing import Optional

from sqlalchemy import case, func
from sqlalchemy.orm import selectinload
from sqlmodel import select

from app.core.base_repository import BaseRepository
from app.modules.productos.models import Producto
from app.modules.categorias.models import Categoria


class ProductoRepository(BaseRepository[Producto]):
    """Consultas específicas para productos."""

    def __init__(self, session):
        super().__init__(session, Producto)

    def get_by_nombre(self, nombre: str) -> Optional[Producto]:
        """Busca un producto por su nombre."""

        statement = select(Producto).where(
            func.lower(Producto.nombre) == nombre.lower()
        )

        return self.session.exec(statement).first()

    def get_catalog(
        self,
        skip: int = 0,
        limit: int = 20,
        search: Optional[str] = None,
        categoria_id: Optional[int] = None,
        disponible: Optional[bool] = None,
        activo: Optional[bool] = True
    ) -> tuple[int, list[Producto]]:
        """
        Obtiene productos aplicando filtros y paginación.

        Por defecto devuelve solamente productos activos.
        El administrador puede solicitar activos, inactivos o todos.
        """

        # Consulta base.
        statement = select(Producto)

        # Filtro por estado de actividad.
        # True: activos. False: inactivos. None: todos.
        if activo is not None:
            statement = statement.where(
                Producto.activo == activo
            )

        # Filtro por nombre.
        if search:
            statement = statement.where(
                Producto.nombre.ilike(f"%{search}%")
            )

        # Filtro por categoría.
        if categoria_id is not None:
            statement = statement.where(
                Producto.categoria_id == categoria_id
            )

        # Filtro por disponibilidad.
        if disponible is not None:
            statement = statement.where(
                Producto.disponible == disponible
            )

        # Calculamos el total antes de aplicar la paginación.
        count_statement = select(func.count()).select_from(
            statement.subquery()
        )

        total = self.session.exec(count_statement).one()

        # Definimos el orden de las categorías del negocio.
        orden_categorias = case(
            (Categoria.nombre == "Hamburguesas", 1),
            (Categoria.nombre == "Pizzas", 2),
            (Categoria.nombre == "Empanadas", 3),
            (Categoria.nombre == "Acompañamientos", 4),
            (Categoria.nombre == "Bebidas", 5),
            else_=99
        )

        # Obtenemos los productos ordenados por categoría
        # y alfabéticamente dentro de cada categoría.
        products_statement = (
            statement
            .join(
                Categoria,
                Producto.categoria_id == Categoria.id
            )
            .options(selectinload(Producto.categoria))
            .order_by(
                orden_categorias,
                Producto.nombre,
                Producto.id
            )
            .offset(skip)
            .limit(limit)
        )

        productos = list(
            self.session.exec(products_statement).all()
        )

        return total, productos
