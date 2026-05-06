// packages/shared/src/schemas/invoice.schemas.ts
import { z } from 'zod'

export const LineItemSchema = z.object({
  description: z.string().min(1),
  quantity: z.number().int().positive(),
  unitPriceMinor: z.number().int().positive()
})

export const CreateInvoiceSchema = z.object({
  customerName: z.string().min(1),
  customerEmail: z.string().email(),
  currency: z.string().length(3),       // "INR", "USD"
  lineItems: z.array(LineItemSchema).min(1),
  taxRateBps: z.number().int().min(0).max(10000),
  issuedAt: z.string().datetime(),
  dueAt: z.string().datetime()
})

export const UpdateInvoiceStatusSchema = z.object({
  status: z.enum(['issued', 'paid', 'void'])
})

export type CreateInvoiceInput = z.infer<typeof CreateInvoiceSchema>
export type UpdateInvoiceStatusInput = z.infer<typeof UpdateInvoiceStatusSchema>