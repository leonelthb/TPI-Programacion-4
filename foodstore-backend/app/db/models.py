
"""
Registro centralizado de los modelos de SQLModel.

Importar las entidades desde este módulo permite que
SQLModel conozca todas las tablas y sus relaciones.
"""

from app.modules.usuarios.models import Usuario
from app.modules.categorias.models import Categoria
from app.modules.productos.models import Producto
from app.modules.pedidos.models import Pedido, DetallePedido
