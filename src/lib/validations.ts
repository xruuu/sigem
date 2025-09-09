import { z } from "zod";
export const nodrizaSchema = z.object({ id: z.string().min(1), nombre: z.string().min(1) });
export const aeronaveSchema = z.object({
  id: z.string().min(1),
  nombre: z.string().min(1),
  maximoMarcianos: z.number().int().nonnegative(),
  origenId: z.string().min(1),
  destinoId: z.string().min(1),
});
export const pasajeroSchema = z.object({ id: z.string().min(1), nombre: z.string().min(1) });
export const asignarSchema = z.object({ pasajeroId: z.string().min(1), aeronaveId: z.string().min(1) });
export const bajarSchema = z.object({ pasajeroId: z.string().min(1), aeronaveId: z.string().min(1) });
export const revisionSchema = z.object({
  id: z.string().min(1),
  nombreRevisor: z.string().min(1),
  aeronaveId: z.string().min(1),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});
