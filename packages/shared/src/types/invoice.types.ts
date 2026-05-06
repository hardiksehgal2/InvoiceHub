// packages/shared/src/types/invoice.types.ts
export type InvoiceStatus = 'draft' | 'issued' | 'paid' | 'void'

export interface LineItem {
  id: number
  description: string
  quantity: number
  unitPriceMinor: number
  totalMinor: number
}

export interface Invoice {
  id: number
  number: string
  customerName: string
  customerEmail: string
  currency: string
  lineItems: LineItem[]
  subtotalMinor: number
  taxMinor: number
  totalMinor: number
  taxRateBps: number
  status: InvoiceStatus
  issuedAt: string
  dueAt: string
  createdAt: string
}