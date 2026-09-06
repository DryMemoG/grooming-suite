import { z } from 'zod';

export const ModalidadEnum = z.enum(['LOCAL', 'DOMICILIO']);
export const EstadoCitaEnum = z.enum([
  'PENDIENTE',
  'CONFIRMADA',
  'EN_PROCESO',
  'COMPLETADA',
  'CANCELADA',
]);

export const CitaSchema = z.object({
  id: z.string().cuid(),
  fechaHoraInicio: z.coerce.date(),
  duracionMin: z.number().int().positive(),
  modalidad: ModalidadEnum.default('LOCAL'),
  estado: EstadoCitaEnum.default('PENDIENTE'),
  notas: z.string().optional(),
  sucursalId: z.string().cuid(),
  clienteId: z.string().cuid(),
  mascotaId: z.string().cuid(),
  asignadoAId: z.string().cuid().optional(),
});

export const CreateCitaSchema = CitaSchema.omit({ id: true, estado: true }).extend({
  estado: EstadoCitaEnum.optional(),
});
export const UpdateCitaSchema = CreateCitaSchema.partial();

export type Cita = z.infer<typeof CitaSchema>;
export type CreateCita = z.infer<typeof CreateCitaSchema>;
export type UpdateCita = z.infer<typeof UpdateCitaSchema>;
