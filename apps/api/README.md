# @grooming-suite/api

Backend del núcleo: Fastify + Prisma 7 + PostgreSQL.

## Setup local

1. `cp .env.example .env` y completá `DATABASE_URL` con tu Postgres local.
2. Generá un `JWT_SECRET` con `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
   y pegalo en `.env`. Nunca reuses un secreto de un ejemplo o de otro ambiente.
3. `pnpm install` (desde la raíz del monorepo) — esto además dispara `prisma generate` automáticamente vía `postinstall`.
4. `pnpm --filter @grooming-suite/api exec prisma migrate dev` — crea las tablas.
5. `pnpm --filter @grooming-suite/api exec prisma db seed` — carga sucursal, roles y usuario admin base.
6. `pnpm dev:api` (desde la raíz) — levanta el servidor.

## Notas sobre Prisma 7 (por qué el código no se ve como en la mayoría de tutoriales)

- **La URL de conexión vive en `prisma.config.ts`**, no en el `datasource` de `schema.prisma`. Ese bloque en el schema no lleva `url`.
- **El generador de Prisma Client tiene `output` explícito** (`src/generated/prisma`) — desde Prisma 7 ya no se genera dentro de `node_modules` por defecto. Por eso el import es `from '../generated/prisma'` (o `'../src/generated/prisma'` según el archivo), nunca `from '@prisma/client'` directo.
- **`PrismaClient` requiere un driver adapter explícito** (`@prisma/adapter-pg` + `pg`) — Prisma 7 ya no trae el motor de conexión embebido. Cualquier archivo nuevo que instancie `PrismaClient` (fuera de `lib/prisma.ts`, que ya lo reusa) necesita repetir el patrón del adapter.
- **`prisma init` en esta versión tiene un bug conocido** con `definePrismaConfig` (esa función es de Prisma 8, no 7) — por eso `prisma.config.ts` y `prisma/schema.prisma` se armaron a mano en vez de generados por el comando.

## Notas sobre autenticación

- **JWT access token (15 min) + refresh token opaco (30 días)**, no sesiones
  clásicas — decisión tomada por la necesidad de múltiples tipos de cliente
  (web, Android/Capacitor, iOS nativo a futuro), que no manejan cookies de
  sesión de forma uniforme.
- **El refresh token se hashea con SHA-256, no con Argon2** — a diferencia de
  la contraseña, un refresh token es aleatorio de alta entropía, no algo que
  un humano eligió. Argon2 ahí solo agregaría costo de CPU en cada refresh,
  sin ganancia real de seguridad.
- **Rotación + detección de reuso**: cada refresh invalida el token anterior
  y emite uno nuevo. Si se presenta un token ya usado/revocado, se revocan
  TODOS los refresh tokens activos de ese usuario — señal de robo.
- **Mismo mensaje de error** ("Credenciales inválidas") para email inexistente
  y contraseña incorrecta — evita que alguien pueda enumerar qué emails están
  registrados probando el login.
- **`secure: !isDev` en la cookie**, no `true` fijo — en `localhost` sin HTTPS,
  una cookie `secure: true` se descarta en silencio y el refresh "no funciona"
  sin ningún error visible. Se vuelve `true` real en producción.
- **El seed usa `upsert`, y el `update` debe reflejar cualquier cambio de
  contraseña que pongas en el `create`** — si solo cambiás el `create` y
  el usuario ya existe en tu base, `upsert` no toca nada y seguís logueado
  con la contraseña vieja (nos pasó, ya está corregido).

## Pendiente

- Hook de autorización por permisos (`requirePermission('clientes.crear')`,
  etc.) usando el campo `Rol.permisos` — se arma junto con el primer CRUD,
  no tiene sentido antes de tener una ruta real que proteger.

## Notas de dependencias

- **`zod` no es una dependencia directa de este paquete, a propósito.**
  Toda la validación vive en `@grooming-suite/shared` — `api` solo
  consume los schemas ya construidos (ej. `BrandingSchema.parse(...)`).
  Si en algún momento necesitás importar `zod` directo acá, es señal
  de que esa validación debería vivir en `shared`, no acá.

## Endpoints disponibles

- `GET /health`
- `GET /config/branding`
- `POST /auth/login` — `{ email, password }` → `{ accessToken, usuario }` + cookie `refreshToken`
- `POST /auth/refresh` — sin body, usa la cookie → `{ accessToken }` + rota la cookie
- `POST /auth/logout` — sin body, revoca el refresh token y limpia la cookie