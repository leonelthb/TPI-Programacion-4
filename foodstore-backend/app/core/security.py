
from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings


# Configuración del algoritmo de hash de contraseñas.
pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)


def get_password_hash(password: str) -> str:
    """Genera el hash de una contraseña."""
    return pwd_context.hash(password)


def verify_password(
    plain_password: str,
    hashed_password: str
) -> bool:
    """Comprueba una contraseña contra su hash."""
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(
    subject: str,
    expires_delta: timedelta | None = None
) -> str:
    """
    Genera un JWT firmado.

    El subject identifica al usuario y el token incluye
    su fecha de expiración.
    """

    # Evitamos generar tokens sin identificar al usuario.
    if not subject.strip():
        raise ValueError("El identificador del usuario no puede estar vacío")

    # Calculamos la fecha de expiración en UTC.
    expire = datetime.now(timezone.utc) + (
        expires_delta
        or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    # Construimos el contenido del token.
    payload = {
        "sub": subject,
        "exp": expire
    }

    # Firmamos el JWT con nuestra clave secreta.
    return jwt.encode(
        payload,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM
    )

def decode_access_token(token: str) -> dict:
    """
    Valida la firma y expiración de un JWT.

    Si el token no es válido, devuelve una excepción JWTError.
    """

    return jwt.decode(
        token,
        settings.SECRET_KEY,
        algorithms=[settings.ALGORITHM]
    )
