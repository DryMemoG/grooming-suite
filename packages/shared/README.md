# @grooming-suite/shared

Paquete interno del monorepo — no se publica a npm. Es la única fuente
de verdad para la forma y validación de las entidades del núcleo del
sistema, consumida tanto por `apps/api` como (a futuro) por `apps/web`
y `apps/mobile`.

## Convenciones

- **IDs**: `cuid()`, no autoincrementales.
- **Fechas**: los campos que llegan desde un body JSON usan
  `z.coerce.date()`, no `z.date()`, porque HTTP siempre transporta
  fechas como string.
- **Cada entidad tiene 3 variantes**:
  - `XSchema` — modelo completo, lo que la API devuelve hacia afuera.
  - `CreateXSchema` — sin `id`, para el body de un POST.
  - `UpdateXSchema` — `CreateXSchema.partial()`, para PATCH.
- **Enums** se exportan aparte del objeto principal (ej.
  `TamanoMascotaEnum`, `EstadoCitaEnum`) para poder reutilizarlos en
  selects del frontend sin repetir el array de valores a mano.
- **Seguridad**: `UsuarioSchema` (lectura) nunca incluye la contraseña.
  Solo `CreateUsuarioSchema` la recibe, en texto plano, para hashearla
  en el backend antes de guardar.
- **Una sola fuente de verdad por regla de negocio**: los defaults que
  ya están declarados en `schema.prisma` (ej. `estado` de una Cita) no
  se repiten en Zod, para no tener que actualizar la regla en dos
  lugares el día que cambie.

## Entidades incluidas (núcleo MVP)

`Sucursal`, `Rol`, `Usuario`, `Cliente`, `Mascota`, `Cita`.

## Uso

```ts
import { ClienteSchema, CreateClienteSchema } from '@grooming-suite/shared';
```

## Pendiente

- Schemas de POS/Inventario (fase 2 del proyecto).