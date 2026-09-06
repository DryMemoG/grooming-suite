import { z } from 'zod';

// Roles como tabla (no enum) a propósito: así el admin puede crear
// roles nuevos (ej. "Groomer Senior") sin tocar código ni migraciones.
export const RolSchema = z.object({
  id: z.string().cuid(),
  nombre: z.string().min(1),
  permisos: z.array(z.string()).default([]),
});

export const CreateRolSchema = RolSchema.omit({ id: true });
export const UpdateRolSchema = CreateRolSchema.partial();

export type Rol = z.infer<typeof RolSchema>;
export type CreateRol = z.infer<typeof CreateRolSchema>;
export type UpdateRol = z.infer<typeof UpdateRolSchema>;
