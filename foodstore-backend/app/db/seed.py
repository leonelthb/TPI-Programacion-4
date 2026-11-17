
from sqlmodel import Session, SQLModel, select

from app.core.database import engine
from app.core.security import get_password_hash

# Importamos los modelos para registrarlos en SQLModel.
from app.db import models

from app.modules.usuarios.models import Usuario
from app.modules.categorias.models import Categoria
from app.modules.productos.models import Producto


def create_tables() -> None:
    """Crea las tablas que todavía no existen."""

    SQLModel.metadata.create_all(engine)

    print("Tablas creadas correctamente.")


def seed_admin(session: Session) -> None:
    """Crea el administrador inicial si todavía no existe."""

    admin = session.exec(
        select(Usuario).where(Usuario.username == "admin")
    ).first()

    if admin is None:
        admin = Usuario(
            username="admin",
            full_name="Administrador",
            email="admin@foodstore.com",
            hashed_password=get_password_hash("Admin1234!"),
            role="admin",
            disabled=False
        )

        session.add(admin)
        print("Administrador creado.")


def seed_categorias(session: Session) -> dict[str, Categoria]:
    """Crea las categorías gastronómicas iniciales."""

    nombres = [
        "Hamburguesas",
        "Pizzas",
        "Empanadas",
        "Acompañamientos",
        "Bebidas"
    ]

    categorias = {}

    for nombre in nombres:
        categoria = session.exec(
            select(Categoria).where(Categoria.nombre == nombre)
        ).first()

        if categoria is None:
            categoria = Categoria(
                nombre=nombre,
                descripcion=f"Productos de la categoría {nombre}"
            )

            session.add(categoria)
            session.flush()

            print(f"Categoría creada: {nombre}")

        categorias[nombre] = categoria

    return categorias


def seed_productos(
    session: Session,
    categorias: dict[str, Categoria]
) -> None:
    """Carga productos gastronómicos sin duplicarlos."""

    productos = [
        # Hamburguesas
        {
            "nombre": "Hamburguesa clásica",
            "descripcion": "Medallón de carne, lechuga, tomate y aderezos.",
            "categoria": "Hamburguesas",
            "precio_base": 9500,
            "stock": 20
        },
        {
            "nombre": "Hamburguesa doble cheddar",
            "descripcion": "Doble medallón de carne y doble queso cheddar.",
            "categoria": "Hamburguesas",
            "precio_base": 12500,
            "stock": 15
        },

        # Pizzas
        {
            "nombre": "Pizza muzzarella",
            "descripcion": "Salsa de tomate, muzzarella y aceitunas.",
            "categoria": "Pizzas",
            "precio_base": 14000,
            "stock": 12
        },
        {
            "nombre": "Pizza napolitana",
            "descripcion": "Muzzarella, tomate en rodajas y ajo.",
            "categoria": "Pizzas",
            "precio_base": 16500,
            "stock": 10
        },

        # Empanadas
        {
            "nombre": "Empanada de carne",
            "descripcion": "Empanada casera rellena de carne.",
            "categoria": "Empanadas",
            "precio_base": 1800,
            "stock": 50
        },
        {
            "nombre": "Empanada de pollo",
            "descripcion": "Empanada casera rellena de pollo.",
            "categoria": "Empanadas",
            "precio_base": 1800,
            "stock": 50
        },

        # Acompañamientos
        {
            "nombre": "Papas fritas",
            "descripcion": "Porción de papas fritas crocantes.",
            "categoria": "Acompañamientos",
            "precio_base": 4500,
            "stock": 25
        },
        {
            "nombre": "Bastones de mozzarella",
            "descripcion": "Bastones de queso mozzarella rebozados.",
            "categoria": "Acompañamientos",
            "precio_base": 6000,
            "stock": 18
        },

        # Bebidas
        {
            "nombre": "Gaseosa cola 2L",
            "descripcion": "Botella de gaseosa cola de 2 litros.",
            "categoria": "Bebidas",
            "precio_base": 3500,
            "stock": 30
        },
        {
            "nombre": "Agua mineral 1.5L",
            "descripcion": "Botella de agua mineral de 1,5 litros.",
            "categoria": "Bebidas",
            "precio_base": 2200,
            "stock": 25
        }
    ]

    for datos in productos:

        # Buscamos por nombre para evitar duplicaciones.
        producto_existente = session.exec(
            select(Producto).where(
                Producto.nombre == datos["nombre"]
            )
        ).first()

        if producto_existente is None:

            producto = Producto(
                nombre=datos["nombre"],
                descripcion=datos["descripcion"],
                categoria_id=categorias[datos["categoria"]].id,
                precio_base=datos["precio_base"],
                stock=datos["stock"],
                disponible=True,
                activo=True
            )

            session.add(producto)

            print(f"Producto creado: {producto.nombre}")


def run_seed() -> None:
    """Ejecuta toda la carga inicial dentro de una transacción."""

    create_tables()

    with Session(engine) as session:
        with session.begin():

            # Primero creamos el administrador.
            seed_admin(session)

            # Después las categorías.
            categorias = seed_categorias(session)

            # Finalmente los productos.
            seed_productos(session, categorias)

    print("Seed ejecutado correctamente.")


if __name__ == "__main__":
    run_seed()
