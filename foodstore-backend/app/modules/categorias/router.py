
from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.deps import require_role
from app.modules.categorias.schemas import (
    CategoriaCreate,
    CategoriaUpdate,
    CategoriaRead,
)
from app.modules.categorias.service import (
    CategoriaService,
    CategoriaNoEncontrada,
    CategoriaDuplicada,
)
from app.modules.categorias.unit_of_work import CategoriaUnitOfWork


router = APIRouter(
    prefix="/categorias",
    tags=["Categorías"],
)


def get_categoria_service() -> CategoriaService:
    """
    Construye el servicio de categorías.

    FastAPI utiliza esta dependencia para inyectar
    el servicio en los endpoints.
    """
    return CategoriaService(CategoriaUnitOfWork())


# LISTAR CATEGORÍAS ACTIVAS
@router.get("/", response_model=list[CategoriaRead])
def listar_categorias(
    service: CategoriaService = Depends(get_categoria_service),
):
    """Devuelve las categorías activas."""
    return service.get_all()


# LISTADO ADMINISTRATIVO
@router.get(
    "/admin/listado",
    response_model=list[CategoriaRead],
    dependencies=[Depends(require_role(["admin"]))],
)
def listar_categorias_admin(
    activo: bool | None = Query(default=None),
    service: CategoriaService = Depends(get_categoria_service),
):
    """
    Devuelve categorías para administración.

    activo=true: solo activas.
    activo=false: solo inactivas.
    Sin parámetro: todas.
    """
    return service.get_all_admin(activo=activo)


# OBTENER CATEGORÍA POR ID
@router.get("/{categoria_id}", response_model=CategoriaRead)
def obtener_categoria(
    categoria_id: int,
    service: CategoriaService = Depends(get_categoria_service),
):
    """Obtiene una categoría activa por su ID."""
    try:
        return service.get_by_id(categoria_id)
    except CategoriaNoEncontrada:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Categoría no encontrada",
        )


# CREAR CATEGORÍA
@router.post(
    "/",
    response_model=CategoriaRead,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_role(["admin"]))],
)
def crear_categoria(
    data: CategoriaCreate,
    service: CategoriaService = Depends(get_categoria_service),
):
    """Crea una categoría."""
    try:
        return service.create(data)
    except CategoriaDuplicada:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ya existe una categoría con ese nombre",
        )


# ACTUALIZAR CATEGORÍA
@router.put(
    "/{categoria_id}",
    response_model=CategoriaRead,
    dependencies=[Depends(require_role(["admin"]))],
)
def actualizar_categoria(
    categoria_id: int,
    data: CategoriaUpdate,
    service: CategoriaService = Depends(get_categoria_service),
):
    """Actualiza los campos enviados de una categoría."""
    try:
        return service.update(categoria_id, data)
    except CategoriaNoEncontrada:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Categoría no encontrada",
        )
    except CategoriaDuplicada:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ya existe una categoría con ese nombre",
        )


# ELIMINAR CATEGORÍA (BAJA LÓGICA)
@router.delete(
    "/{categoria_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_role(["admin"]))],
)
def eliminar_categoria(
    categoria_id: int,
    service: CategoriaService = Depends(get_categoria_service),
):
    """Realiza la baja lógica de una categoría."""
    try:
        service.delete(categoria_id)
    except CategoriaNoEncontrada:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Categoría no encontrada",
        )
