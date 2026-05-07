import type { InvoiceStatus } from '../types/invoice.types';
export declare const ALLOWED_STATUS_TRANSITIONS: Record<InvoiceStatus, InvoiceStatus[]>;
export declare function canTransitionInvoice(currentStatus: InvoiceStatus, newStatus: InvoiceStatus): boolean;
//# sourceMappingURL=invoice-status.d.ts.map