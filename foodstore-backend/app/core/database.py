
from sqlmodel import Session, SQLModel, create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import settings


# Motor principal de conexión con PostgreSQL.
engine = create_engine(
    settings.DATABASE_URL,
    echo=False,
    pool_pre_ping=True
)


# Fábrica centralizada para crear sesiones de base de datos.
session_factory = sessionmaker(
    bind=engine,
    class_=Session,
    expire_on_commit=False
)


def create_all_tables() -> None:
    """
    Crea las tablas registradas en SQLModel.metadata.

    Los modelos deben estar importados antes de ejecutar
    esta función para que SQLModel conozca las entidades.
    """
    SQLModel.metadata.create_all(engine)
