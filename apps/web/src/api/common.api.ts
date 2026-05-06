import axiosInstance from "./axiosInstance"
import endpoints from "./endpoints"
import type {
    InvoiceListResponse,
    CreateInvoicePayload,
    UpdateInvoiceStatusPayload,
    InvoiceResponse,
} from "./types";

const apiClient = {
    getInvoiceListing: async (
        page = 1,
        limit = 10
    ): Promise<InvoiceListResponse> => {
        const response =
            await axiosInstance.get<InvoiceListResponse>(
                endpoints.getInvoices,
                {
                    params: {
                        page,
                        limit,
                    },
                }
            );

        return response.data;
    },

    postInvoice: async (
        payload: CreateInvoicePayload
    ): Promise<InvoiceResponse> => {
        const response =
            await axiosInstance.post<InvoiceResponse>(
                endpoints.postInvoices,
                payload
            );

        return response.data;
    },
    getInvoiceById: async (
        id: string
    ): Promise<InvoiceResponse> => {
        const response =
            await axiosInstance.get<InvoiceResponse>(
                endpoints.getInvoiceById(id)
            );

        return response.data;
    },

    updateInvoiceStatus: async (
        id: string,
         status: "issued" | "paid" | "void"
    ): Promise<InvoiceResponse> => {
        const response =
            await axiosInstance.patch<InvoiceResponse>(
                endpoints.updateInvoiceStatus(id),
                {
                    status,
                }
            );

        return response.data;
    },

    downloadInvoicePdf: async (
        id: string
    ): Promise<Blob> => {
        const response =
            await axiosInstance.get(
                endpoints.downloadInvoicePdf(id),
                {
                    responseType: "blob",
                }
            );

        return response.data;
    },
}
export default apiClient;