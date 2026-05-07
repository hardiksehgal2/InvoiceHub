const endpoints = {
  getInvoices: '/invoices',
  postInvoices: '/invoices',
  getInvoiceById: (id: string) => `/invoices/${id}`,
  updateInvoiceStatus: (id: string) => `/invoices/${id}/status`,
  downloadInvoicePdf: (id: string) => `/invoices/${id}/pdf`,
}

export default endpoints
