from fastapi import HTTPException, status

from app.core.security import (
    create_access_token,
    verify_password
)

from app.modules.usuarios.service import (
    UsuarioService,
    UsuarioDuplicado
)
from app.modules.usuarios.schemas import UserCreate, UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


class AuthService:
    """
    Gestiona las operaciones de autenticación.

    El registro delega la creación del usuario al UsuarioService.
    El login valida las credenciales y genera un JWT.
    """

    def register(self, data: UserCreate) -> UserPublic:
        """Registra una cuenta nueva."""

        usuario_service = UsuarioService(UsuarioUnitOfWork())

        try:
            return usuario_service.create(data)
        except UsuarioDuplicado:
            # El usuario o email ya existe.
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="El usuario o email ya está registrado"
            )

    def login(self, username: str, password: str) -> str:
        """
        Valida las credenciales y devuelve un token JWT.

        El token se entregará posteriormente mediante una
        cookie HttpOnly desde el Router.
        """

        uow = UsuarioUnitOfWork()

        with uow as transaction:
            usuario = transaction.usuarios.get_by_username(username)

            # No revelamos si falló el usuario o la contraseña.
            if usuario is None or not verify_password(
                password,
                usuario.hashed_password
            ):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Usuario o contraseña incorrectos"
                )

            if usuario.disabled:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="La cuenta está desactivada"
                )

            # El username será el identificador del usuario en el JWT.
            token = create_access_token(subject=usuario.username)

            return token