import { z } from 'zod'

export { CreateInvoiceSchema as CreateInvoiceBodySchema } from '@omazons/shared'
export { UpdateInvoiceStatusSchema as UpdateStatusBodySchema } from '@omazons/shared'

export const ListInvoicesQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20)
})

export const InvoiceIdParamSchema = z.object({
  id: z.coerce.number().int().positive()
})

const LineItemResponseSchema = z.object({
  id: z.number(),
  description: z.string(),
  quantity: z.number(),
  unitPriceMinor: z.number(),
  totalMinor: z.number()
})

export const InvoiceResponseSchema = z.object({
  id: z.number(),
  number: z.string(),
  customerName: z.string(),
  customerEmail: z.string(),
  currency: z.string(),
  lineItems: z.array(LineItemResponseSchema),
  subtotalMinor: z.number(),
  taxMinor: z.number(),
  totalMinor: z.number(),
  taxRateBps: z.number(),
  status: z.enum(['draft', 'issued', 'paid', 'void']),
  issuedAt: z.string(),
  dueAt: z.string(),
  createdAt: z.string()
})

export const InvoiceListResponseSchema = z.object({
  data: z.array(InvoiceResponseSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number()
})
