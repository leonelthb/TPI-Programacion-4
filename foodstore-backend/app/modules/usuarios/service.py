
from typing import List

from app.core.security import get_password_hash
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UserCreate, UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


class UsuarioNoEncontrado(Exception):
    """Se utiliza cuando no existe el usuario solicitado."""
    pass


class UsuarioDuplicado(Exception):
    """Se utiliza cuando el username o email ya están registrados."""
    pass


class AutoDeshabilitacionNoPermitida(Exception):
    """Se utiliza cuando un administrador intenta deshabilitarse a sí mismo."""
    pass


class UsuarioService:
    """
    Contiene la lógica de negocio relacionada con los usuarios.

    Utiliza UnitOfWork para controlar las operaciones
    de persistencia y mantener las transacciones.
    """

    def __init__(self, uow: UsuarioUnitOfWork):
        self.uow = uow

    def create(self, data: UserCreate) -> UserPublic:
        """Registra un usuario nuevo."""

        with self.uow as uow:

            # Verificamos que el nombre de usuario no esté ocupado.
            if uow.usuarios.get_by_username(data.username):
                raise UsuarioDuplicado("El nombre de usuario ya está registrado")

            # Verificamos que el correo electrónico no esté ocupado.
            if uow.usuarios.get_by_email(data.email):
                raise UsuarioDuplicado("El email ya está registrado")

            # Nunca almacenamos la contraseña original.
            usuario = Usuario(
                username=data.username,
                full_name=data.full_name,
                email=data.email,
                hashed_password=get_password_hash(data.password),
                role="user",
                disabled=False
            )

            usuario = uow.usuarios.add(usuario)

            # Convertimos el modelo en un schema público.
            return UserPublic.model_validate(usuario)

    def get_by_id(self, usuario_id: int) -> UserPublic:
        """Busca un usuario por su identificador."""

        with self.uow as uow:
            usuario = uow.usuarios.get_by_id(usuario_id)

            if usuario is None:
                raise UsuarioNoEncontrado("Usuario no encontrado")

            return UserPublic.model_validate(usuario)

    def get_all(self) -> List[UserPublic]:
        """Obtiene todos los usuarios registrados."""

        with self.uow as uow:
            usuarios = uow.usuarios.get_all()

            return [
                UserPublic.model_validate(usuario)
                for usuario in usuarios
            ]

    def set_disabled(
        self,
        usuario_id: int,
        disabled: bool,
        usuario_actual_id: int
    ) -> UserPublic:
        """Activa o desactiva una cuenta sin eliminarla."""

        with self.uow as uow:
            usuario = uow.usuarios.get_by_id(usuario_id)

            if usuario is None:
                raise UsuarioNoEncontrado("Usuario no encontrado")

            # Impedimos que el administrador deshabilite su propia cuenta.
            if disabled and usuario_id == usuario_actual_id:
                raise AutoDeshabilitacionNoPermitida(
                    "No podés deshabilitar tu propia cuenta"
                )

            usuario.disabled = disabled

            return UserPublic.model_validate(usuario)
