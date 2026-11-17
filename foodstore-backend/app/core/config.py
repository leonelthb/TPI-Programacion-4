
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Centraliza la configuración de Food Store.

    Los valores se obtienen desde las variables de entorno
    o desde el archivo .env.
    """

    # Dirección de conexión con PostgreSQL.
    DATABASE_URL: str

    # Clave secreta utilizada para firmar los JWT.
    SECRET_KEY: str = Field(min_length=32)

    # Algoritmo utilizado para firmar los tokens.
    ALGORITHM: str = "HS256"

    # Tiempo de duración del token en minutos.
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=30, gt=0)

    # Origen autorizado para las peticiones del frontend.
    FRONTEND_ORIGIN: str = "http://localhost:5173"

    # Configuración de lectura del archivo .env.
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


# Instancia única de configuración para toda la aplicación.
settings = Settings()
