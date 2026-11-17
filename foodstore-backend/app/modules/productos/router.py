from typing import Optional

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
    Response,
    status
)

from app.core.deps import require_role
from app.modules.productos.schemas import (
    ProductoCreate,
    ProductoUpdate,
    ProductoRead,
    ProductoStockUpdate,
    ProductosPaginados
)
from app.modules.productos.service import (
    ProductoService,
    ProductoNoEncontrado,
    ProductoDuplicado,
    ProductoAnulado,
    CategoriaNoValida
)
from app.modules.productos.unit_of_work import ProductoUnitOfWork


# Router principal del módulo.
router = APIRouter(
    prefix="/productos",
    tags=["Productos"]
)


def get_producto_service() -> ProductoService:
    """Construye el servicio con su Unit of Work."""

    return ProductoService(ProductoUnitOfWork())


# LISTAR PRODUCTOS
@router.get("/", response_model=ProductosPaginados)
def listar_productos(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    search: Optional[str] = Query(default=None),
    categoria_id: Optional[int] = Query(default=None, ge=1),
    disponible: Optional[bool] = Query(default=None),
    service: ProductoService = Depends(get_producto_service)
):
    """Lista productos activos con filtros y paginación."""

    return service.get_all(
        skip=skip,
        limit=limit,
        search=search,
        categoria_id=categoria_id,
        disponible=disponible
    )



# LISTAR PRODUCTOS PARA ADMINISTRACIÓN
@router.get("/admin/listado", response_model=ProductosPaginados)
def listar_productos_admin(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    search: Optional[str] = Query(default=None),
    categoria_id: Optional[int] = Query(default=None, ge=1),
    disponible: Optional[bool] = Query(default=None),
    activo: Optional[bool] = Query(default=None),
    service: ProductoService = Depends(get_producto_service),
    usuario=Depends(require_role(["admin"]))
):
    """Lista productos activos, inactivos o todos. Solo administradores."""

    return service.get_all(
        skip=skip,
        limit=limit,
        search=search,
        categoria_id=categoria_id,
        disponible=disponible,
        activo=activo
    )


# OBTENER PRODUCTO
@router.get("/{producto_id}", response_model=ProductoRead)
def obtener_producto(
    producto_id: int,
    service: ProductoService = Depends(get_producto_service)
):
    """Obtiene el detalle de un producto."""

    try:
        return service.get_by_id(producto_id)

    except ProductoNoEncontrado:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Producto no encontrado"
        )

    except ProductoAnulado:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Producto no encontrado"
        )


# CREAR PRODUCTO
@router.post(
    "/",
    response_model=ProductoRead,
    status_code=status.HTTP_201_CREATED
)
def crear_producto(
    data: ProductoCreate,
    service: ProductoService = Depends(get_producto_service),
    usuario=Depends(require_role(["admin"]))
):
    """Crea un producto. Requiere permisos de administrador."""

    try:
        return service.create(data)

    except CategoriaNoValida:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="La categoría no existe o está inactiva"
        )

    except ProductoDuplicado:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ya existe un producto activo con ese nombre"
        )


# ACTUALIZAR PRODUCTO
@router.put("/{producto_id}", response_model=ProductoRead)
def actualizar_producto(
    producto_id: int,
    data: ProductoUpdate,
    service: ProductoService = Depends(get_producto_service),
    usuario=Depends(require_role(["admin"]))
):
    """Actualiza los campos enviados de un producto."""

    try:
        return service.update(producto_id, data)

    except ProductoNoEncontrado:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Producto no encontrado"
        )

    except ProductoAnulado:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="No se puede actualizar un producto anulado"
        )

    except CategoriaNoValida:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="La categoría no existe o está inactiva"
        )

    except ProductoDuplicado:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ya existe un producto activo con ese nombre"
        )


# ACTUALIZAR STOCK
@router.patch("/{producto_id}/stock", response_model=ProductoRead)
def actualizar_stock(
    producto_id: int,
    data: ProductoStockUpdate,
    service: ProductoService = Depends(get_producto_service),
    usuario=Depends(require_role(["admin"]))
):
    """Actualiza el stock y la disponibilidad de un producto."""

    try:
        return service.update_stock(producto_id, data)

    except ProductoNoEncontrado:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Producto no encontrado"
        )

    except ProductoAnulado:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="No se puede modificar un producto anulado"
        )


# ELIMINAR PRODUCTO
@router.delete(
    "/{producto_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def eliminar_producto(
    producto_id: int,
    service: ProductoService = Depends(get_producto_service),
    usuario=Depends(require_role(["admin"]))
):
    """Realiza la baja lógica de un producto."""

    try:
        service.delete(producto_id)
        return Response(status_code=status.HTTP_204_NO_CONTENT)

    except ProductoNoEncontrado:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Producto no encontrado"
        )

    except ProductoAnulado:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="El producto ya se encuentra anulado"
        )