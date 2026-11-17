
from pydantic import BaseModel


class ResumenAdmin(BaseModel):
    """
    Información general para el dashboard administrativo.
    """

    total_usuarios: int
    usuarios_activos: int
    usuarios_deshabilitados: int

    total_productos: int
    productos_activos: int

    total_categorias: int
    categorias_activas: int

    total_pedidos: int

    pedidos_pendientes: int
    pedidos_en_preparacion: int
    pedidos_entregados: int
    pedidos_cancelados: int
