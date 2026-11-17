
from typing import Optional

from sqlalchemy import case
from sqlmodel import Session, select

from app.core.base_repository import BaseRepository
from app.modules.categorias.models import Categoria


class CategoriaRepository(BaseRepository[Categoria]):
    """
    Repositorio encargado del acceso a datos de Categoria.
    """

    def __init__(self, session: Session):
        super().__init__(session, Categoria)

    def get_by_nombre(self, nombre: str) -> Optional[Categoria]:
        """Busca una categoría por su nombre."""

        statement = select(Categoria).where(
            Categoria.nombre == nombre
        )

        return self.session.exec(statement).first()

    def get_all(self) -> list[Categoria]:
        """Obtiene todas las categorías en un orden personalizado."""

        # Definimos el orden de las categorías del negocio.
        orden_categorias = case(
            (Categoria.nombre == "Hamburguesas", 1),
            (Categoria.nombre == "Pizzas", 2),
            (Categoria.nombre == "Empanadas", 3),
            (Categoria.nombre == "Acompañamientos", 4),
            (Categoria.nombre == "Bebidas", 5),
            else_=99
        )

        statement = (
            select(Categoria)
            .order_by(
                orden_categorias,
                Categoria.nombre,
                Categoria.id
            )
        )

        return list(self.session.exec(statement).all())
