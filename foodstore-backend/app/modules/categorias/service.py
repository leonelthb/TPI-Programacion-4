
from app.modules.categorias.models import Categoria
from app.modules.categorias.schemas import (
    CategoriaCreate,
    CategoriaUpdate,
    CategoriaRead,
)
from app.modules.categorias.unit_of_work import CategoriaUnitOfWork


class CategoriaNoEncontrada(Exception):
    """Se produce cuando una categoría no existe o está inactiva."""


class CategoriaDuplicada(Exception):
    """Se produce cuando el nombre ya pertenece a otra categoría."""


class CategoriaService:
    """
    Contiene las reglas de negocio del módulo de categorías.

    No ejecuta consultas directamente: utiliza el repositorio
    mediante CategoriaUnitOfWork.
    """

    def __init__(self, uow: CategoriaUnitOfWork):
        self.uow = uow

    # LISTAR CATEGORÍAS ACTIVAS
    def get_all(self) -> list[CategoriaRead]:
        """Devuelve únicamente las categorías activas."""

        with self.uow as uow:
            categorias = uow.categorias.get_all()

            return [
                CategoriaRead.model_validate(categoria)
                for categoria in categorias
                if categoria.activo
            ]

    # LISTAR CATEGORÍAS PARA ADMINISTRACIÓN
    def get_all_admin(
        self,
        activo: bool | None = None,
    ) -> list[CategoriaRead]:
        """
        Devuelve categorías para el panel administrativo.

        activo=True: categorías activas.
        activo=False: categorías inactivas.
        activo=None: todas las categorías.
        """

        with self.uow as uow:
            categorias = uow.categorias.get_all()

            if activo is not None:
                categorias = [
                    categoria
                    for categoria in categorias
                    if categoria.activo == activo
                ]

            return [
                CategoriaRead.model_validate(categoria)
                for categoria in categorias
            ]

    # OBTENER POR ID
    def get_by_id(self, categoria_id: int) -> CategoriaRead:
        """Obtiene una categoría activa por su ID."""

        with self.uow as uow:
            categoria = uow.categorias.get_by_id(categoria_id)

            if categoria is None or not categoria.activo:
                raise CategoriaNoEncontrada()

            return CategoriaRead.model_validate(categoria)

    # CREAR CATEGORÍA
    def create(self, data: CategoriaCreate) -> CategoriaRead:
        """Crea una categoría nueva."""

        with self.uow as uow:
            existente = uow.categorias.get_by_nombre(data.nombre)

            if existente is not None:
                raise CategoriaDuplicada()

            categoria = Categoria(**data.model_dump())

            uow.categorias.add(categoria)

            return CategoriaRead.model_validate(categoria)

    # ACTUALIZAR CATEGORÍA
    def update(
        self,
        categoria_id: int,
        data: CategoriaUpdate,
    ) -> CategoriaRead:
        """Actualiza los campos enviados de una categoría."""

        with self.uow as uow:
            categoria = uow.categorias.get_by_id(categoria_id)

            if categoria is None or not categoria.activo:
                raise CategoriaNoEncontrada()

            cambios = data.model_dump(exclude_unset=True)

            # Comprobamos el nombre únicamente si fue enviado.
            if "nombre" in cambios:
                existente = uow.categorias.get_by_nombre(
                    cambios["nombre"]
                )

                if existente is not None and existente.id != categoria_id:
                    raise CategoriaDuplicada()

            # Aplicamos solamente los campos recibidos.
            for campo, valor in cambios.items():
                setattr(categoria, campo, valor)

            uow.session.add(categoria)

            return CategoriaRead.model_validate(categoria)

    # ELIMINAR CATEGORÍA (BAJA LÓGICA)
    def delete(self, categoria_id: int) -> None:
        """Realiza la baja lógica de una categoría."""

        with self.uow as uow:
            categoria = uow.categorias.get_by_id(categoria_id)

            if categoria is None or not categoria.activo:
                raise CategoriaNoEncontrada()

            # No eliminamos el registro físicamente.
            categoria.activo = False

            uow.session.add(categoria)



