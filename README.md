# 🎉 NyMoo — Plataforma Modular de Eventos (SaaS Multi-Tenant)

Plataforma web modular bajo stack **MERN + Tailwind CSS** para vender servicios de eventos (bodas, quinceañeras, corporativos) de forma independiente por módulo:

| Módulo | Descripción | Flag en `activeModules` |
|---|---|---|
| 1️⃣ Tarjeta Digital Interactiva | Invitación pública, mobile-first | `interactiveCard` |
| 2️⃣ Panel de Invitados (RSVP) | Confirmación de asistencia, alérgenos, dashboard | `guestControl` |
| 3️⃣ Galería en Vivo por QR | Fotos subidas por invitados, proyectadas en tiempo real | `liveGallery` |

---

## 📐 1. Arquitectura del proyecto y requisitos

### ⚙️ Stack

- **Backend:** Node.js + Express + Mongoose (MongoDB Atlas) + Socket.io
- **Frontend:** React (Vite) + React Router + Tailwind CSS v4 + Axios + Socket.io Client
- **Imágenes:** Cloudinary vía *Signed Upload Presets* (subida directa desde el navegador, sin pasar por el servidor)
- **Auth:** JWT (JSON Web Tokens) con `bcryptjs` para hashear contraseñas

### 🗂️ Estructura de carpetas

```
Proyecto-NyMoo/
├── backend/
│   ├── config/          # conexión a Mongo y a Cloudinary
│   ├── controllers/      # lógica de negocio (auth, events, guests, photos)
│   ├── middleware/        # requireAuth, requireEventOwnership
│   ├── models/            # User, Event, Guest, Photo
│   ├── routes/            # definición de endpoints REST
│   ├── sockets/            # (reservado para lógica de Socket.io a futuro)
│   ├── .env                # 🔒 credenciales reales (NO se commitea)
│   ├── .env.example         # plantilla de variables
│   └── server.js
└── frontend/
    ├── src/
    │   ├── components/       # ProtectedRoute, RsvpForm, dashboard/*
    │   ├── pages/              # Login, EventsList, Dashboard, DigitalCard, UploadPage, LiveFeedPage
    │   └── services/            # api.js (axios), auth.js, socket.js
    ├── .env                     # 🔒 credenciales reales (NO se commitea)
    └── .env.example
```

### 🔑 Variables de entorno — `backend/.env`

| Variable | Qué es |
|---|---|
| `PORT` | Puerto donde corre Express (default `4000`). |
| `MONGO_URI` | Cadena de conexión a tu cluster de MongoDB Atlas (incluye usuario, contraseña y base de datos). |
| `CLOUDINARY_CLOUD_NAME` | Nombre de tu cuenta/cloud en Cloudinary. |
| `CLOUDINARY_API_KEY` | API Key pública de Cloudinary. |
| `CLOUDINARY_API_SECRET` | API Secret de Cloudinary — se usa **solo en el backend** para firmar las subidas. Nunca debe llegar al frontend. |
| `CLIENT_URL` | URL del frontend, usada para configurar CORS y Socket.io (ej. `http://localhost:5173`). |
| `JWT_SECRET` | Clave secreta random usada para **firmar y verificar** los tokens de sesión. Debe ser larga e impredecible (ver más abajo cómo generarla). |
| `JWT_EXPIRES_IN` | Vigencia del token (ej. `7d` = 7 días). |

Generar un `JWT_SECRET` seguro:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

### 🔑 Variables de entorno — `frontend/.env`

| Variable | Qué es |
|---|---|
| `VITE_API_URL` | URL base de la API REST del backend (ej. `http://localhost:4000/api`). |
| `VITE_SOCKET_URL` | URL del servidor de Socket.io (ej. `http://localhost:4000`). |

### ▶️ Levantar el proyecto

```bash
# Backend
cd backend
npm install
npm run dev        # nodemon server.js -> http://localhost:4000

# Frontend (en otra terminal)
cd frontend
npm install
npm run dev         # vite -> http://localhost:5173
```

---

## 🔐 2. Guía de autenticación JWT (cómo iniciar sesión)

### 🔄 Cómo funciona el flujo

