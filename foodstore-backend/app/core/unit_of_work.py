
from typing import Optional

from sqlmodel import Session

from app.core.database import session_factory


class UnitOfWork:
    """
    Administra el ciclo de vida de una sesión de base de datos.

    - Abre la sesión al ingresar al contexto.
    - Confirma los cambios si no hubo errores.
    - Revierte los cambios si ocurrió una excepción.
    - Cierra la sesión al salir del contexto.
    """

    def __init__(self):
        self.session: Optional[Session] = None

    def __enter__(self):
        # Crea una sesión nueva para esta operación.
        self.session = session_factory()

        return self

    def __exit__(self, exc_type, exc_value, traceback):
        try:
            if exc_type is None:
                # Si todo salió bien, confirma la transacción.
                self.session.commit()
            else:
                # Si ocurrió un error, revierte los cambios.
                self.session.rollback()

        except Exception:
            # Si falla el commit, también intentamos revertir.
            self.session.rollback()
            raise

        finally:
            # La sesión siempre debe cerrarse.
            self.session.close()
            self.session = None

        # Permite que las excepciones sigan propagándose.
        return False
