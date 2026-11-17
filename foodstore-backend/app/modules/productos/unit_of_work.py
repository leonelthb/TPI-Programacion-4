from app.core.unit_of_work import UnitOfWork

from app.modules.productos.repository import ProductoRepository
from app.modules.categorias.repository import CategoriaRepository


class ProductoUnitOfWork(UnitOfWork):
    """
    Unit of Work del módulo Productos.

    Administra los repositorios de productos y categorías
    utilizando una única sesión y una única transacción.
    """

    def __enter__(self):
        # Abre la sesión mediante el UnitOfWork base.
        super().__enter__()

        # Ambos repositorios comparten la misma sesión.
        self.productos = ProductoRepository(self.session)
        self.categorias = CategoriaRepository(self.session)

        return self