```
┌────────────┐   1. POST /api/auth/login    ┌────────────┐
│  Frontend  │ ────────────────────────────▶ │  Backend   │
│  (React)   │   { email, password }         │  (Express) │
└────────────┘                                └────────────┘
      ▲                                              │
      │   2. { token, user }                         │ bcrypt.compare()
      │      (JWT firmado con JWT_SECRET)             │ jwt.sign()
      └──────────────────────────────────────────────┘
      │
      │ 3. localStorage.setItem('nymoo_token', token)
      ▼
┌──────────────────────────────────────────────┐
│ Cada request protegido adjunta:               │
│ Authorization: Bearer <token>                 │
│ (interceptor de axios en services/api.js)     │
└──────────────────────────────────────────────┘
      │
      ▼
┌────────────┐  4. middleware requireAuth       ┌──────────────────────┐
│  Backend   │ ───────────────────────────────▶ │ requireEventOwnership │
│            │  valida jwt.verify() + busca User │ chequea organizerId   │
└────────────┘                                    └──────────────────────┘
```

1. El usuario envía email/contraseña desde `pages/Login.jsx`.
2. El backend (`controllers/authController.js`) verifica el hash con `bcrypt.compare`, y si es válido firma un JWT con `jwt.sign({ userId }, JWT_SECRET, { expiresIn })`.
3. El frontend guarda el token en `localStorage` (`services/auth.js` → `setSession`).
4. Un interceptor de Axios (`services/api.js`) agrega automáticamente el header `Authorization: Bearer <token>` a **todas** las requests salientes.
5. Las rutas privadas del backend (`GET/PATCH /api/events/:eventId`, `GET /api/guests/event/:eventId`) pasan primero por `middleware/auth.js` (¿el token es válido?) y luego por `middleware/eventOwnership.js` (¿el evento le pertenece a este usuario?).
6. Si el token es inválido o expiró → `401` → el frontend limpia la sesión y redirige a `/`. Si el token es válido pero el evento no es tuyo → `403` → se muestra "No tenés acceso a este evento".

> ⚠️ No hay refresh tokens ni logout en el servidor (es *stateless*): "cerrar sesión" simplemente borra el token guardado en el navegador.

### 📨 Ejemplo — Registro

`POST /api/auth/register`

```json
{
  "name": "Maxi Sulsenti",
  "email": "maxi@example.com",
  "password": "unaClaveDeAlMenos8Caracteres"
}
```

Respuesta `201 Created`:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "6704f1a2b3c4d5e6f7890123",
    "name": "Maxi Sulsenti",
    "email": "maxi@example.com"
  }
}
```

### 📨 Ejemplo — Login

`POST /api/auth/login`

```json
{
  "email": "maxi@example.com",
  "password": "unaClaveDeAlMenos8Caracteres"
}
```

Respuesta `200 OK`: mismo shape que el registro (`{ token, user }`).

### 🗺️ Mapa de endpoints protegidos vs. públicos

| Endpoint | Auth requerida | Uso |
|---|---|---|
| `POST /api/auth/register` / `login` | ❌ público | Alta / login del organizador |
| `GET /api/auth/me` | ✅ `requireAuth` | Obtener el usuario del token actual |
| `GET /api/events` | ✅ `requireAuth` | Listar **mis** eventos |
| `POST /api/events` | ✅ `requireAuth` | Crear evento (asigna `organizerId` automáticamente) |
| `GET /api/events/:eventId` | ✅ `requireAuth` + ownership | Datos completos del evento (Dashboard) |
| `PATCH /api/events/:eventId/modules` | ✅ `requireAuth` + ownership | Prender/apagar módulos |
| `GET /api/events/slug/:eventSlug` | ❌ público | Datos del evento para la Tarjeta Digital |
| `GET /api/guests/event/:eventId` | ✅ `requireAuth` + ownership | Lista de invitados (Dashboard) |
| `POST /api/guests/rsvp` | ❌ público | El invitado confirma asistencia |
| `GET /api/photos/sign/:eventSlug` | ❌ público | Firma de Cloudinary |
| `POST /api/photos/register` | ❌ público | Registrar foto subida + emitir por socket |

---

## 🧪 3. Paso a paso para datos de prueba (mock data)

Como ahora `POST /api/events` **exige estar logueado** y asigna el `organizerId` automáticamente, la forma más simple y correcta de tener datos de prueba es pasar por la propia API (no hace falta insertar nada a mano en Atlas). Podés usar `curl`, Postman o Thunder Client — los ejemplos usan `curl`.

### Paso 1 — Registrar un organizador de prueba

```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Organizador Demo","email":"demo@nymoo.test","password":"password123"}'
```

📋 Copiá el `token` de la respuesta — lo vas a necesitar en los próximos pasos.

### Paso 2 — Crear un evento de prueba

```bash
curl -X POST http://localhost:4000/api/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN_AQUI" \
  -d '{"eventName":"Boda de Prueba","eventSlug":"boda-prueba","date":"2026-12-20T20:00:00.000Z"}'
