import { z } from 'zod';

export const SucursalSchema = z.object({
  id: z.string().cuid(),
  nombre: z.string().min(1),
  direccion: z.string().optional(),
  telefono: z.string().optional(),
  activa: z.boolean().default(true),
});

export const CreateSucursalSchema = SucursalSchema.omit({ id: true });
export const UpdateSucursalSchema = CreateSucursalSchema.partial();

export type Sucursal = z.infer<typeof SucursalSchema>;
export type CreateSucursal = z.infer<typeof CreateSucursalSchema>;
export type UpdateSucursal = z.infer<typeof UpdateSucursalSchema>;
