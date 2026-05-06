import { PrismaClient, InvoiceStatus } from '@prisma/client'
import { format } from 'date-fns'
import { calcSubtotal, calcTax } from '../../utils/money'

type CreateInvoiceInput = {
  customerName: string
  customerEmail: string
  currency: string
  lineItems: Array<{ description: string; quantity: number; unitPriceMinor: number }>
  taxRateBps: number
  issuedAt: string
  dueAt: string
}

const ALLOWED_TRANSITIONS: Record<InvoiceStatus, InvoiceStatus[]> = {
  draft: ['issued'],
  issued: ['paid', 'void'],
  paid: [],
  void: []
}

function formatInvoice(invoice: {
  id: number
  number: string
  customerName: string
  customerEmail: string
  currency: string
  subtotalMinor: number
  taxMinor: number
  totalMinor: number
  taxRateBps: number
  status: InvoiceStatus
  issuedAt: Date
  dueAt: Date
  createdAt: Date
  lineItems: Array<{ id: number; description: string; quantity: number; unitPriceMinor: number; totalMinor: number }>
}) {
  return {
    ...invoice,
    issuedAt: invoice.issuedAt.toISOString(),
    dueAt: invoice.dueAt.toISOString(),
    createdAt: invoice.createdAt.toISOString()
  }
}

export async function createInvoice(prisma: PrismaClient, input: CreateInvoiceInput) {
  const issuedAt = new Date(input.issuedAt)
  const dueAt = new Date(input.dueAt)

  const lineItemsWithTotals = input.lineItems.map(item => ({
    ...item,
    totalMinor: item.quantity * item.unitPriceMinor
  }))

  const subtotalMinor = calcSubtotal(lineItemsWithTotals)
  
  const taxMinor = calcTax(subtotalMinor, input.taxRateBps)
  const totalMinor = subtotalMinor + taxMinor

  const invoice = await prisma.$transaction(async tx => {
    const yearMonth = format(issuedAt, 'yyyyMM')
    const counter = await tx.invoiceCounter.upsert({
      where: { yearMonth },
      update: { lastNumber: { increment: 1 } },
      create: { yearMonth, lastNumber: 1 }
    })
    const seq = String(counter.lastNumber).padStart(4, '0')
    const number = `INV-${yearMonth}-${seq}`

    return tx.invoice.create({
      data: {
        number,
        customerName: input.customerName,
        customerEmail: input.customerEmail,
        currency: input.currency,
        subtotalMinor,
        taxMinor,
        totalMinor,
        taxRateBps: input.taxRateBps,
        issuedAt,
        dueAt,
        lineItems: { create: lineItemsWithTotals }
      },
      include: { lineItems: true }
    })
  })

  return formatInvoice(invoice)
}

export async function listInvoices(prisma: PrismaClient, page: number, limit: number) {
  const [invoices, total] = await prisma.$transaction([
    prisma.invoice.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { lineItems: true }
    }),
    prisma.invoice.count()
  ])

  return {
    data: invoices.map(formatInvoice),
    total,
    page,
    limit
  }
}

export async function getInvoice(prisma: PrismaClient, id: number) {
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: { lineItems: true }
  })
  if (!invoice) return null
  return formatInvoice(invoice)
}

export async function updateInvoiceStatus(
  prisma: PrismaClient,
  id: number,
  newStatus: InvoiceStatus
) {
  const invoice = await prisma.invoice.findUnique({ where: { id } })
  if (!invoice) return null

  const allowed = ALLOWED_TRANSITIONS[invoice.status]
  if (!allowed.includes(newStatus)) {
    throw new Error(`Cannot transition from '${invoice.status}' to '${newStatus}'`)
  }

  const updated = await prisma.invoice.update({
    where: { id },
    data: { status: newStatus },
    include: { lineItems: true }
  })

  return formatInvoice(updated)
}