```

Esto crea el evento con `activeModules` en `false` (todos los módulos apagados) — es intencional, así podés probar el toggle desde el Dashboard. Copiá el `_id` del evento devuelto.

### Paso 3 — Activar los módulos para probar

Desde el Dashboard (`/dashboard/:eventId`) → pestaña **Módulos** → prendé los 3 switches. O directo por API:

```bash
curl -X PATCH http://localhost:4000/api/events/EL_EVENT_ID/modules \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN_AQUI" \
  -d '{"interactiveCard":true,"guestControl":true,"liveGallery":true}'
```

### 🗃️ Shape del documento `Event` (referencia, por si preferís insertarlo manualmente en Atlas)

```json
{
  "organizerId": "ObjectId(tu User._id)",
  "eventName": "Boda de Prueba",
  "eventSlug": "boda-prueba",
  "date": "2026-12-20T20:00:00.000Z",
  "activeModules": {
    "interactiveCard": true,
    "guestControl": true,
    "liveGallery": true
  },
  "gallerySettings": {
    "cloudinaryFolder": "eventos/boda-prueba",
    "isApprovedRequired": false
  }
}
```

> ⚠️ Si lo insertás a mano en Atlas, `organizerId` **tiene que ser** el `_id` real de un `User` existente (el que te devolvió el registro), o el Dashboard te va a rechazar el acceso con `403 No tenés acceso a este evento`.

---

## ✅ 4. Flujo de verificación (checklist de pruebas)

### 🅰️ Prueba A — Registro/Login y obtención del JWT

- [ ] `POST /api/auth/register` devuelve `201` con `token` + `user`.
- [ ] `POST /api/auth/login` con las mismas credenciales devuelve `200` con un nuevo `token`.
- [ ] En el navegador, `http://localhost:5173/` → completar el form → redirige a `/eventos`.
- [ ] `localStorage` del navegador tiene las keys `nymoo_token` y `nymoo_user` (DevTools → Application → Local Storage).

### 🅱️ Prueba B — Dashboard + switches de módulos

- [ ] Con sesión iniciada, entrar a `/eventos` y ver el evento de prueba listado.
- [ ] Click en el evento → entra a `/dashboard/:eventId` sin error `403`.
- [ ] Pestaña **Estadísticas**: se ven las 4 tarjetas (Total/Confirmados/Declinados/Pendientes) en `0` si todavía no hay invitados.
- [ ] Pestaña **Módulos**: togglear un switch → refrescar la página → el estado se mantiene (persistió en Mongo).
- [ ] Cerrar sesión y volver a `/dashboard/:eventId` a mano por URL → debe redirigir a `/` (login).

### 🅲️ Prueba C — Tarjeta digital interactiva

- [ ] Con `interactiveCard: true`, abrir `http://localhost:5173/evento/boda-prueba` (sin login, en pestaña incógnito).
- [ ] Se ve el nombre del evento, fecha/hora formateada y el botón **Confirmar Asistencia**.
- [ ] Click en el botón → abre el modal `RsvpForm`.
- [ ] Completar y enviar → mensaje de éxito → volver al Dashboard → el invitado aparece en la tabla y las estadísticas se actualizan.
- [ ] Con `interactiveCard: false`, la misma URL muestra "Esta invitación todavía no está disponible."

### 🅳️ Prueba D — Galería QR en vivo (Cloudinary + Socket.io)

- [ ] Con `liveGallery: true`, abrir en una pestaña `http://localhost:5173/evento/boda-prueba/live-feed` (esta es la "pantalla del salón").
- [ ] En el Dashboard → pestaña **Accesos rápidos** → escanear el QR con el celular (o abrir manualmente `/evento/boda-prueba/upload` en otra pestaña/dispositivo).
- [ ] Seleccionar una foto → botón "Subir foto":
  1. El frontend pide la firma → `GET /api/photos/sign/boda-prueba`.
  2. Sube el archivo directo a Cloudinary (`api.cloudinary.com`) — revisar en la pestaña **Network** que la request va a Cloudinary, no a tu backend.
  3. El frontend registra la foto → `POST /api/photos/register`.
  4. El backend emite `new-photo` por Socket.io a la sala `boda-prueba`.
- [ ] La foto aparece **sin recargar** en la pestaña de `/live-feed` con la animación de entrada.
- [ ] La foto quedó guardada en Cloudinary dentro de la carpeta `eventos/boda-prueba/`.

---

Si alguna de estas pruebas falla, revisá primero la consola del backend (errores de conexión a Mongo/Cloudinary) y la pestaña Network del navegador (¿el token va en el header?, ¿la respuesta es 401/403/404?).
