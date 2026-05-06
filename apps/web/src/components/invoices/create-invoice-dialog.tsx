// components/invoices/create-invoice-dialog.tsx

"use client";

import { useFieldArray, useForm, Controller, } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { Plus, Trash2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import apiClient from "@/api/common.api";
import { invoiceSchema } from "@/api/validations/invoice.validation";


type InvoiceFormValues = z.infer<typeof invoiceSchema>;

export function CreateInvoiceDialog() {
    const queryClient = useQueryClient();
    const [open, setOpen] = useState(false);
    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: { errors },
    } = useForm<InvoiceFormValues>({
        resolver: zodResolver(invoiceSchema),

        defaultValues: {
            customerName: "",
            customerEmail: "",
            currency: "USD",
            taxRateBps: 0,
            issuedAt: new Date().toISOString().slice(0, 16),
            dueAt: new Date().toISOString().slice(0, 16),

            lineItems: [
                {
                    description: "",
                    quantity: 1,
                    unitPriceMinor: 0,
                },
            ],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "lineItems",
    });

    const { mutateAsync, isPending } = useMutation({
        mutationFn: (data: InvoiceFormValues) =>
            apiClient.postInvoice(data),

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["invoices"],
            });

            reset();
        },
    });

    const onSubmit = async (
        data: InvoiceFormValues
    ) => {
        try {
            const payload = {
                ...data,

                issuedAt: new Date(
                    data.issuedAt
                ).toISOString(),

                dueAt: new Date(
                    data.dueAt
                ).toISOString(),
            };

            console.log("PAYLOAD:", payload);

            await mutateAsync(payload);

            queryClient.invalidateQueries({
                queryKey: ["invoices"],
            });

            reset();

            setOpen(false);

            console.log("Invoice Created");
        } catch (error) {
            console.log("ERROR:", error);
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button className="rounded-xl shadow-md">
                    <Plus className="mr-2 h-4 w-4" />
                    New Invoice
                </Button>
            </AlertDialogTrigger>

            <AlertDialogContent className="overflow-y-auto max-h-[90vh] sm:max-w-2xl min-w-2xl">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-2xl">
                        Create Invoice
                    </AlertDialogTitle>
                </AlertDialogHeader>

                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="space-y-6"
                >
                    {/* Customer Info */}

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Customer Name</Label>

                            <Input
                                placeholder="Enter customer name"
                                {...register("customerName")}
                            />

                            {errors.customerName && (
                                <p className="text-sm text-red-500">
                                    {errors.customerName.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label>Customer Email</Label>

                            <Input
                                placeholder="Enter customer email"
                                {...register("customerEmail")}
                            />

                            {errors.customerEmail && (
                                <p className="text-sm text-red-500">
                                    {errors.customerEmail.message}
                                </p>
                            )}
                        </div>

                    </div>

                    {/* Currency + Tax */}

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Currency</Label>

                            <Controller
                                control={control}
                                name="currency"
                                render={({ field }) => (
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select Currency" />
                                        </SelectTrigger>

                                        <SelectContent>
                                            <SelectItem value="INR">
                                                INR - Indian Rupee
                                            </SelectItem>

                                            <SelectItem value="USD">
                                                USD - US Dollar
                                            </SelectItem>

                                            <SelectItem value="EUR">
                                                EUR - Euro
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />

                            {errors.currency && (
                                <p className="text-sm text-red-500">
                                    {errors.currency.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label>Status</Label>
                            <Select defaultValue="draft">
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="draft">Draft</SelectItem>
                                    <SelectItem value="issued">Issued</SelectItem>
                                    <SelectItem value="paid">Paid</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>


                    {/* Dates */}

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Issued At</Label>

                            <Input
                                type="datetime-local"
                                {...register("issuedAt")}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Due At</Label>

                            <Input
                                type="datetime-local"
                                {...register("dueAt")}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Tax Rate (%)</Label>

                        <Input
                            type="number"
                            placeholder="Enter tax percentage"
                            min={0}
                            max={100}
                            step={1}
                            {...register("taxRateBps", {
                                setValueAs: (value) => {
                                    if (value === "") return 0;

                                    return Number(value) * 100;
                                },
                            })}
                        />

                        <p className="text-xs text-muted-foreground">
                            Example: 18 = 18% GST
                        </p>

                        {errors.taxRateBps && (
                            <p className="text-sm text-red-500">
                                {errors.taxRateBps.message}
                            </p>
                        )}
                    </div>
                    {/* Line Items */}

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold">
                                Line Items
                            </h3>

                            <Button
                                type="button"
                                variant="outline"
                                onClick={() =>
                                    append({
                                        description: "",
                                        quantity: 1,
                                        unitPriceMinor: 0,
                                    })
                                }
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Add Item
                            </Button>
                        </div>

                        {fields.map((field, index) => (
                            <div
                                key={field.id}
                                className="grid gap-3 rounded-2xl border p-4 md:grid-cols-4"
                            >
                                <div className="space-y-2 md:col-span-2">
                                    <Label>Description</Label>

                                    <Input
                                        placeholder="Enter description"
                                        {...register(
                                            `lineItems.${index}.description`
                                        )}
                                    />

                                    {errors.lineItems?.[index]?.description && (
                                        <p className="text-sm text-red-500">
                                            {
                                                errors.lineItems[index]?.description
                                                    ?.message
                                            }
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label>Quantity</Label>

                                    <Input
                                        type="number"
                                        placeholder="Qty"
                                        {...register(
                                            `lineItems.${index}.quantity`
                                        )}
                                    />

                                    {errors.lineItems?.[index]?.quantity && (
                                        <p className="text-sm text-red-500">
                                            {
                                                errors.lineItems[index]?.quantity
                                                    ?.message
                                            }
                                        </p>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <div className="flex-1 space-y-2">
                                        <Label>Unit Price</Label>

                                        <Input
                                            type="number"
                                            placeholder="Enter amount"
                                            {...register(
                                                `lineItems.${index}.unitPriceMinor`
                                            )}
                                        />

                                        {errors.lineItems?.[index]
                                            ?.unitPriceMinor && (
                                                <p className="text-sm text-red-500">
                                                    {
                                                        errors.lineItems[index]
                                                            ?.unitPriceMinor?.message
                                                    }
                                                </p>
                                            )}
                                    </div>

                                    <div className="flex items-end">
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="icon"
                                            onClick={() => remove(index)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                        >
                            Cancel
                        </Button>

                        <Button
                            type="submit"
                            className="min-w-[140px]"
                            disabled={isPending}
                        >
                            {isPending
                                ? "Creating..."
                                : "Create Invoice"}
                        </Button>
                    </div>
                </form>
            </AlertDialogContent>
        </AlertDialog>
    );
}