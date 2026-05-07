import { describe, it, expect, vi } from 'vitest'

// Stub @prisma/client before the service module is imported so the service
// can load without a generated Prisma client or a real database connection.
vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn(),
  InvoiceStatus: {
    draft: 'draft',
    issued: 'issued',
    paid: 'paid',
    void: 'void',
  },
}))

import { createInvoice, updateInvoiceStatus } from './invoices.service'
import type { PrismaClient } from '@prisma/client'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const BASE_INPUT = {
  customerName: 'Acme Corp',
  customerEmail: 'billing@acme.com',
  currency: 'INR',
  lineItems: [{ description: 'Widget', quantity: 2, unitPriceMinor: 500 }],
  taxRateBps: 1800,
  issuedAt: '2025-06-01T00:00:00.000Z',
  dueAt: '2025-07-01T00:00:00.000Z',
}

/**
 * Minimal Prisma mock for createInvoice.
 * Maintains an in-memory counter per yearMonth so multiple calls within the
 * same test produce realistic sequential numbers.
 */
function makeCreatePrisma(): PrismaClient {
  const counters: Record<string, number> = {}
  let nextId = 1

  const tx = {
    invoiceCounter: {
      upsert: vi.fn().mockImplementation(
        async ({ where }: { where: { yearMonth: string } }) => {
          const ym = where.yearMonth
          counters[ym] = (counters[ym] ?? 0) + 1
          return { yearMonth: ym, lastNumber: counters[ym] }
        }
      ),
    },
    invoice: {
      create: vi.fn().mockImplementation(async ({ data }: { data: Record<string, unknown> }) => ({
        ...data,
        id: nextId++,
        lineItems: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        issuedAt: new Date(data.issuedAt as string),
        dueAt: new Date(data.dueAt as string),
      })),
    },
  }

  return {
    $transaction: vi.fn().mockImplementation((fn: (t: typeof tx) => unknown) => fn(tx)),
  } as unknown as PrismaClient
}

/**
 * Minimal Prisma mock for updateInvoiceStatus.
 */
function makeStatusPrisma(currentStatus: string): PrismaClient {
  const invoice = {
    id: 1,
    number: 'INV-202506-0001',
    customerName: 'Test',
    customerEmail: 't@t.com',
    currency: 'INR',
    subtotalMinor: 1000,
    taxMinor: 180,
    totalMinor: 1180,
    taxRateBps: 1800,
    status: currentStatus,
    issuedAt: new Date(),
    dueAt: new Date(),
    createdAt: new Date(),
    lineItems: [],
  }

  return {
    invoice: {
      findUnique: vi.fn().mockResolvedValue(invoice),
      update: vi.fn().mockImplementation(
        async ({ data }: { data: { status: string } }) => ({ ...invoice, status: data.status })
      ),
    },
  } as unknown as PrismaClient
}

// ---------------------------------------------------------------------------
// Invoice number monotonicity
// ---------------------------------------------------------------------------
describe('invoice number — format and sequence', () => {
  it('first invoice in a month is 0001', async () => {
    const prisma = makeCreatePrisma()
    const inv = await createInvoice(prisma, BASE_INPUT)
    expect(inv.number).toBe('INV-202506-0001')
  })

  it('numbers are strictly sequential within the same month', async () => {
    const prisma = makeCreatePrisma()
    const juneInput = { ...BASE_INPUT, issuedAt: '2025-06-01T00:00:00.000Z' }

    const [a, b, c] = await Promise.all([
      createInvoice(prisma, juneInput),
      createInvoice(prisma, juneInput),
      createInvoice(prisma, juneInput),
    ])

    const seq = [a.number, b.number, c.number].map(n => parseInt(n.split('-')[2]))
    expect(seq.sort((x, y) => x - y)).toEqual([1, 2, 3])
  })

  it('all numbers are unique across 10 invoices', async () => {
    const prisma = makeCreatePrisma()
    const results = await Promise.all(
      Array.from({ length: 10 }, () => createInvoice(prisma, BASE_INPUT))
    )
    const numbers = results.map(r => r.number)
    expect(new Set(numbers).size).toBe(10)
  })

  it('sequence counter resets independently for a new month', async () => {
    const prisma = makeCreatePrisma()

    const june = await createInvoice(prisma, { ...BASE_INPUT, issuedAt: '2025-06-15T00:00:00.000Z', dueAt: '2025-07-15T00:00:00.000Z' })
    const june2 = await createInvoice(prisma, { ...BASE_INPUT, issuedAt: '2025-06-20T00:00:00.000Z', dueAt: '2025-07-20T00:00:00.000Z' })
    const july = await createInvoice(prisma, { ...BASE_INPUT, issuedAt: '2025-07-01T00:00:00.000Z', dueAt: '2025-08-01T00:00:00.000Z' })

    expect(june.number).toBe('INV-202506-0001')
    expect(june2.number).toBe('INV-202506-0002')
    expect(july.number).toBe('INV-202507-0001')  // July starts from 0001
  })

  it('sequence number is zero-padded to 4 digits', async () => {
    const prisma = makeCreatePrisma()
    // exhaust 9 slots then check the 10th is padded correctly
    for (let i = 0; i < 9; i++) await createInvoice(prisma, BASE_INPUT)
    const tenth = await createInvoice(prisma, BASE_INPUT)
    expect(tenth.number).toMatch(/INV-\d{6}-0010$/)
  })
})

// ---------------------------------------------------------------------------
// Status transitions — valid paths
// ---------------------------------------------------------------------------
describe('updateInvoiceStatus — valid transitions', () => {
  const valid = [
    ['draft',  'issued'] as const,
    ['issued', 'paid']   as const,
    ['issued', 'void']   as const,
  ]

  it.each(valid)('%s → %s resolves with updated status', async (from, to) => {
    const prisma = makeStatusPrisma(from)
    const result = await updateInvoiceStatus(prisma, 1, to as never)
    expect(result).not.toBeNull()
    expect(result!.status).toBe(to)
  })
})

// ---------------------------------------------------------------------------
// Status transitions — every invalid path must throw
// ---------------------------------------------------------------------------
describe('updateInvoiceStatus — invalid transitions', () => {
  const invalid = [
    ['draft',  'paid']   as const,
    ['draft',  'void']   as const,
    ['draft',  'draft']  as const,
    ['issued', 'draft']  as const,
    ['issued', 'issued'] as const,
    ['paid',   'issued'] as const,
    ['paid',   'void']   as const,
    ['paid',   'paid']   as const,
    ['paid',   'draft']  as const,
    ['void',   'issued'] as const,
    ['void',   'paid']   as const,
    ['void',   'void']   as const,
    ['void',   'draft']  as const,
  ]

  it.each(invalid)('%s → %s throws with descriptive message', async (from, to) => {
    const prisma = makeStatusPrisma(from)
    await expect(
      updateInvoiceStatus(prisma, 1, to as never)
    ).rejects.toThrow(`Cannot transition from '${from}' to '${to}'`)
  })
})

// ---------------------------------------------------------------------------
// Edge cases
// ---------------------------------------------------------------------------
describe('updateInvoiceStatus — edge cases', () => {
  it('returns null when the invoice does not exist', async () => {
    const prisma = {
      invoice: { findUnique: vi.fn().mockResolvedValue(null) },
    } as unknown as PrismaClient

    const result = await updateInvoiceStatus(prisma, 9999, 'issued' as never)
    expect(result).toBeNull()
  })
})
