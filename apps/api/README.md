# @grooming-suite/api

Backend del núcleo: Fastify + Prisma 7 + PostgreSQL.

## Setup local

1. `cp .env.example .env` y completá `DATABASE_URL` con tu Postgres local.
2. `pnpm install` (desde la raíz del monorepo) — esto además dispara `prisma generate` automáticamente vía `postinstall`.
3. `pnpm --filter @grooming-suite/api exec prisma migrate dev` — crea las tablas.
4. `pnpm --filter @grooming-suite/api exec prisma db seed` — carga sucursal, roles y usuario admin base.
5. `pnpm dev:api` (desde la raíz) — levanta el servidor.

## Notas sobre Prisma 7 (por qué el código no se ve como en la mayoría de tutoriales)

- **La URL de conexión vive en `prisma.config.ts`**, no en el `datasource` de `schema.prisma`. Ese bloque en el schema no lleva `url`.
- **El generador de Prisma Client tiene `output` explícito** (`src/generated/prisma`) — desde Prisma 7 ya no se genera dentro de `node_modules` por defecto. Por eso el import es `from '../generated/prisma'` (o `'../src/generated/prisma'` según el archivo), nunca `from '@prisma/client'` directo.
- **`PrismaClient` requiere un driver adapter explícito** (`@prisma/adapter-pg` + `pg`) — Prisma 7 ya no trae el motor de conexión embebido. Cualquier archivo nuevo que instancie `PrismaClient` (fuera de `lib/prisma.ts`, que ya lo reusa) necesita repetir el patrón del adapter.
- **`prisma init` en esta versión tiene un bug conocido** con `definePrismaConfig` (esa función es de Prisma 8, no 7) — por eso `prisma.config.ts` y `prisma/schema.prisma` se armaron a mano en vez de generados por el comando.

## Notas de dependencias

- **`zod` no es una dependencia directa de este paquete, a propósito.**
  Toda la validación vive en `@grooming-suite/shared` — `api` solo
  consume los schemas ya construidos (ej. `BrandingSchema.parse(...)`).
  Si en algún momento necesitás importar `zod` directo acá, es señal
  de que esa validación debería vivir en `shared`, no acá.

## Pendiente

- Módulo de auth (JWT + refresh) sobre `Usuario`/`Rol`.
- Servidor Fastify (health check + `/config/branding`).