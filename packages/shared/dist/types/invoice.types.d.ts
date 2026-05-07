export type InvoiceStatus = 'draft' | 'issued' | 'paid' | 'void';
export interface LineItem {
    id: number;
    description: string;
    quantity: number;
    unitPriceMinor: number;
    totalMinor: number;
}
export interface Invoice {
    id: number;
    number: string;
    customerName: string;
    customerEmail: string;
    currency: string;
    lineItems: LineItem[];
    subtotalMinor: number;
    taxMinor: number;
    totalMinor: number;
    taxRateBps: number;
    status: InvoiceStatus;
    issuedAt: string;
    dueAt: string;
    createdAt: string;
}
export interface InvoiceListResponse {
    data: Invoice[];
    total: number;
    page: number;
    limit: number;
}
export interface CreateLineItemPayload {
    description: string;
    quantity: number;
    unitPriceMinor: number;
}
export interface CreateInvoicePayload {
    customerName: string;
    customerEmail: string;
    currency: string;
    lineItems: CreateLineItemPayload[];
    taxRateBps: number;
    issuedAt: string;
    dueAt: string;
}
export interface UpdateInvoiceStatusPayload {
    status: InvoiceStatus;
}
//# sourceMappingURL=invoice.types.d.ts.map