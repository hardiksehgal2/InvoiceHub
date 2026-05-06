const endpoints = {
    postInvoices: "/invoices",
    getInvoices: "/invoices",
    getInvoiceById(id: string) {
        return `/invoices/${id}`
    },
    updateInvoiceStatus(id: string) {
        return `/invoices/${id}/status`;
    },

    downloadInvoicePdf(id: string) {
        return `/invoices/${id}/pdf`;
    },
}

export default endpoints