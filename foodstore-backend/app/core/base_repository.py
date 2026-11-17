
from typing import Generic, Optional, Type, TypeVar

from sqlmodel import SQLModel, Session, select


# Tipo genérico: representa cualquiera de nuestros modelos SQLModel.
ModelType = TypeVar("ModelType", bound=SQLModel)


class BaseRepository(Generic[ModelType]):
    """
    Proporciona operaciones genéricas de acceso a datos.

    Cada repositorio concreto recibe el modelo que administra
    y utiliza la sesión proporcionada por el UnitOfWork.
    """

    def __init__(self, session: Session, model: Type[ModelType]):
        self.session = session
        self.model = model

    def get_by_id(self, entity_id: int) -> Optional[ModelType]:
        """Busca un registro por su clave primaria."""

        return self.session.get(self.model, entity_id)

    def get_all(
        self,
        skip: int = 0,
        limit: int = 100
    ) -> list[ModelType]:
        """Obtiene un listado paginado de registros."""

        statement = (
            select(self.model)
            .offset(skip)
            .limit(limit)
        )

        return list(self.session.exec(statement).all())

    def add(self, entity: ModelType) -> ModelType:
        """Agrega una entidad a la sesión actual."""

        self.session.add(entity)

        # Envía la operación a la base de datos sin confirmar
        # la transacción. El commit corresponde al UnitOfWork.
        self.session.flush()

        return entity

    def delete(self, entity: ModelType) -> None:
        """Elimina físicamente una entidad de la sesión."""

        self.session.delete(entity)
