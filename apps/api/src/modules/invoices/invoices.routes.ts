import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from '@fastify/type-provider-zod'
import {
    CreateInvoiceBodySchema,
    ListInvoicesQuerySchema,
    InvoiceIdParamSchema,
    UpdateStatusBodySchema,
    InvoiceResponseSchema,
    InvoiceListResponseSchema
} from './invoices.schema'


import {
    createInvoice,
    listInvoices,
    getInvoice,
    updateInvoiceStatus
} from './invoices.service'
import { renderInvoicePDF } from '../../pdf/InvoicePDF'
import { InvoiceStatus } from '@prisma/client'

export async function invoiceRoutes(fastify: FastifyInstance) {
    const app = fastify.withTypeProvider<ZodTypeProvider>()

    app.post('', {
        schema: {
            body: CreateInvoiceBodySchema,
            response: { 201: InvoiceResponseSchema }
        }
    }, async (req, reply) => {
        const invoice = await createInvoice(fastify.prisma, req.body)
        return reply.status(201).send(invoice)
    })

    app.get('', {
        schema: {
            querystring: ListInvoicesQuerySchema,
            response: { 200: InvoiceListResponseSchema }
        }
    }, async (req, reply) => {
        const { page, limit } = req.query
        const result = await listInvoices(fastify.prisma, page, limit)
        return reply.send(result)
    })

    app.get('/:id', {
        schema: {
            params: InvoiceIdParamSchema,
            response: { 200: InvoiceResponseSchema }
        }
    }, async (req, reply) => {
        const invoice = await getInvoice(fastify.prisma, req.params.id)
        if (!invoice) throw fastify.httpErrors.notFound('Invoice not found')
        return reply.send(invoice)
    })

    app.patch('/:id/status', {
        schema: {
            params: InvoiceIdParamSchema,
            body: UpdateStatusBodySchema,
            response: { 200: InvoiceResponseSchema }
        }
    }, async (req, reply) => {
        let invoice
        try {
            invoice = await updateInvoiceStatus(
                fastify.prisma,
                req.params.id,
                req.body.status as InvoiceStatus
            )
        } catch (err) {
            throw fastify.httpErrors.unprocessableEntity((err as Error).message)
        }
        if (!invoice) throw fastify.httpErrors.notFound('Invoice not found')
        return reply.send(invoice)
    })

    app.get('/:id/pdf', {
        schema: {
            params: InvoiceIdParamSchema
        }
    }, async (req, reply) => {
        const invoice = await getInvoice(fastify.prisma, req.params.id)
        if (!invoice) throw fastify.httpErrors.notFound('Invoice not found')

        const buffer = await renderInvoicePDF(invoice)
        return reply
            .header('Content-Type', 'application/pdf')
            .header('Content-Disposition', `attachment; filename="${invoice.number}.pdf"`)
            .send(buffer)
    })
}
