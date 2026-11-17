from typing import Optional

from app.modules.productos.models import Producto
from app.modules.productos.schemas import (
    ProductoCreate,
    ProductoUpdate,
    ProductoRead,
    ProductoStockUpdate,
    ProductosPaginados
)
from app.modules.productos.unit_of_work import ProductoUnitOfWork
from app.modules.categorias.schemas import CategoriaRead


# Excepciones específicas del módulo.
class ProductoNoEncontrado(Exception):
    pass


class ProductoDuplicado(Exception):
    pass


class ProductoAnulado(Exception):
    pass


class CategoriaNoValida(Exception):
    pass


class ProductoService:
    """
    Contiene las reglas de negocio del módulo Productos.
    No realiza consultas SQL directamente: utiliza el Unit of Work.
    """

    def __init__(self, uow: ProductoUnitOfWork):
        self.uow = uow

    def _to_read(self, producto: Producto) -> ProductoRead:
        """Convierte el modelo en su schema de respuesta."""

        return ProductoRead(
            id=producto.id,
            nombre=producto.nombre,
            descripcion=producto.descripcion,
            precio_base=producto.precio_base,
            imagen_url=producto.imagen_url,
            stock=producto.stock,
            disponible=producto.disponible,
            activo=producto.activo,
            categoria=CategoriaRead.model_validate(
                producto.categoria
            )
        )


    def get_all(
        self,
        skip: int = 0,
        limit: int = 20,
        search: Optional[str] = None,
        categoria_id: Optional[int] = None,
        disponible: Optional[bool] = None,
        activo: Optional[bool] = True
    ) -> ProductosPaginados:
        """Lista productos aplicando filtros y paginación."""

        with self.uow as uow:
            total, productos = uow.productos.get_catalog(
                skip=skip,
                limit=limit,
                search=search,
                categoria_id=categoria_id,
                disponible=disponible,
                activo=activo
            )

            return ProductosPaginados(
                total=total,
                items=[
                    self._to_read(producto)
                    for producto in productos
                ]
            )

    def get_by_id(self, producto_id: int) -> ProductoRead:
        """Obtiene un producto activo por su identificador."""

        with self.uow as uow:
            producto = uow.productos.get_by_id(producto_id)

            if producto is None:
                raise ProductoNoEncontrado()

            if not producto.activo:
                raise ProductoAnulado()

            return self._to_read(producto)

    def create(self, data: ProductoCreate) -> ProductoRead:
        """Registra un producto asociado a una categoría activa."""

        with self.uow as uow:
            categoria = uow.categorias.get_by_id(data.categoria_id)

            if categoria is None:
                raise CategoriaNoValida()

            if not categoria.activo:
                raise CategoriaNoValida()

            existente = uow.productos.get_by_nombre(data.nombre)

            if existente is not None and existente.activo:
                raise ProductoDuplicado()

            producto = Producto(**data.model_dump())

            uow.productos.add(producto)

            # Cargamos la relación para construir la respuesta.
            producto.categoria = categoria

            return self._to_read(producto)

    def update(
        self,
        producto_id: int,
        data: ProductoUpdate
    ) -> ProductoRead:
        """Actualiza los campos enviados de un producto."""

        with self.uow as uow:
            producto = uow.productos.get_by_id(producto_id)

            if producto is None:
                raise ProductoNoEncontrado()

            if not producto.activo:
                raise ProductoAnulado()

            cambios = data.model_dump(exclude_unset=True)

            if "nombre" in cambios:
                existente = uow.productos.get_by_nombre(
                    cambios["nombre"]
                )

                if (
                    existente is not None
                    and existente.id != producto_id
                    and existente.activo
                ):
                    raise ProductoDuplicado()

            if "categoria_id" in cambios:
                categoria = uow.categorias.get_by_id(
                    cambios["categoria_id"]
                )

                if categoria is None or not categoria.activo:
                    raise CategoriaNoValida()

            for campo, valor in cambios.items():
                setattr(producto, campo, valor)

            uow.session.flush()

            return self._to_read(producto)

    def update_stock(
        self,
        producto_id: int,
        data: ProductoStockUpdate
    ) -> ProductoRead:
        """Actualiza el stock y la disponibilidad."""

        with self.uow as uow:
            producto = uow.productos.get_by_id(producto_id)

            if producto is None:
                raise ProductoNoEncontrado()

            if not producto.activo:
                raise ProductoAnulado()

            producto.stock = data.stock
            producto.disponible = data.disponible

            uow.session.flush()

            return self._to_read(producto)

    def delete(self, producto_id: int) -> None:
        """Realiza la baja lógica de un producto."""

        with self.uow as uow:
            producto = uow.productos.get_by_id(producto_id)

            if producto is None:
                raise ProductoNoEncontrado()

            if not producto.activo:
                raise ProductoAnulado()

            producto.activo = False