// api/validations/invoice.validation.ts

import { z } from "zod";

export const invoiceSchema = z.object({
    customerName: z.string().min(2),

    customerEmail: z.string().email(),

    currency: z.string(),

    taxRateBps: z.coerce
        .number({
            invalid_type_error:
                "Tax rate must be a number",
        })
        .int("No decimal values allowed")
        .min(0, "Minimum tax is 0%")
        .max(10000, "Maximum tax is 100%"),
    issuedAt: z.string(),

    dueAt: z.string(),

    lineItems: z.array(
        z.object({
            description: z
                .string()
                .min(3, "Description must be at least 3 characters"),

            quantity: z.coerce
                .number()
                .min(1, "Quantity must be greater than 0"),

            unitPriceMinor: z.coerce
                .number()
                .min(1, "Price must be greater than 0"),
        })
    ),
});

export type InvoiceFormValues = z.infer<
    typeof invoiceSchema
>;