import { z } from 'zod';

export const UsuarioSchema = z.object({
  id: z.string().cuid(),
  nombre: z.string().min(1),
  email: z.string().email(),
  activo: z.boolean().default(true),
  rolId: z.string().cuid(),
  sucursalId: z.string().cuid().optional(),
});

// La contraseña solo viaja en el create/update de entrada, nunca en
// el modelo de salida (por eso no está en UsuarioSchema).
export const CreateUsuarioSchema = UsuarioSchema.omit({ id: true }).extend({
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
});
export const UpdateUsuarioSchema = UsuarioSchema.omit({ id: true }).partial();

export type Usuario = z.infer<typeof UsuarioSchema>;
export type CreateUsuario = z.infer<typeof CreateUsuarioSchema>;
export type UpdateUsuario = z.infer<typeof UpdateUsuarioSchema>;
