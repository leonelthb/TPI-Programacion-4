from datetime import datetime, timezone
from typing import Optional

from app.modules.pedidos.models import Pedido, DetallePedido
from app.modules.pedidos.schemas import (
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork
from app.modules.usuarios.models import Usuario


# Excepciones propias del módulo de pedidos.

class PedidoNoEncontrado(Exception):
    """El pedido solicitado no existe."""


class ProductoNoEncontrado(Exception):
    """El producto solicitado no existe o está inactivo."""


class ProductoNoDisponible(Exception):
    """El producto no está disponible para la venta."""


class StockInsuficiente(Exception):
    """No hay stock suficiente para completar el pedido."""


class ProductoRepetido(Exception):
    """Un producto aparece más de una vez en el pedido."""


class TransicionInvalida(Exception):
    """La transición de estado solicitada no está permitida."""


class AccesoPedidoDenegado(Exception):
    """El usuario no tiene permiso para acceder al pedido."""


class PedidoService:
    """
    Servicio encargado de gestionar los pedidos.

    Aplica las reglas de negocio y coordina las operaciones
    mediante Unit of Work.
    """

    def __init__(self):
        self.uow = PedidoUnitOfWork()



    def crear_pedido(
        self,
        data: PedidoCreate,
        usuario: Usuario
    ) -> PedidoRead:
        """
        Crea un pedido y descuenta el stock de sus productos.

        Toda la operación se ejecuta dentro de una única
        transacción mediante Unit of Work.
        """

        with self.uow as uow:

            # RN-01: no se permite repetir productos en un pedido.
            productos_ids = [
                item.producto_id for item in data.items
            ]

            if len(productos_ids) != len(set(productos_ids)):
                raise ProductoRepetido(
                    "No se puede repetir un producto en el pedido."
                )

            # Creamos el pedido inicialmente sin líneas.
            pedido = Pedido(
                usuario_id=usuario.id,
                estado="PENDIENTE",
                forma_pago=data.forma_pago,
                direccion_entrega=data.direccion_entrega,
                notas=data.notas,
                total=0.0
            )

            # Lo agregamos a la sesión para obtener su ID.
            uow.pedidos.add(pedido)

            total_pedido = 0.0

            # Procesamos cada producto solicitado.
            for item in data.items:

                producto = uow.productos.get_by_id(
                    item.producto_id
                )

                # Verificamos existencia y baja lógica.
                if producto is None or not producto.activo:
                    raise ProductoNoEncontrado(
                        f"El producto {item.producto_id} no existe."
                    )

                # Verificamos disponibilidad.
                if not producto.disponible:
                    raise ProductoNoDisponible(
                        f"El producto '{producto.nombre}' no está disponible."
                    )

                # Verificamos que haya stock suficiente.
                if producto.stock < item.cantidad:
                    raise StockInsuficiente(
                        f"Stock insuficiente para '{producto.nombre}'. "
                        f"Disponible: {producto.stock}."
                    )

                # Descontamos el stock.
                producto.stock -= item.cantidad

                # Calculamos el subtotal utilizando el precio real
                # almacenado en la base de datos.
                subtotal = producto.precio_base * item.cantidad

                # Creamos el detalle con una copia del nombre y precio.
                detalle = DetallePedido(
                    pedido_id=pedido.id,
                    producto_id=producto.id,
                    cantidad=item.cantidad,
                    nombre_producto=producto.nombre,
                    precio_unitario=producto.precio_base,
                    subtotal=subtotal
                )

                uow.session.add(detalle)

                # Acumulamos el importe total.
                total_pedido += subtotal

            # Guardamos el total definitivo del pedido.
            pedido.total = total_pedido

            # Recuperamos la relación de líneas para construir
            # la respuesta antes de cerrar la transacción.
            uow.session.flush()
            uow.session.refresh(pedido)

            # Devolvemos un schema, nunca el modelo de tabla.
            return PedidoRead.model_validate(
                pedido,
                from_attributes=True
            )



    def listar_pedidos(
        self,
        usuario: Usuario,
        skip: int = 0,
        limit: int = 20,
        estado: Optional[str] = None
    ) -> PedidosPaginados:
        """Lista pedidos según el rol del usuario."""

        with self.uow as uow:

            # El administrador puede consultar todos los pedidos.
            if usuario.role == "admin":
                total, pedidos = uow.pedidos.list_all(
                    skip=skip,
                    limit=limit,
                    estado=estado
                )
            else:
                # El usuario común solamente consulta los propios.
                total, pedidos = uow.pedidos.list_by_usuario(
                    usuario_id=usuario.id,
                    skip=skip,
                    limit=limit,
                    estado=estado
                )

            # Convertimos los modelos a schemas de respuesta.
            items = [
                PedidoRead.model_validate(
                    pedido,
                    from_attributes=True
                )
                for pedido in pedidos
            ]

            return PedidosPaginados(
                total=total,
                items=items
            )

    def obtener_pedido(
        self,
        pedido_id: int,
        usuario: Usuario
    ) -> PedidoRead:
        """Obtiene un pedido verificando los permisos de acceso."""

        with self.uow as uow:

            pedido = uow.pedidos.get_by_id_with_items(pedido_id)

            if pedido is None:
                raise PedidoNoEncontrado(
                    "El pedido solicitado no existe."
                )

            # El administrador puede consultar cualquier pedido.
            # El usuario común solamente puede consultar los propios.
            if usuario.role != "admin" and pedido.usuario_id != usuario.id:
                raise AccesoPedidoDenegado(
                    "No tenés permiso para consultar este pedido."
                )

            return PedidoRead.model_validate(
                pedido,
                from_attributes=True
            )


    # Máquina de estados: define las transiciones permitidas.
    TRANSICIONES = {
        "PENDIENTE": ["EN_PREPARACION", "CANCELADO"],
        "EN_PREPARACION": ["ENTREGADO", "CANCELADO"],
        "ENTREGADO": [],
        "CANCELADO": []
    }

    def cambiar_estado(
        self,
        pedido_id: int,
        nuevo_estado: str
    ) -> PedidoRead:
        """
        Cambia el estado de un pedido.
        Esta operación será utilizada por el administrador.
        """

        with self.uow as uow:

            pedido = uow.pedidos.get_by_id_with_items(pedido_id)

            if pedido is None:
                raise PedidoNoEncontrado("El pedido no existe.")

            # Consultamos las transiciones permitidas para el estado actual.
            estados_permitidos = self.TRANSICIONES.get(
                pedido.estado, []
            )

            # Rechazamos cualquier transición no contemplada.
            if nuevo_estado not in estados_permitidos:
                raise TransicionInvalida(
                    f"No se puede pasar de {pedido.estado} "
                    f"a {nuevo_estado}."
                )

            # Si se cancela, devolvemos el stock al inventario.
            if nuevo_estado == "CANCELADO":
                self._restituir_stock(uow, pedido)

            # Actualizamos el estado y la fecha de modificación.
            pedido.estado = nuevo_estado
            pedido.updated_at = datetime.now(timezone.utc)

            uow.session.flush()

            return PedidoRead.model_validate(
                pedido,
                from_attributes=True
            )

    def cancelar_pedido(
        self,
        pedido_id: int,
        usuario: Usuario
    ) -> PedidoRead:
        """
        Permite al dueño cancelar su pedido únicamente
        cuando se encuentra en estado PENDIENTE.
        """

        with self.uow as uow:

            pedido = uow.pedidos.get_by_id_with_items(pedido_id)

            if pedido is None:
                raise PedidoNoEncontrado("El pedido no existe.")

            # Verificamos que el pedido pertenezca al usuario.
            if pedido.usuario_id != usuario.id:
                raise AccesoPedidoDenegado(
                    "No podés cancelar un pedido de otro usuario."
                )

            # El cliente solamente puede cancelar pedidos pendientes.
            if pedido.estado != "PENDIENTE":
                raise TransicionInvalida(
                    "Solo podés cancelar pedidos pendientes."
                )

            # Restituimos el stock antes de cambiar el estado.
            self._restituir_stock(uow, pedido)

            pedido.estado = "CANCELADO"
            pedido.updated_at = datetime.now(timezone.utc)

            uow.session.flush()

            return PedidoRead.model_validate(
                pedido,
                from_attributes=True
            )

    def _restituir_stock(
        self,
        uow,
        pedido: Pedido
    ) -> None:
        """
        Restituye al inventario las cantidades
        de los productos correspondientes al pedido.
        """

        for detalle in pedido.items:

            producto = uow.productos.get_by_id(
                detalle.producto_id
            )

            if producto is not None:
                producto.stock += detalle.cantidad


    def obtener_resumen(self) -> ResumenPedidos:
        """Obtiene los indicadores para el panel administrativo."""

        with self.uow as uow:

            resumen = uow.pedidos.get_summary()

            return ResumenPedidos(**resumen)
