import type {
  Invoice,
  InvoiceListResponse,
  CreateInvoicePayload,
  UpdateInvoiceStatusPayload,
} from '@omazons/shared'
import axiosInstance from './axiosInstance'
import endpoints from './endpoints'

export const invoicesApi = {
  list: (page: number, limit: number): Promise<InvoiceListResponse> =>
    axiosInstance
      .get<InvoiceListResponse>(endpoints.getInvoices, { params: { page, limit } })
      .then((r) => r.data),

  getById: (id: string): Promise<Invoice> =>
    axiosInstance.get<Invoice>(endpoints.getInvoiceById(id)).then((r) => r.data),

  create: (payload: CreateInvoicePayload): Promise<Invoice> =>
    axiosInstance.post<Invoice>(endpoints.postInvoices, payload).then((r) => r.data),

  updateStatus: (id: string, payload: UpdateInvoiceStatusPayload): Promise<Invoice> =>
    axiosInstance
      .patch<Invoice>(endpoints.updateInvoiceStatus(id), payload)
      .then((r) => r.data),

  downloadPdf: (id: string): Promise<Blob> =>
    axiosInstance
      .get(endpoints.downloadInvoicePdf(id), { responseType: 'blob' })
      .then((r) => r.data as Blob),
}
