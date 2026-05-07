"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateInvoiceStatusSchema = exports.CreateInvoiceSchema = exports.LineItemSchema = void 0;
// packages/shared/src/schemas/invoice.schemas.ts
const zod_1 = require("zod");
exports.LineItemSchema = zod_1.z.object({
    description: zod_1.z.string().min(1),
    quantity: zod_1.z.number().int().positive(),
    unitPriceMinor: zod_1.z.number().int().positive()
});
exports.CreateInvoiceSchema = zod_1.z.object({
    customerName: zod_1.z.string().min(1),
    customerEmail: zod_1.z.string().email(),
    currency: zod_1.z.string().length(3), // "INR", "USD"
    lineItems: zod_1.z.array(exports.LineItemSchema).min(1),
    taxRateBps: zod_1.z.number().int().min(0).max(10000),
    issuedAt: zod_1.z.string().datetime(),
    dueAt: zod_1.z.string().datetime()
});
exports.UpdateInvoiceStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(['issued', 'paid', 'void'])
});
//# sourceMappingURL=invoice.schemas.js.map