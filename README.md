# PetSocial API

**PetSocial** es la API backend de **Michigram**, una red social para mascotas que permite a los usuarios crear perfiles para sus animales, compartir publicaciones con imágenes, seguir a otras mascotas, dar me gusta, comentar, guardar favoritos y chatear en tiempo real.

> Stack: Node.js · Express.js · TypeScript · Prisma ORM · PostgreSQL · Socket.IO · JWT · Cloudinary

---

## ✨ Funcionalidades

### Autenticación y Seguridad
- Registro e inicio de sesión con email y contraseña (bcrypt + JWT)
- Tokens de acceso (15 min) y renovación (7 días) almacenados en cookies HttpOnly
- Integración con OAuth 2.0 (Google y Facebook) via Passport.js
- Recuperación de contraseña por correo electrónico (Nodemailer)
- Rate limiting escalonado: autenticación (20/15 min), creación de posts (10/min), general (200/min)
- Validación de datos con Zod

### Gestión de Mascotas
- Creación de múltiples perfiles de mascota por usuario
- Cada mascota incluye: nombre, biografía, imagen de perfil (Cloudinary)
- Selección y cambio de mascota activa
- Sistema de seguimiento entre mascotas (follow/unfollow)

### Publicaciones
- Creación de posts con imágenes alojadas en Cloudinary
- Contenido textual, descripción y ubicación
- Likes con toggle y notificación en tiempo real
- Comentarios con edición y eliminación
- Etiquetado de mascotas en publicaciones
- Feed con paginación basada en cursor (10 posts por página)
- Posts propios y de mascotas seguidas

### Interacciones Sociales
- Follow/unfollow entre mascotas
- Contadores de seguidores y seguidos en cada perfil
- Favoritos (bookmarks) para guardar publicaciones
- Notificaciones agrupadas en tiempo real (like, comentario, follow)

### Mensajería en Tiempo Real
- Conversaciones instantáneas via Socket.IO
- Historial de mensajes con paginación (30 por página)
- Indicadores de lectura y estado en línea
- Salas de conversación por par de mascotas

---

## 🏗️ Arquitectura

El proyecto sigue una arquitectura en capas **MVC con capa de servicios**:

```
Cliente (React SPA)
    │
    ▼
    Routes              → Definición de endpoints
    Controllers         → Capa HTTP (request/response)
    Services            → Lógica de negocio
    Prisma ORM          → Acceso a base de datos
    PostgreSQL          → Almacenamiento persistente
```

```
petsocial-backend/
├── prisma/
│   ├── schema.prisma          # Modelos de datos (10 modelos)
│   ├── seed.ts                # Datos de demostración
│   └── migrations/            # Migraciones de base de datos
├── src/
│   ├── config/                # Configuración (Prisma, Cloudinary, Passport, Nodemailer)
│   ├── controllers/           # Controladores HTTP
│   ├── services/              # Lógica de negocio
│   ├── routes/                # Definición de rutas Express
│   ├── middlewares/           # Autenticación, validación, rate limit, errores, upload
│   ├── sockets/               # Handlers de Socket.IO (chat, presencia)
│   ├── validations/           # Esquemas Zod
│   ├── utils/                 # Utilidades (JWT, errores HTTP)
│   ├── types/                 # Tipos extendidos de Express
│   ├── __tests__/             # Tests unitarios (Jest + Supertest)
│   ├── app.ts                 # Configuración de Express
│   └── server.ts              # Punto de entrada (HTTP + Socket.IO)
├── .env                       # Variables de entorno
├── jest.config.js
├── tsconfig.json
└── package.json
```

---

## 🗄️ Modelo de Datos

| Modelo | Descripción | Relaciones Clave |
|---|---|---|
| **User** | Usuario del sistema | 1:N → Pet, Notification |
| **Pet** | Perfil de mascota | N:1 User; 1:N → Post, Like, Comment, Favorite, Follow; M:N → Conversation |
| **Post** | Publicación con imagen | N:1 Pet; 1:N → Like, Comment, Favorite, Notification |
| **Like** | Like en publicación | `@@unique(petId, postId)` |
| **Comment** | Comentario en publicación | N:1 Pet, Post |
| **Favorite** | Favorito (bookmark) | `@@unique(petId, postId)` |
| **Follow** | Seguimiento entre mascotas | `@@unique(followerId, followingId)` — auto-referencial via Pet |
| **PostTag** | Etiqueta de mascota en post | `@@unique(postId, petId)` |
| **Notification** | Notificación (like, comment, follow) | Polimórfica: Pet(actor), Post, User |
| **Conversation** | Conversación de chat | 1:N → Participant, Message |
| **Message** | Mensaje en conversación | N:1 Pet(remitente), Conversation |

