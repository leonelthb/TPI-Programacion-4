from datetime import datetime, timedelta, timezone
from typing import Optional
from zoneinfo import ZoneInfo

from sqlalchemy import func
from sqlalchemy.orm import selectinload
from sqlmodel import Session, select

from app.core.base_repository import BaseRepository
from app.modules.pedidos.models import Pedido

class PedidoRepository(BaseRepository[Pedido]):
    """
    Repository encargado de las consultas de pedidos.

    Hereda las operaciones básicas de BaseRepository
    y agrega consultas específicas del módulo.
    """

    def __init__(self, session: Session):
        super().__init__(session, Pedido)

    def get_by_id_with_items(
        self,
        pedido_id: int
    ) -> Optional[Pedido]:
        """Obtiene un pedido junto con sus líneas."""

        statement = (
            select(Pedido)
            .where(Pedido.id == pedido_id)
            .options(selectinload(Pedido.items))
        )

        return self.session.exec(statement).first()

    def list_by_usuario(
        self,
        usuario_id: int,
        skip: int = 0,
        limit: int = 20,
        estado: Optional[str] = None
    ) -> tuple[int, list[Pedido]]:
        """Lista los pedidos de un usuario con filtros y paginación."""

        statement = select(Pedido).where(
            Pedido.usuario_id == usuario_id
        )

        if estado:
            statement = statement.where(Pedido.estado == estado)

        return self._paginate(statement, skip, limit)

    def list_all(
        self,
        skip: int = 0,
        limit: int = 20,
        estado: Optional[str] = None
    ) -> tuple[int, list[Pedido]]:
        """Lista todos los pedidos, destinado al administrador."""

        statement = select(Pedido)

        if estado:
            statement = statement.where(Pedido.estado == estado)

        return self._paginate(statement, skip, limit)

    def _paginate(
        self,
        statement,
        skip: int,
        limit: int
    ) -> tuple[int, list[Pedido]]:
        """Aplica el conteo y la paginación a una consulta."""

        count_statement = select(func.count()).select_from(
            statement.subquery()
        )

        total = self.session.exec(count_statement).one()

        paginated_statement = (
            statement
            .options(selectinload(Pedido.items))
            .order_by(Pedido.created_at.desc())
            .offset(skip)
            .limit(limit)
        )

        pedidos = list(
            self.session.exec(paginated_statement).all()
        )

        return total, pedidos

    def count_by_estado(self, estado: str) -> int:
        """Cuenta los pedidos que tienen un estado determinado."""

        statement = (
            select(func.count())
            .select_from(Pedido)
            .where(Pedido.estado == estado)
        )

        return self.session.exec(statement).one()




    def get_summary(self) -> dict:
        """
        Obtiene los indicadores generales para el panel administrativo.
        Los pedidos de hoy se calculan según la fecha de Argentina.
        """

        # Contamos los pedidos de cada estado.
        pendientes = self.count_by_estado("PENDIENTE")
        en_preparacion = self.count_by_estado("EN_PREPARACION")
        entregados = self.count_by_estado("ENTREGADO")
        cancelados = self.count_by_estado("CANCELADO")

        # Obtenemos la fecha y hora actual de Argentina.
        ahora = datetime.now(ZoneInfo("America/Argentina/Cordoba"))

        # Calculamos el inicio del día local y lo convertimos a UTC.
        inicio_dia = ahora.replace(
            hour=0, minute=0, second=0, microsecond=0
        ).astimezone(timezone.utc)

        # Calculamos el inicio del día siguiente y lo convertimos a UTC.
        fin_dia = (
            ahora.replace(hour=0, minute=0, second=0, microsecond=0)
            + timedelta(days=1)
        ).astimezone(timezone.utc)

        # Contamos los pedidos creados durante el día actual.
        pedidos_hoy_statement = (
            select(func.count())
            .select_from(Pedido)
            .where(
                Pedido.created_at >= inicio_dia,
                Pedido.created_at < fin_dia
            )
        )

        pedidos_hoy = self.session.exec(
            pedidos_hoy_statement
        ).one()

        # Sumamos los importes de todos los pedidos entregados.
        ingresos_statement = (
            select(func.coalesce(func.sum(Pedido.total), 0.0))
            .where(Pedido.estado == "ENTREGADO")
        )

        ingresos_entregados = self.session.exec(
            ingresos_statement
        ).one()


        

        return {
            "pendientes": pendientes,
            "en_preparacion": en_preparacion,
            "entregados": entregados,
            "cancelados": cancelados,
            "pedidos_hoy": pedidos_hoy,
            "ingresos_entregados": float(ingresos_entregados)
        }


