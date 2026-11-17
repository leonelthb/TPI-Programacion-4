
from app.core.unit_of_work import UnitOfWork
from app.modules.categorias.repository import CategoriaRepository


class CategoriaUnitOfWork(UnitOfWork):
    """
    Unit of Work específico del módulo de categorías.

    Proporciona acceso al repositorio de categorías
    utilizando la sesión administrada por la clase base.
    """

    def __init__(self):
        super().__init__()

        # Repositorio disponible durante la transacción.
        self.categorias = None

    def __enter__(self):
        # Abre la sesión mediante el UnitOfWork base.
        super().__enter__()

        # Crea el repositorio utilizando esa misma sesión.
        self.categorias = CategoriaRepository(self.session)

        return self