---

## 🔌 Endpoints de la API

### Salud
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/health` | Health check |

### Autenticación
| Método | Ruta | Descripción |
|---|---|---|
| POST | `/auth/register` | Registro de usuario |
| POST | `/auth/login` | Inicio de sesión |
| POST | `/auth/refresh` | Renovar tokens |
| POST | `/auth/logout` | Cerrar sesión |
| POST | `/auth/forgot-password` | Solicitar recuperación de contraseña |
| POST | `/auth/reset-password` | Restablecer contraseña |
| GET | `/auth/google` | Inicio de sesión con Google |
| GET | `/auth/google/callback` | Callback de Google OAuth |

### Mascotas
| Método | Ruta | Descripción |
|---|---|---|
| POST | `/pets` | Crear mascota |
| GET | `/pets/me` | Mis mascotas |
| GET | `/pets/explore` | Explorar mascotas |
| GET | `/pets/search?q=` | Buscar mascotas por nombre |
| GET | `/pets/:id` | Perfil de mascota |
| PUT | `/pets/:id` | Actualizar mascota |
| DELETE | `/pets/:id` | Eliminar mascota |
| POST | `/pets/select/:petId` | Seleccionar mascota activa |

### Publicaciones
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/posts/feed` | Feed con paginación por cursor |
| GET | `/posts/all` | Feed público (máx. 50) |
| GET | `/posts/pet/:petId` | Posts de una mascota |
| GET | `/posts/:id` | Detalle de publicación |
| POST | `/posts` | Crear publicación |
| PUT | `/posts/:id` | Actualizar publicación |
| DELETE | `/posts/:id` | Eliminar publicación |

### Likes
| Método | Ruta | Descripción |
|---|---|---|
| POST | `/likes/toggle/:postId` | Dar o quitar like |
| POST | `/likes/:postId` | Listar likes de un post |

### Comentarios
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/comments/:postId` | Comentarios de un post |
| POST | `/comments/:postId` | Crear comentario |
| PUT | `/comments/:commentId` | Editar comentario |
| DELETE | `/comments/:commentId` | Eliminar comentario |

### Seguimiento
| Método | Ruta | Descripción |
|---|---|---|
| POST | `/follow/:petId` | Seguir / dejar de seguir |
| GET | `/follow/:petId/followers` | Seguidores (paginación por cursor) |
| GET | `/follow/:petId/following` | Mascotas que sigue |

### Favoritos
| Método | Ruta | Descripción |
|---|---|---|
| POST | `/favorites/toggle/:postId` | Guardar / quitar de favoritos |
| GET | `/favorites` | Listar favoritos |

### Notificaciones
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/notifications/:petId` | Notificaciones agrupadas |
| GET | `/notifications/:petId/unread/count` | Contador de no leídas |
| PATCH | `/notifications/:petId/read-all` | Marcar todas como leídas |
| PATCH | `/notifications/:id/read` | Marcar una como leída |

### Conversaciones
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/conversations` | Listar conversaciones |
| POST | `/conversations` | Crear o reanudar conversación |
| GET | `/conversations/:id` | Mensajes de la conversación |
| PUT | `/conversations/:id/read` | Marcar mensajes como leídos |
| DELETE | `/conversations/:id` | Eliminar conversación |
| POST | `/conversations/:id/messages` | Enviar mensaje (fallback HTTP) |

### Usuarios
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/me` | Información del usuario autenticado |
| GET | `/users/:userId/profile` | Perfil completo de mascota |
| PUT | `/users/:userId` | Actualizar perfil de usuario |
| DELETE | `/users/me` | Eliminar cuenta |

---

## 🔌 Eventos Socket.IO

| Evento (cliente → servidor) | Descripción |
|---|---|
| `joinConversations` | Unirse a salas de conversaciones activas |
| `startConversation` | Iniciar conversación con otra mascota |
| `sendMessage` | Enviar mensaje a una conversación |
| `markAsRead` | Marcar mensajes como leídos |
| `getMessages` | Obtener historial de mensajes |
| `getOnlinePets` | Obtener mascotas conectadas |

