
from app.core.unit_of_work import UnitOfWork
from app.modules.usuarios.repository import UsuarioRepository


class UsuarioUnitOfWork(UnitOfWork):
    """
    Unit of Work específico del módulo de usuarios.

    Proporciona el repositorio de usuarios utilizando
    la sesión administrada por la clase base.
    """

    def __init__(self):
        super().__init__()

        self.usuarios = None

    def __enter__(self):
        # Abre la sesión de base de datos.
        super().__enter__()

        # Inicializa el repositorio con esa misma sesión.
        self.usuarios = UsuarioRepository(self.session)

        return self
