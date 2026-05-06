// utils/invoice-status.ts

import type { InvoiceStatus } from "@/api/types";

export const ALLOWED_STATUS_TRANSITIONS: Record<
  InvoiceStatus,
  InvoiceStatus[]
> = {
  draft: ["issued"],

  issued: ["paid", "void"],

  paid: [],

  void: [],
};

export function canTransitionInvoice(
  currentStatus: InvoiceStatus,
  newStatus: InvoiceStatus
) {
  return ALLOWED_STATUS_TRANSITIONS[
    currentStatus
  ].includes(newStatus);
}