# Food Store

Sistema web de gestión de pedidos para un negocio de comidas. El proyecto está compuesto por un backend REST desarrollado con **FastAPI, SQLModel y PostgreSQL**, y un frontend desarrollado con **React, TypeScript y Vite**.

Ambas aplicaciones están organizadas dentro de un mismo repositorio y se comunican mediante HTTP. El backend expone la API bajo el prefijo `/api/v1`; el frontend consume esa API mediante Axios.

> **Repositorio:** https://github.com/leonelthb/TPI-Programacion-4

---

## 1. Funcionalidades

### Cliente

- Registro e inicio de sesión.
- Consulta del catálogo de productos.
- Búsqueda y filtros del catálogo.
- Carrito de compras persistido en el navegador.
- Confirmación del pedido con dirección de entrega, forma de pago y notas opcionales.
- Consulta de pedidos propios y su detalle.
- Cancelación de pedidos que todavía están pendientes.

### Administrador

- Panel de resumen con indicadores de pedidos e ingresos entregados.
- Alta, edición y baja lógica de categorías.
- Alta, edición y baja lógica de productos.
- Administración de stock y disponibilidad.
- Consulta y gestión de pedidos mediante los estados permitidos.
- Listado de usuarios y activación o desactivación de cuentas.

### Reglas principales

- Los roles disponibles son `user` y `admin`.
- Los productos solo se pueden vender si están activos, disponibles y tienen stock suficiente.
- Al crear un pedido se valida el stock, se descuenta la cantidad correspondiente y se guarda una copia del nombre y del precio de cada producto en el detalle.
- La creación y cancelación de pedidos gestionan el stock dentro de la transacción correspondiente.
- Los estados de los pedidos son `PENDIENTE`, `EN_PREPARACION`, `ENTREGADO` y `CANCELADO`.
- Los pedidos no se eliminan: se cancelan de acuerdo con las reglas del sistema.
- La autenticación utiliza JWT en una cookie `HttpOnly`; el frontend no lee ni almacena el token.

---

## 2. Tecnologías utilizadas

### Backend

- Python 3.11 a 3.13.
- FastAPI.
- SQLModel y Pydantic.
- PostgreSQL 15 o superior.
- psycopg2-binary.
- JWT y bcrypt para autenticación y contraseñas.
- Unit of Work y Repository para organizar el acceso a datos y las transacciones.

### Frontend

- Node.js 20.19 o superior.
- pnpm 9 o superior.
- React 19 y TypeScript.
- Vite.
- Tailwind CSS 4.
- Axios.
- TanStack Query, TanStack Form y TanStack Table.
- Zustand.
- React Router.

Las versiones concretas de las dependencias se encuentran declaradas en `foodstore-backend/requirements.txt` y `foodstore-frontend/package.json`.

---

## 3. Estructura del repositorio

```text
FoodStore-TPI/
├── README.md
├── foodstore-backend/
│   ├── app/
│   │   ├── core/
│   │   ├── db/
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── categorias/
│   │   │   ├── pedidos/
│   │   │   ├── productos/
│   │   │   └── usuarios/
│   │   └── main.py
│   ├── requirements.txt
│   └── .env.example
└── foodstore-frontend/
    ├── src/
    │   ├── app/
    │   ├── components/
    │   ├── hooks/
    │   ├── pages/
    │   ├── routes/
    │   ├── services/
    │   ├── store/
    │   └── types/
    ├── package.json
    ├── pnpm-lock.yaml
    ├── vite.config.ts
    └── .env.example
```

---

## 4. Requisitos previos

Antes de ejecutar el proyecto, instalar:

- Python entre 3.11 y 3.13.
- PostgreSQL 15 o superior.
- Node.js 20.19 o superior.
- pnpm 9 o superior.

Verificar las instalaciones:

```bash
python --version
node --version
pnpm --version
```

---

## 5. Configuración de la base de datos

1. Iniciar el servicio de PostgreSQL.
2. Crear una base de datos para el proyecto. Por ejemplo:

```sql
CREATE DATABASE foodstore_db;
```

3. Recordar el nombre de la base, el usuario y la contraseña de PostgreSQL. Se utilizarán para configurar `DATABASE_URL` en el backend.

El nombre `foodstore_db` es un ejemplo; puede utilizarse otro nombre siempre que coincida con el configurado en la variable de entorno.

---

## 6. Instalación y ejecución del backend

Abrir una terminal en la carpeta raíz del repositorio y ejecutar:

```bash
cd foodstore-backend
```

### 6.1 Crear y activar el entorno virtual

**Windows (PowerShell):**

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

**Linux / macOS:**

```bash
python -m venv .venv
source .venv/bin/activate
```

### 6.2 Instalar dependencias

```bash
pip install -r requirements.txt
```

### 6.3 Configurar las variables de entorno

Crear una copia de `.env.example` con el nombre `.env` dentro de `foodstore-backend/`.

**Windows (PowerShell):**

```powershell
Copy-Item .env.example .env
```

