// packages/shared/src/utils/invoice-status.ts
import type { InvoiceStatus } from '../types/invoice.types'

export const ALLOWED_STATUS_TRANSITIONS: Record<InvoiceStatus, InvoiceStatus[]> = {
  draft: ['issued'],
  issued: ['paid', 'void'],
  paid: [],
  void: [],
}

export function canTransitionInvoice(
  currentStatus: InvoiceStatus,
  newStatus: InvoiceStatus
): boolean {
  return ALLOWED_STATUS_TRANSITIONS[currentStatus].includes(newStatus)
}