| Evento (servidor → cliente) | Descripción |
|---|---|
| `newMessage` | Nuevo mensaje recibido |
| `messagesRead` | Confirmación de lectura |
| `petOnline` / `petOffline` | Estado de conexión de mascotas |
| `notification` | Nueva notificación en tiempo real |

---

## 🛠️ Stack Tecnológico

### Runtime y Lenguaje
- **Node.js** (v18+) — Entorno de ejecución
- **TypeScript** (v5.9) — Tipado estático
- **Express.js** (v5.2) — Framework web

### Base de Datos y ORM
- **PostgreSQL** — Base de datos relacional
- **Prisma** (v6.19) — ORM con migraciones y generación de cliente

### Autenticación y Seguridad
- **jsonwebtoken** — Tokens JWT de acceso y renovación
- **bcrypt** — Hashing de contraseñas
- **Passport.js** — Estrategias OAuth (Google, Facebook)
- **express-rate-limit** — Limitación de velocidad por endpoint
- **cookie-parser** — Parseo de cookies seguras

### Almacenamiento de Imágenes
- **Cloudinary** — Almacenamiento y optimización de imágenes
- **Multer** + **multer-storage-cloudinary** — Middleware de subida

### Tiempo Real
- **Socket.IO** (v4.8) — Comunicación bidireccional en tiempo real

### Validación
- **Zod** (v4.3) — Validación de esquemas de datos

### Correo Electrónico
- **Nodemailer** — Envío de correos (recuperación de contraseña)

### Testing
- **Jest** + **ts-jest** — Framework de testing
- **Supertest** — Testing de endpoints HTTP

### Desarrollo
- **ts-node-dev** — Recarga en caliente durante desarrollo

---

## 🚀 Instalación y Uso

### Requisitos Previos
- Node.js v18+
- PostgreSQL en ejecución
- Cuenta en [Cloudinary](https://cloudinary.com)

### Configuración

```bash
# 1. Clonar el repositorio
git clone <repo-url>
cd petsocial-backend

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# 4. Generar Prisma Client y ejecutar migraciones
npx prisma generate
npx prisma migrate dev

# 5. (Opcional) Sembrar datos de demostración
npx prisma db seed

# 6. Iniciar en modo desarrollo
npm run dev
```

### Comandos Disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Iniciar servidor con hot-reload |
| `npm run build` | Compilar TypeScript a JavaScript |
| `npm start` | Iniciar servidor en producción |
| `npm test` | Ejecutar tests unitarios |
| `npm run test:coverage` | Ejecutar tests con reporte de cobertura |
| `npx prisma studio` | Abrir interfaz gráfica de la base de datos |

---

## 🧪 Testing

```bash
# Ejecutar suite de tests
npm test

# Con reporte de cobertura
npm run test:coverage
```

Cobertura actual:
- **Auth Service**: Registro, login, refresh token
- **User Service**: Perfil, actualización
- **Post Service**: Creación de posts, feed, consulta por mascota

---

## 📦 Variables de Entorno

| Variable | Descripción |
|---|---|
| `DATABASE_URL` | Cadena de conexión a PostgreSQL |
| `PORT` | Puerto del servidor (por defecto: 3000) |
| `JWT_SECRET` | Secreto para firmar tokens de acceso |
| `JWT_REFRESH_SECRET` | Secreto para firmar tokens de renovación |
| `CLIENT_URL` / `FRONTEND_URL` | URL del frontend (CORS) |
| `CLOUDINARY_CLOUD_NAME` | Nombre del cloud en Cloudinary |
| `CLOUDINARY_API_KEY` | API Key de Cloudinary |
| `CLOUDINARY_API_SECRET` | API Secret de Cloudinary |
| `GOOGLE_CLIENT_ID` | Client ID de Google OAuth |
| `GOOGLE_CLIENT_SECRET` | Client Secret de Google OAuth |
| `SMTP_HOST` / `SMTP_PORT` | Servidor SMTP |
| `SMTP_USER` / `SMTP_PASS` | Credenciales SMTP |

---

## 🤝 Contribuir

1. Fork del repositorio
2. Crear una rama (`git checkout -b feature/nueva-funcionalidad`)
3. Commit de cambios (`git commit -m 'feat: agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abrir un Pull Request

---

## 📄 Licencia

ISC
