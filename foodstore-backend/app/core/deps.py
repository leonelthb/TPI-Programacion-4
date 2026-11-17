
from typing import Callable
from jose import JWTError
from fastapi import Depends, HTTPException, Request, status

from app.core.database import session_factory
from app.core.security import decode_access_token
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.repository import UsuarioRepository


def get_current_user(request: Request) -> Usuario:
    """
    Identifica al usuario mediante el JWT de la cookie.

    Comprueba la validez del token y busca al usuario
    correspondiente en la base de datos.
    """

    # Recuperamos el JWT de la cookie HttpOnly.
    token = request.cookies.get("access_token")

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No autenticado",
            headers={"WWW-Authenticate": "Bearer"}
        )

    try:
        # Decodificamos y validamos el token.
        payload = decode_access_token(token)

        # El campo sub identifica al usuario.
        username = payload.get("sub")

        if not username:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token inválido",
                headers={"WWW-Authenticate": "Bearer"}
            )

    except HTTPException:
        raise

    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado",
            headers={"WWW-Authenticate": "Bearer"}
        )

    # Buscamos el usuario en la base de datos.
    session = session_factory()

    try:
        repository = UsuarioRepository(session)
        usuario = repository.get_by_username(username)

        if usuario is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuario inexistente"
            )

        return usuario

    finally:
        session.close()


def get_current_active_user(
    usuario: Usuario = Depends(get_current_user)
) -> Usuario:
    """
    Comprueba que la cuenta del usuario esté habilitada.
    """

    if usuario.disabled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La cuenta está desactivada"
        )

    return usuario


def require_role(roles: list[str]) -> Callable:
    """
    Crea una dependencia que permite el acceso
    únicamente a los roles indicados.
    """

    def verificar_rol(
        usuario: Usuario = Depends(get_current_active_user)
    ) -> Usuario:

        if usuario.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tenés permisos para realizar esta operación"
            )

        return usuario

    return verificar_rol
