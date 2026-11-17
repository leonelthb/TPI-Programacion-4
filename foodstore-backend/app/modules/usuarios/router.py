
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import SQLModel

from app.core.deps import require_role
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.service import (
    UsuarioService,
    UsuarioNoEncontrado,
    AutoDeshabilitacionNoPermitida,
)
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


router = APIRouter(
    prefix="/usuarios",
    tags=["Usuarios"]
)


def get_usuario_service() -> UsuarioService:
    """Construye el Service con su Unit of Work."""
    return UsuarioService(UsuarioUnitOfWork())


class UserStatusUpdate(SQLModel):
    """Datos necesarios para cambiar el estado de una cuenta."""
    disabled: bool


@router.get("/", response_model=list[UserPublic])
def get_usuarios(
    usuario: Usuario = Depends(require_role(["admin"])),
    service: UsuarioService = Depends(get_usuario_service)
):
    """Lista todos los usuarios registrados."""
    return service.get_all()


@router.get("/{usuario_id}", response_model=UserPublic)
def get_usuario(
    usuario_id: int,
    usuario: Usuario = Depends(require_role(["admin"])),
    service: UsuarioService = Depends(get_usuario_service)
):
    """Obtiene un usuario por su identificador."""
    try:
        return service.get_by_id(usuario_id)

    except UsuarioNoEncontrado as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error)
        )


@router.patch("/{usuario_id}/estado", response_model=UserPublic)
def update_usuario_estado(
    usuario_id: int,
    data: UserStatusUpdate,
    usuario: Usuario = Depends(require_role(["admin"])),
    service: UsuarioService = Depends(get_usuario_service)
):
    """Activa o desactiva una cuenta de usuario."""
    try:
        return service.set_disabled(
            usuario_id=usuario_id,
            disabled=data.disabled,
            usuario_actual_id=usuario.id
        )

    except UsuarioNoEncontrado as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error)
        )

    except AutoDeshabilitacionNoPermitida as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error)
        )
