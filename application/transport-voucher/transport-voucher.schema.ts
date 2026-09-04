import { z } from "zod";

export const transportModalSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1, "Nome do modal é obrigatório."),
  unitValue: z.coerce.number().positive("Valor unitário deve ser maior que zero."),
  quantity: z.coerce.number().int().min(1, "Quantidade deve ser maior ou igual a 1."),
});

export const transportVoucherSchema = z.object({
  employeeId: z.string().trim().min(1, "Colaborador é obrigatório."),
  referenceMonth: z.string().trim().min(1, "Mês de referência é obrigatório."),
  workingDays: z.coerce.number().int().min(0, "Dias úteis não pode ser negativo."),
  weekendHolidayDays: z.coerce.number().int().min(0).optional().default(0),
  weekendHolidayValue: z.coerce.number().min(0).nullable().optional().default(null),
  nightJokerIndicator: z.coerce.boolean().optional().default(false),
  discountPercentage: z.coerce.number().min(0).max(100).nullable().optional().default(null),
  observations: z.string().nullable().optional(),
  modals: z.array(transportModalSchema).min(1, "Adicione pelo menos um modal."),
});

export type TransportVoucherParsedInput = z.infer<typeof transportVoucherSchema>;

export function formatZodError(error: z.ZodError): string {
  const messages = error.issues.map((issue) => issue.message);
  return messages.length > 0 ? messages.join(" ") : "Dados inválidos para o vale transporte.";
}
