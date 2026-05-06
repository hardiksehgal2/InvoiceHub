import React from 'react'
import { Document, Page, Text, View, StyleSheet, renderToBuffer } from '@react-pdf/renderer'
import { fmtMoney } from '../utils/money'

const styles = StyleSheet.create({
  page: { padding: 48, fontSize: 11, fontFamily: 'Helvetica' },
  title: { fontSize: 22, marginBottom: 24 },
  section: { marginBottom: 16 },
  label: { fontSize: 9, color: '#888', marginBottom: 2 },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    paddingBottom: 4,
    marginBottom: 4
  },
  row: { flexDirection: 'row', paddingVertical: 3 },
  col1: { flex: 3 },
  col2: { flex: 1, textAlign: 'right' },
  divider: { borderBottomWidth: 1, borderBottomColor: '#ccc', marginVertical: 10 },
  summaryRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 48, paddingVertical: 2 },
  bold: { fontFamily: 'Helvetica-Bold' }
})

type InvoiceForPDF = {
  number: string
  customerName: string
  customerEmail: string
  currency: string
  lineItems: Array<{
    description: string
    quantity: number
    unitPriceMinor: number
    totalMinor: number
  }>
  subtotalMinor: number
  taxMinor: number
  totalMinor: number
  taxRateBps: number
  status: string
  issuedAt: string
  dueAt: string
}

function InvoicePDF({ invoice }: { invoice: InvoiceForPDF }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={[styles.title, styles.bold]}>{invoice.number}</Text>

        <View style={styles.section}>
          <Text style={styles.label}>BILL TO</Text>
          <Text>{invoice.customerName}</Text>
          <Text>{invoice.customerEmail}</Text>
        </View>

        <View style={styles.section}>
          <Text>Issued: {invoice.issuedAt.slice(0, 10)}</Text>
          <Text>Due:    {invoice.dueAt.slice(0, 10)}</Text>
          <Text>Status: {invoice.status.toUpperCase()}</Text>
        </View>

        <View style={styles.tableHeader}>
          <Text style={[styles.col1, styles.bold]}>Description</Text>
          <Text style={[styles.col2, styles.bold]}>Qty</Text>
          <Text style={[styles.col2, styles.bold]}>Unit Price</Text>
          <Text style={[styles.col2, styles.bold]}>Total</Text>
        </View>

        {invoice.lineItems.map((item, i) => (
          <View key={i} style={styles.row}>
            <Text style={styles.col1}>{item.description}</Text>
            <Text style={styles.col2}>{item.quantity}</Text>
            <Text style={styles.col2}>{fmtMoney(item.unitPriceMinor, invoice.currency)}</Text>
            <Text style={styles.col2}>{fmtMoney(item.totalMinor, invoice.currency)}</Text>
          </View>
        ))}

        <View style={styles.divider} />

        <View style={styles.summaryRow}>
          <Text>Subtotal</Text>
          <Text>{fmtMoney(invoice.subtotalMinor, invoice.currency)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text>Tax ({invoice.taxRateBps / 100}%)</Text>
          <Text>{fmtMoney(invoice.taxMinor, invoice.currency)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.bold}>Total</Text>
          <Text style={styles.bold}>{fmtMoney(invoice.totalMinor, invoice.currency)}</Text>
        </View>
      </Page>
    </Document>
  )
}

export async function renderInvoicePDF(invoice: InvoiceForPDF): Promise<Buffer> {
  return renderToBuffer(<InvoicePDF invoice={invoice} />)
}
