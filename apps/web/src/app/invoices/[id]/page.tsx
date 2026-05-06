// app/invoices/[id]/page.tsx

"use client";

import apiClient from "@/api/common.api";

import {
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";
import { useParams } from "next/navigation";
import {
    ALLOWED_STATUS_TRANSITIONS,
} from "@/utils/invoice-status";
import {
    CalendarDays,
    CreditCard,
    FileText,
    Mail,
    Receipt,
    User,
} from "lucide-react";

import { ModeToggle } from "@/components/mode-toggle";

function formatMoney(
    minor: number,
    currency: string
) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
    }).format(minor / 100);
}

export default function InvoiceDetailsPage() {
    const params = useParams();

    const id = params.id as string;
    const queryClient = useQueryClient();
    const updateStatusMutation = useMutation({
        mutationFn: (
            status: "issued" | "paid" | "void"
        ) =>
            apiClient.updateInvoiceStatus(
                id,
                status
            ),

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["invoice", id],
            });

            queryClient.invalidateQueries({
                queryKey: ["invoices"],
            });
        },

        onError: (error) => {
            console.log(
                "STATUS UPDATE ERROR:",
                error
            );
        },
    });
    const { data, isLoading } = useQuery({
        queryKey: ["invoice", id],

        queryFn: () =>
            apiClient.getInvoiceById(id),

        enabled: !!id,
    });

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <div className="space-y-3 text-center">
                    <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-muted border-t-primary" />

                    <p className="text-muted-foreground">
                        Loading invoice...
                    </p>
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                Invoice not found
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-background text-foreground">
            {/* TOPBAR */}

            <div className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="rounded-2xl bg-primary/10 p-2">
                            <Receipt className="h-6 w-6 text-primary" />
                        </div>

                        <div>
                            <h1 className="text-2xl font-bold">
                                Invoice Details
                            </h1>

                            <p className="text-sm text-muted-foreground">
                                {data.number}
                            </p>
                        </div>
                    </div>

                    <ModeToggle />
                </div>
            </div>

            <section className="mx-auto max-w-7xl space-y-6 px-6 py-8">
                {/* HERO CARD */}

                <div className="rounded-3xl border bg-card p-8 shadow-sm">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Invoice Number
                            </p>

                            <p className="mt-1 text-xs text-muted-foreground">
                                ID: #{data.id}
                            </p>

                            <h2 className="mt-2 text-4xl font-bold tracking-tight">
                                {data.number}
                            </h2>

                            <div className="mt-4 inline-flex items-center rounded-full bg-yellow-500/10 px-4 py-1 text-sm font-medium text-yellow-500">
                                {data.status.toUpperCase()}
                            </div>
                            <div className="mt-6 flex flex-wrap gap-3">
                                {ALLOWED_STATUS_TRANSITIONS[
                                    data.status
                                ].map((status) => (
                                    <button
                                        key={status}
                                        onClick={() =>
                                            updateStatusMutation.mutate(
                                                status as
                                                | "issued"
                                                | "paid"
                                                | "void"
                                            )
                                        }
                                        disabled={
                                            updateStatusMutation.isPending
                                        }
                                        className="rounded-xl bg-primary px-3 py-2 text-sm font-medium capitalize text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
                                    >
                                        Mark as {status}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-3">
                            <div className="rounded-2xl border bg-background p-4">
                                <p className="text-sm text-muted-foreground">
                                    Subtotal
                                </p>

                                <h3 className="mt-2 text-2xl font-bold">
                                    {formatMoney(
                                        data.subtotalMinor,
                                        data.currency
                                    )}
                                </h3>
                            </div>

                            <div className="rounded-2xl border bg-background p-4">
                                <p className="text-sm text-muted-foreground">
                                    Tax
                                </p>

                                <h3 className="mt-2 text-2xl font-bold text-orange-500">
                                    {formatMoney(
                                        data.taxMinor,
                                        data.currency
                                    )}
                                </h3>
                            </div>

                            <div className="rounded-2xl border bg-primary p-4 text-primary-foreground">
                                <p className="text-sm opacity-80">
                                    Total
                                </p>

                                <h3 className="mt-2 text-3xl font-bold">
                                    {formatMoney(
                                        data.totalMinor,
                                        data.currency
                                    )}
                                </h3>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CUSTOMER + META */}

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* CUSTOMER */}

                    <div className="rounded-3xl border bg-card p-6 shadow-sm">
                        <div className="mb-6 flex items-center gap-3">
                            <div className="rounded-xl bg-primary/10 p-2">
                                <User className="h-5 w-5 text-primary" />
                            </div>

                            <h2 className="text-xl font-semibold">
                                Customer Details
                            </h2>
                        </div>

                        <div className="space-y-5">
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Customer Name
                                </p>

                                <p className="mt-1 text-lg font-medium">
                                    {data.customerName}
                                </p>
                            </div>

                            <div>
                                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Mail className="h-4 w-4" />
                                    Email
                                </p>

                                <p className="mt-1 text-lg font-medium">
                                    {data.customerEmail}
                                </p>
                            </div>

                            <div>
                                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <CreditCard className="h-4 w-4" />
                                    Currency
                                </p>

                                <p className="mt-1 text-lg font-medium">
                                    {data.currency}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* DATES */}

                    <div className="rounded-3xl border bg-card p-6 shadow-sm">
                        <div className="mb-6 flex items-center gap-3">
                            <div className="rounded-xl bg-primary/10 p-2">
                                <CalendarDays className="h-5 w-5 text-primary" />
                            </div>

                            <h2 className="text-xl font-semibold">
                                Invoice Timeline
                            </h2>
                        </div>

                        <div className="space-y-5">
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Issued At
                                </p>

                                <p className="mt-1 text-lg font-medium">
                                    {new Date(
                                        data.issuedAt
                                    ).toLocaleString()}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Due At
                                </p>

                                <p className="mt-1 text-lg font-medium">
                                    {new Date(
                                        data.dueAt
                                    ).toLocaleString()}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Created At
                                </p>

                                <p className="mt-1 text-lg font-medium">
                                    {new Date(
                                        data.createdAt
                                    ).toLocaleString()}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Tax Rate
                                </p>

                                <p className="mt-1 text-lg font-medium">
                                    {data.taxRateBps / 100}%
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* LINE ITEMS */}

                <div className="rounded-3xl border bg-card p-6 shadow-sm">
                    <div className="mb-6 flex items-center gap-3">
                        <div className="rounded-xl bg-primary/10 p-2">
                            <FileText className="h-5 w-5 text-primary" />
                        </div>

                        <h2 className="text-xl font-semibold">
                            Line Items
                        </h2>
                    </div>

                    <div className="overflow-hidden rounded-2xl border">
                        <table className="w-full">
                            <thead className="bg-muted/50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold">
                                        Description
                                    </th>

                                    <th className="px-6 py-4 text-left text-sm font-semibold">
                                        Quantity
                                    </th>

                                    <th className="px-6 py-4 text-left text-sm font-semibold">
                                        Unit Price
                                    </th>

                                    <th className="px-6 py-4 text-left text-sm font-semibold">
                                        Total
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {data.lineItems.map((item) => (
                                    <tr
                                        key={item.id}
                                        className="border-t"
                                    >
                                        <td className="px-6 py-4 font-medium">
                                            {item.description}
                                        </td>

                                        <td className="px-6 py-4">
                                            {item.quantity}
                                        </td>

                                        <td className="px-6 py-4">
                                            {formatMoney(
                                                item.unitPriceMinor,
                                                data.currency
                                            )}
                                        </td>

                                        <td className="px-6 py-4 font-semibold">
                                            {formatMoney(
                                                item.totalMinor,
                                                data.currency
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>
        </main>
    );
}