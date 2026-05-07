import { z } from 'zod';
export declare const LineItemSchema: z.ZodObject<{
    description: z.ZodString;
    quantity: z.ZodNumber;
    unitPriceMinor: z.ZodNumber;
}, z.core.$strip>;
export declare const CreateInvoiceSchema: z.ZodObject<{
    customerName: z.ZodString;
    customerEmail: z.ZodString;
    currency: z.ZodString;
    lineItems: z.ZodArray<z.ZodObject<{
        description: z.ZodString;
        quantity: z.ZodNumber;
        unitPriceMinor: z.ZodNumber;
    }, z.core.$strip>>;
    taxRateBps: z.ZodNumber;
    issuedAt: z.ZodString;
    dueAt: z.ZodString;
}, z.core.$strip>;
export declare const UpdateInvoiceStatusSchema: z.ZodObject<{
    status: z.ZodEnum<{
        issued: "issued";
        paid: "paid";
        void: "void";
    }>;
}, z.core.$strip>;
export type CreateInvoiceInput = z.infer<typeof CreateInvoiceSchema>;
export type UpdateInvoiceStatusInput = z.infer<typeof UpdateInvoiceStatusSchema>;
//# sourceMappingURL=invoice.schemas.d.ts.map