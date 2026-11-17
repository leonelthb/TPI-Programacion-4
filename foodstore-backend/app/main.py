from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.modules.pedidos.router import router as pedidos_router
from app.core.config import settings
# Registra todas las entidades en SQLModel antes de ejecutar consultas.
from app.db import models
from app.modules.auth.router import router as auth_router
from app.modules.usuarios.router import router as usuarios_router
from app.modules.categorias.router import router as categorias_router
from app.modules.productos.router import router as productos_router

# Creamos la aplicación FastAPI.
app = FastAPI(
    title="Food Store API",
    description="API REST para la gestión de Food Store",
    version="1.0.0"
)


# Configuración CORS para permitir la comunicación
# entre el frontend y el backend utilizando cookies.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


# Prefijo general de la API.
API_PREFIX = "/api/v1"


# Registramos los routers.
app.include_router(auth_router, prefix=API_PREFIX)
app.include_router(usuarios_router, prefix=API_PREFIX)
app.include_router(categorias_router, prefix=API_PREFIX)
app.include_router(productos_router, prefix=API_PREFIX)
app.include_router(pedidos_router, prefix=API_PREFIX)

@app.get("/")
def root():
    """Endpoint básico para comprobar que la API está activa."""
    return {"message": "Food Store API funcionando"}