# PetSocial API

Backend API para una red social donde usuarios pueden registrarte, crear mascotas, publicar contenido, seguir a otros usuarios, dar like a publicaciones y comentar.

Construido con:

- Node.js
- Express.js
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT Authentication
- Zod Validation
- Socket.IO (mensajería en tiempo real)
- Cloudinary (almacenamiento de imágenes)

---

## Características

### Autenticación

- Registro de usuarios con validación de email
- Login con JWT (access token + refresh token)
- Cookies HttpOnly seguras
- Renovación automática de tokens
- Logout que limpia el refresh token

### Gestión de Mascotas

- Crear, editar y eliminar mascotas
- Cada mascota tiene: nombre, bio, imagen de perfil
- Multiple mascotas por usuario
- Sistema de seguimiento entre mascotas

### Publicaciones

- Crear posts con imágenes (Cloudinary)
- Descripción y contenido en publicaciones
- Sistema de likes (toggle)
- Sistema de comentarios
- Tags de mascotas en posts
- Feed con cursor-based pagination

### Interacciones Sociales

- Follow/Unfollow entre mascotas
- Contador de followers y following
- Notificaciones en tiempo real:
    - Nuevo follower
    - Like en post
    - Comentario en post
    - Etiquetado en post

### Mensajería

- Conversaciones en tiempo real (Socket.IO)
- Mensajería instantánea entre usuarios
- Historial de conversaciones
- Estado de lectura de mensajes

### Seguridad

- Rate limiting por endpoints
- Validación de requests con Zod
- Middleware de autenticación
- Manejo global de errores
- CORS configurado

---

## Estructura del Proyecto

```
petsocial-backend/
├── prisma/
│   ├── schema.prisma          # Modelos de base de datos
│   └── migrations/            # Migraciones de Prisma
├── src/
│   ├── config/
│   │   ├── cloudinary.ts      # Configuración de Cloudinary
│   │   └── prisma.ts         # Cliente de Prisma
│   ├── controllers/          # Capa de Controllers (HTTP)
│   ├── services/             # Capa de Servicios (lógica)
│   ├── routes/               # Definición de rutas
│   ├── middlewares/          # Middlewares de Express
│   │   ├── auth.middleware.ts
│   │   ├── error.middleware.ts
│   │   ├── rateLimit.middleware.ts
│   │   └── validate.middleware.ts
│   ├── validations/          # Schemas de Zod
│   ├── utils/
│   │   ├── jwt.ts            # Funciones de JWT
│   │   └── httpError.ts      # Clase de errores HTTP
│   ├── sockets/             # Handlers de Socket.IO
│   ├── __tests__/           # Tests unitarios
│   ├── app.ts               # Configuración de Express
│   └── server.ts            # Punto de entrada
├── .env                      # Variables de entorno
├── jest.config.js           # Configuración de Jest
├── package.json
└── tsconfig.json
```

---

## Arquitectura

El proyecto sigue el patrón **MVC adaptado** con servicios:

- **Controllers**: Manejan la capa HTTP, reciben requests y responden
- **Services**: Contienen la lógica de negocio
- **Middlewares**: Validación, autenticación, errores
- **Prisma**: Capa de acceso a la base de datos
- **Routes**: Definen los endpoints y sus controladores

---

## Manejo de Errores

Todos los errores se manejan a través de un middleware global de errores.

Formato de respuesta de error estándar:

```json
{
    "success": false,
    "message": "Error message"
}
```

---

## Testing

El proyecto cuenta con tests unitarios usando Jest.

```bash
# Ejecutar tests
npm test

# Ejecutar tests con coverage
npm run test:coverage
```

Tests implementados:

- **Auth Service**: Registro, login, refresh token
- **User Service**: Perfil, actualización
- **Post Service**: Crear post, feed, posts por mascota

---

## Instalación y Uso

### Requisitos Previos

- Node.js (v18+)
- PostgreSQL
- Cuenta de Cloudinary (para imágenes)

### Comandos

```bash
# Instalar dependencias
npm install

# Generar Prisma Client
npx prisma generate

# Ejecutar migraciones
npx prisma migrate dev

# Desarrollo (con hot-reload)
npm run dev

# Build de producción
npm run build

# Iniciar producción
npm start

# Ejecutar tests
npm test

# Tests con coverage
npm run test:coverage
```

---

## Endpoints Principales

### Autenticación

- `POST /auth/register` - Registro de usuario
- `POST /auth/login` - Login
- `POST /auth/refresh` - Renovar tokens
- `POST /auth/logout` - Logout

### Mascotas

- `GET /pets` - Listar mascotas del usuario
- `POST /pets` - Crear mascota
- `PUT /pets/:id` - Actualizar mascota
- `DELETE /pets/:id` - Eliminar mascota

### Publicaciones

- `GET /posts/feed` - Feed de publicaciones
- `POST /posts` - Crear publicación
- `DELETE /posts/:id` - Eliminar publicación
- `POST /posts/:id/like` - Dar/quitar like
- `POST /posts/:id/comments` - Comentar

### Seguimientos

- `POST /follow/:petId` - Seguir mascota
- `DELETE /follow/:petId` - Dejar de seguir
- `GET /follow/:petId/status` - Estado de seguimiento

### Mensajería

- `GET /conversations` - Listar conversaciones
- `POST /conversations` - Crear conversación
- `GET /conversations/:id/messages` - Mensajes de conversación

---

## Modelos de Base de Datos

### User

- id, name, email, password, avatar, lastSeen, refreshToken, createdAt

### Pet

- id, name, bio, image, ownerId (relación con User), createdAt

### Post

- id, image, description, content, petId (relación con Pet), createdAt

### Like

- petId, postId (relación única compuesta)

### Comment

- id, content, petId, postId, createdAt

### Follow

- followerId, followingId (relación única compuesta entre mascotas)

### PostTag

- postId, petId (relación para etiquetar mascotas en posts)

### Notification

- id, petId (receptor), actorId (accionador), postId, type, message, isRead

### Conversation

- id, createdAt, updatedAt

### Message

- id, content, senderId, conversationId, isRead, createdAt

---

## Tecnologías y Dependencias

### Dependencias de Producción

- `@prisma/client` - ORM de base de datos
- `bcrypt` - Hash de contraseñas
- `cloudinary` - Almacenamiento de imágenes
- `cookie-parser` - Parseo de cookies
- `cors` - Configuración de CORS
- `dotenv` - Variables de entorno
- `express` - Framework web
- `express-rate-limit` - Rate limiting
- `jsonwebtoken` - JWT
- `multer` - Manejo de uploads
- `multer-storage-cloudinary` - Storage de Cloudinary
- `socket.io` - WebSockets
- `zod` - Validación de datos

### Dependencias de Desarrollo

- `typescript`
- `ts-node-dev`
- `jest`, `ts-jest`, `@types/jest` - Testing
- `supertest`, `@types/supertest` - Testing de HTTP

---

## Características Futuras (pendientes)

- Verificación de email
- Reseteo de contraseña
- Tests de integración
- Documentación con Swagger/OpenAPI

---

## Uso con Frontend

Esta API está diseñada para funcionar con un frontend (por ejemplo, React/Vue). El frontend debe:

1. Guardar las cookies `accessToken`, `refreshToken` y `petId`
2. Incluir `credentials: true` en las requests
3. Manejar la renovación automática de tokens
4. Conectar a Socket.IO para notificaciones en tiempo real

---

## Licencia

ISC
