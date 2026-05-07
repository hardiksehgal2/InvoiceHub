"use client"

import { ColumnDef } from "@tanstack/react-table"
import type { InvoiceResponse } from "@/api/types"
import Link from "next/link"
import apiClient from "@/api/common.api";
import { Download } from "lucide-react";

const STATUS_STYLES: Record<InvoiceResponse["status"], string> = {
  draft: "bg-gray-100 text-gray-700",
  issued: "bg-blue-100 text-blue-700",
  paid: "bg-green-100 text-green-700",
  void: "bg-red-100 text-red-700",
}

function formatMinor(amount: number, currency: string) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount / 100)
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

export const invoiceColumns: ColumnDef<InvoiceResponse>[] = [
  {
    accessorKey: "number",
    header: "Invoice #",
  },
  {
    accessorKey: "customerName",
    header: "Customer",
    cell: ({ row }) => (
      <div>
        <p className="font-medium">{row.original.customerName}</p>
        <p className="text-xs text-muted-foreground">{row.original.customerEmail}</p>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ getValue }) => {
      const status = getValue<InvoiceResponse["status"]>()
      return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${STATUS_STYLES[status]}`}>
          {status}
        </span>
      )
    },
  },
  {
    accessorKey: "currency",
    header: "Currency",
  },
  {
    accessorKey: "subtotalMinor",
    header: "Subtotal",
    cell: ({ row }) => formatMinor(row.original.subtotalMinor, row.original.currency),
  },
  {
    accessorKey: "taxMinor",
    header: "Tax",
    cell: ({ row }) => formatMinor(row.original.taxMinor, row.original.currency),
  },
  {
    accessorKey: "totalMinor",
    header: "Total",
    cell: ({ row }) => (
      <span className="font-semibold">{formatMinor(row.original.totalMinor, row.original.currency)}</span>
    ),
  },
  {
    accessorKey: "issuedAt",
    header: "Issued",
    cell: ({ getValue }) => formatDate(getValue<string>()),
  },
  {
    accessorKey: "dueAt",
    header: "Due",
    cell: ({ getValue }) => formatDate(getValue<string>()),
  },
  {
    accessorKey: "taxRateBps",
    header: "Tax Rate",
    cell: ({ getValue }) => `${getValue<number>() / 100}%`,
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ getValue }) => formatDate(getValue<string>()),
  },
  {
    id: "actions",

    header: "Actions",

    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-4">
          <Link
            href={`/invoices/${row.original.id}`}
            className="text-sm font-medium text-blue-500 hover:underline"
          >
            View
          </Link>

          
        </div>
      );
    },
  },

]
