// api/types.ts

export interface LineItemResponse {
  id: number;
  description: string;
  quantity: number;
  unitPriceMinor: number;
  totalMinor: number;
}

export interface InvoiceResponse {
  id: number;
  number: string;

  customerName: string;
  customerEmail: string;
  currency: string;

  lineItems: LineItemResponse[];

  subtotalMinor: number;
  taxMinor: number;
  totalMinor: number;

  taxRateBps: number;

  status: "draft" | "issued" | "paid" | "void";

  issuedAt: string;
  dueAt: string;
  createdAt: string;
}

export interface InvoiceListResponse {
  data: InvoiceResponse[];

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
export type InvoiceStatus =
  | "draft"
  | "issued"
  | "paid"
  | "void";

export interface UpdateInvoiceStatusPayload {
  status: InvoiceStatus;
}