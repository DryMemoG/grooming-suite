import { z } from 'zod';

export const ClienteSchema = z.object({
  id: z.string().cuid(),
  nombre: z.string().min(1),
  telefonoPrincipal: z.string().min(8),
  telefonoSecundario: z.string().optional(),
  nit: z.string().optional(),
  direccion: z.string().optional(),
  latitud: z.number().optional(),
  longitud: z.number().optional(),
  recordatoriosCita: z.boolean().default(true),
  notas: z.string().optional(),
  activo: z.boolean().default(true),
  sucursalId: z.string().cuid(),
});

export const CreateClienteSchema = ClienteSchema.omit({ id: true });
export const UpdateClienteSchema = CreateClienteSchema.partial();

export type Cliente = z.infer<typeof ClienteSchema>;
export type CreateCliente = z.infer<typeof CreateClienteSchema>;
export type UpdateCliente = z.infer<typeof UpdateClienteSchema>;