**Linux / macOS:**

```bash
cp .env.example .env
```

Editar el archivo `.env` con los datos del entorno local. Las variables necesarias son:

| Variable | Descripción | Ejemplo |
|---|---|---|
| `DATABASE_URL` | Cadena de conexión a PostgreSQL | `postgresql://usuario:clave@localhost:5432/foodstore_db` |
| `SECRET_KEY` | Clave secreta para firmar JWT; utilizar una clave propia de al menos 32 caracteres | `reemplazar-por-una-clave-secreta-propia-de-32-caracteres` |
| `ALGORITHM` | Algoritmo de firma del token | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Tiempo de expiración de la sesión en minutos | `30` |
| `FRONTEND_ORIGIN` | Origen autorizado para CORS | `http://localhost:5173` |

Los valores anteriores son ejemplos de desarrollo. No publicar contraseñas, claves secretas ni credenciales reales.

### 6.4 Cargar los datos iniciales

Con el entorno virtual activo y la base de datos configurada, ejecutar desde `foodstore-backend/`:

```bash
python -m app.db.seed
```

El seed está preparado para cargar los datos iniciales del sistema y puede ejecutarse de forma idempotente.

Credenciales iniciales del administrador:

| Campo | Valor |
|---|---|
| Usuario | `admin` |
| Contraseña | `Admin1234!` |
| Rol | `admin` |

Usuario de prueba adicional disponible en el entorno de desarrollo:

| Campo | Valor |
|---|---|
| Usuario | `cliente1` |
| Contraseña | `Cliente1234!` |
| Rol | `user` |

Estas credenciales son exclusivamente para desarrollo y demostración. Cambiarlas o reemplazarlas antes de utilizar el sistema en un entorno real.

### 6.5 Iniciar el servidor

Desde `foodstore-backend/`, con el entorno virtual activo:

```bash
uvicorn app.main:app --reload
```

El backend quedará disponible en:

- API: `http://localhost:8000/api/v1`
- Swagger: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

---

## 7. Instalación y ejecución del frontend

Abrir una segunda terminal. Desde la carpeta raíz del repositorio ejecutar:

```bash
cd foodstore-frontend
```

### 7.1 Instalar dependencias

```bash
pnpm install
```

### 7.2 Configurar las variables de entorno

Crear una copia de `.env.example` con el nombre `.env` dentro de `foodstore-frontend/`.

**Windows (PowerShell):**

```powershell
Copy-Item .env.example .env
```

**Linux / macOS:**

```bash
cp .env.example .env
```

Configurar la URL de la API:

```env
VITE_API_URL=http://localhost:8000/api/v1
```

### 7.3 Iniciar el frontend

```bash
pnpm dev
```

Vite mostrará la dirección local. Con la configuración predeterminada, el frontend estará disponible en:

`http://localhost:5173`

### 7.4 Verificar la compilación

Para comprobar la compilación de producción:

```bash
pnpm build
```

---

## 8. Orden recomendado para iniciar el sistema

1. Iniciar PostgreSQL y verificar que la base de datos exista.
2. Iniciar el backend desde `foodstore-backend/`.
3. Iniciar el frontend desde `foodstore-frontend/` en otra terminal.
4. Abrir `http://localhost:5173` en el navegador.
5. Iniciar sesión con el administrador o registrar un usuario cliente.

El backend y el frontend deben permanecer ejecutándose mientras se utiliza la aplicación.

---

## 9. Seguridad y configuración

- La autenticación se realiza mediante una cookie `HttpOnly`.
- Axios utiliza `withCredentials` para enviar la cookie al backend.
- Las rutas de administración están protegidas en el frontend y los endpoints administrativos validan el rol en el backend.
- Las contraseñas se almacenan mediante hash bcrypt.
- Las variables sensibles deben permanecer en archivos `.env` locales y no deben subirse al repositorio.
- Los archivos `.env.example` contienen nombres de variables y valores de referencia, no credenciales reales.
- Para un despliegue público deben configurarse HTTPS, orígenes CORS y secretos propios del entorno de producción.

---

## 10. Entrega

El repositorio contiene los dos proyectos: backend y frontend. Para preparar el archivo ZIP de entrega:

- Incluir `README.md`, `foodstore-backend/` y `foodstore-frontend/`.
- Incluir `requirements.txt`, `package.json`, `pnpm-lock.yaml` y los dos archivos `.env.example`.
- Excluir las carpetas `.venv/`, `venv/`, `node_modules/`, `dist/` y los archivos `.env` reales.
- No incluir contraseñas, tokens, claves secretas ni otros datos privados.
- Publicar el repositorio en GitHub y completar la URL al principio de este README.

---

## 11. Autoría

**Proyecto:** Food Store – Trabajo Práctico Integrador  
**Materia:** Programación 4  
**Carrera:** Tecnicatura Universitaria en Programación a Distancia  
**Repositorio:** https://github.com/leonelthb/TPI-Programacion-4.git
**Video:** https://youtu.be/Zn7rGvxcKKw
