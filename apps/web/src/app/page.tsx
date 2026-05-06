// app/page.tsx

"use client";

import apiClient from "@/api/common.api";
import { useQuery } from "@tanstack/react-query";
import { DataTable } from "@/components/invoices/data-table";
import { invoiceColumns } from "@/components/invoices/columns";
import { FileText, Plus } from "lucide-react";
import { useState } from "react";
import { ModeToggle } from "@/components/mode-toggle";
import { CreateInvoiceDialog } from "@/components/invoices/create-invoice-dialog";

const Home = () => {
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading, isError } = useQuery({
    queryKey: ["invoices"],

    queryFn: () => apiClient.getInvoiceListing(),
  });

  if (isLoading)
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="space-y-3 text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-muted border-t-primary" />
          <p className="text-muted-foreground">Loading invoices...</p>
        </div>
      </div>
    );

  if (isError)
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="rounded-2xl border bg-card p-8 shadow-lg">
          <p className="text-red-500 font-medium">
            Failed to load invoices.
          </p>
        </div>
      </div>
    );

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="border-b bg-background/80 backdrop-blur sticky top-0 z-50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-primary/10 p-2">
              <FileText className="h-6 w-6 text-primary" />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                InvoiceHub
              </h1>
              <p className="text-sm text-muted-foreground">
                Manage and post invoices effortlessly
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ModeToggle />

            <CreateInvoiceDialog />
          </div>
        </div>
      </div>

      <section className="mx-auto max-w-7xl px-6 py-8">


        <div className="rounded-3xl border bg-card p-4 shadow-sm">
          <DataTable
            columns={invoiceColumns}
            data={data?.data ?? []}
            currentPage={page}
            total={data?.total ?? 0}
            limit={limit}
            onPageChange={setPage}
          />
        </div>
      </section>
    </main>
  );
};

export default Home;