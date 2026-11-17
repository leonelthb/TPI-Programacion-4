
from app.core.unit_of_work import UnitOfWork
from app.modules.pedidos.repository import PedidoRepository
from app.modules.productos.repository import ProductoRepository


class PedidoUnitOfWork(UnitOfWork):
    """
    Unit of Work específico del módulo de pedidos.

    Administra los repositorios de pedidos y productos
    utilizando una única sesión de base de datos.

    Esto permite que la creación del pedido y el descuento
    del stock formen parte de la misma transacción.
    """

    def __init__(self):
        super().__init__()

        self.pedidos = None
        self.productos = None

    def __enter__(self):
        # Abre una única sesión mediante la clase base.
        super().__enter__()

        # Ambos repositorios comparten la misma sesión.
        self.pedidos = PedidoRepository(self.session)
        self.productos = ProductoRepository(self.session)

        return self
