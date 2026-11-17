
from datetime import datetime, timezone
from typing import TYPE_CHECKING, Optional

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.modules.pedidos.models import Pedido


class Usuario(SQLModel, table=True):
    """
    Representa un usuario registrado en Food Store.
    """

    __tablename__ = "usuarios"

    # Clave primaria.
    id: Optional[int] = Field(default=None, primary_key=True)

    # Nombre de usuario único.
    username: str = Field(unique=True, index=True)

    # Nombre completo.
    full_name: str

    # Correo electrónico único.
    email: str = Field(unique=True, index=True)

    # Contraseña almacenada mediante hash bcrypt.
    hashed_password: str

    # El registro público crea usuarios con el rol user.
    role: str = Field(default="user")

    # Baja lógica de acceso a la cuenta.
    disabled: bool = Field(default=False)

    # Fecha de creación.
    created_at: datetime = Field(
    default_factory=lambda: datetime.now(timezone.utc)
)
    # Relación 1:N: un usuario puede realizar varios pedidos.
    pedidos: list["Pedido"] = Relationship(
        back_populates="usuario"
    )
