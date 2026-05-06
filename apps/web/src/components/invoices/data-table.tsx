// components/invoices/data-table.tsx

"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DataTableProps<TData> {
  columns: ColumnDef<TData>[];

  data: TData[];

  currentPage: number;

  total: number;

  limit: number;

  onPageChange: (page: number) => void;
}

export function DataTable<TData>({
  columns,
  data,
  currentPage,
  total,
  limit,
  onPageChange,
}: DataTableProps<TData>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });
  const totalPages = Math.ceil(total / limit);
  return (
    <div className="overflow-hidden rounded-2xl border">
      <Table>
        <TableHeader className="bg-muted/50">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow
              key={headerGroup.id}
              className="hover:bg-transparent"
            >
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className="h-14 text-sm font-semibold"
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>

        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                className="transition-colors hover:bg-muted/40"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className="py-4 font-medium"
                  >
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext()
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-32 text-center text-muted-foreground"
              >
                No invoices found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <div className="flex items-center justify-between border-t px-6 py-4">
        <p className="text-sm text-muted-foreground">
          Page {currentPage} of {totalPages}
        </p>

        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              onPageChange(currentPage - 1)
            }
            disabled={currentPage === 1}
            className="rounded-lg border px-4 py-2 text-sm transition hover:bg-muted disabled:opacity-50"
          >
            Previous
          </button>

          <button
            onClick={() =>
              onPageChange(currentPage + 1)
            }
            disabled={currentPage === totalPages}
            className="rounded-lg border px-4 py-2 text-sm transition hover:bg-muted disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}