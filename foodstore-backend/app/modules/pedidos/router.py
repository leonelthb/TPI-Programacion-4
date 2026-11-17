
from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.deps import get_current_active_user, require_role
from app.modules.pedidos.service import (
    PedidoService,
    PedidoNoEncontrado,
    ProductoNoEncontrado,
    ProductoNoDisponible,
    StockInsuficiente,
    ProductoRepetido,
    TransicionInvalida,
    AccesoPedidoDenegado,
)
from app.modules.pedidos.schemas import (
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    CambioEstado,
    ResumenPedidos,
)
from app.modules.usuarios.models import Usuario


router = APIRouter(
    prefix="/pedidos",
    tags=["Pedidos"]
)


# Dependencia para obtener el servicio.
def get_pedido_service() -> PedidoService:
    return PedidoService()


# Crear un pedido.
@router.post(
    "/",
    response_model=PedidoRead,
    status_code=status.HTTP_201_CREATED
)
def crear_pedido(
    data: PedidoCreate,
    usuario: Usuario = Depends(get_current_active_user),
    service: PedidoService = Depends(get_pedido_service)
):
    try:
        return service.crear_pedido(data, usuario)

    except ProductoNoEncontrado as error:
        raise HTTPException(status_code=404, detail=str(error))

    except (
        ProductoNoDisponible,
        StockInsuficiente,
        ProductoRepetido
    ) as error:
        raise HTTPException(status_code=400, detail=str(error))


# Listar pedidos propios o todos si es administrador.
@router.get(
    "/",
    response_model=PedidosPaginados
)
def listar_pedidos(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    estado: str | None = None,
    usuario: Usuario = Depends(get_current_active_user),
    service: PedidoService = Depends(get_pedido_service)
):
    return service.listar_pedidos(
        usuario=usuario,
        skip=skip,
        limit=limit,
        estado=estado
    )


# Resumen administrativo.
# Se declara antes de /{pedido_id} para evitar conflictos de rutas.
@router.get(
    "/resumen",
    response_model=ResumenPedidos
)
def obtener_resumen(
    usuario: Usuario = Depends(require_role(["admin"])),
    service: PedidoService = Depends(get_pedido_service)
):
    return service.obtener_resumen()


# Consultar un pedido específico.
@router.get(
    "/{pedido_id}",
    response_model=PedidoRead
)
def obtener_pedido(
    pedido_id: int,
    usuario: Usuario = Depends(get_current_active_user),
    service: PedidoService = Depends(get_pedido_service)
):
    try:
        return service.obtener_pedido(pedido_id, usuario)

    except PedidoNoEncontrado as error:
        raise HTTPException(status_code=404, detail=str(error))

    except AccesoPedidoDenegado as error:
        raise HTTPException(status_code=403, detail=str(error))


# Cambiar el estado de un pedido: solamente administrador.
@router.patch(
    "/{pedido_id}/estado",
    response_model=PedidoRead
)
def cambiar_estado(
    pedido_id: int,
    data: CambioEstado,
    usuario: Usuario = Depends(require_role(["admin"])),
    service: PedidoService = Depends(get_pedido_service)
):
    try:
        return service.cambiar_estado(
            pedido_id=pedido_id,
            nuevo_estado=data.estado
        )

    except PedidoNoEncontrado as error:
        raise HTTPException(status_code=404, detail=str(error))

    except TransicionInvalida as error:
        raise HTTPException(status_code=400, detail=str(error))


# Cancelar un pedido propio.
@router.patch(
    "/{pedido_id}/cancelar",
    response_model=PedidoRead
)
def cancelar_pedido(
    pedido_id: int,
    usuario: Usuario = Depends(get_current_active_user),
    service: PedidoService = Depends(get_pedido_service)
):
    try:
        return service.cancelar_pedido(pedido_id, usuario)

    except PedidoNoEncontrado as error:
        raise HTTPException(status_code=404, detail=str(error))

    except AccesoPedidoDenegado as error:
        raise HTTPException(status_code=403, detail=str(error))

    except TransicionInvalida as error:
        raise HTTPException(status_code=400, detail=str(error))
