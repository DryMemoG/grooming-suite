import { z } from 'zod';

export const TamanoMascotaEnum = z.enum(['PEQUENO', 'MEDIANO', 'GRANDE']);

export const MascotaSchema = z.object({
  id: z.string().cuid(),
  nombre: z.string().min(1),
  especie: z.string().min(1),
  raza: z.string().optional(),
  tamano: TamanoMascotaEnum.optional(),
  fechaNacimiento: z.coerce.date().optional(),
  notasMedicas: z.string().optional(),
  activo: z.boolean().default(true),
  clienteId: z.string().cuid(),
});

export const CreateMascotaSchema = MascotaSchema.omit({ id: true });
export const UpdateMascotaSchema = CreateMascotaSchema.partial();

export type Mascota = z.infer<typeof MascotaSchema>;
export type CreateMascota = z.infer<typeof CreateMascotaSchema>;
export type UpdateMascota = z.infer<typeof UpdateMascotaSchema>;
