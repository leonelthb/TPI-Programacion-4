
from typing import Optional

from sqlmodel import Session, select

from app.core.base_repository import BaseRepository
from app.modules.usuarios.models import Usuario


class UsuarioRepository(BaseRepository[Usuario]):
    """
    Repositorio encargado del acceso a datos de Usuario.

    Agrega búsquedas específicas por username y email.
    """

    def __init__(self, session: Session):
        super().__init__(session, Usuario)

    def get_by_username(self, username: str) -> Optional[Usuario]:
        """Busca un usuario por su nombre de usuario."""

        statement = select(Usuario).where(
            Usuario.username == username
        )

        return self.session.exec(statement).first()

    def get_by_email(self, email: str) -> Optional[Usuario]:
        """Busca un usuario por su correo electrónico."""

        statement = select(Usuario).where(
            Usuario.email == email
        )

        return self.session.exec(statement).first()
