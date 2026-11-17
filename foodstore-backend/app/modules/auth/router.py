from fastapi import APIRouter, Depends, Response, status
from fastapi.security import OAuth2PasswordRequestForm

from app.core.config import settings
from app.core.deps import get_current_active_user
from app.modules.auth.service import AuthService
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UserCreate, UserPublic


router = APIRouter(
    prefix="/auth",
    tags=["Autenticación"]
)


def get_auth_service() -> AuthService:
    """Construye el servicio de autenticación."""
    return AuthService()


@router.post(
    "/register",
    response_model=UserPublic,
    status_code=status.HTTP_201_CREATED
)
def register(
    data: UserCreate,
    service: AuthService = Depends(get_auth_service)
):
    """Registra una nueva cuenta de usuario."""
    return service.register(data)


@router.post("/login")
def login(
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends(),
    service: AuthService = Depends(get_auth_service)
):
    """
    Inicia sesión y establece el JWT en una cookie HttpOnly.

    OAuth2PasswordRequestForm recibe los campos username y password.
    """

    token = service.login(
        username=form_data.username,
        password=form_data.password
    )

    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=False,  # En producción, utilizar HTTPS y secure=True.
        samesite="lax",
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/"
    )

    return {"message": "Inicio de sesión exitoso"}


@router.post("/logout")
def logout(response: Response):
    """Cierra la sesión eliminando la cookie de autenticación."""

    response.delete_cookie(
        key="access_token",
        httponly=True,
        secure=False,
        samesite="lax",
        path="/"
    )

    return {"message": "Sesión cerrada correctamente"}


@router.get("/me", response_model=UserPublic)
def get_me(
    usuario: Usuario = Depends(get_current_active_user)
):
    """Devuelve los datos del usuario autenticado."""
    return usuario