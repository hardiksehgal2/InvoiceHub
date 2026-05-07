<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
    <div class="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border bg-white dark:bg-zinc-900 p-8 shadow-2xl">
      <div class="mb-6 flex items-center justify-between">
        <h2 class="text-2xl font-bold">New Invoice</h2>
        <button @click="$emit('close')" class="rounded-xl p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800">
          <XIcon class="h-5 w-5" />
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-5">
        <!-- Customer fields -->
        <div class="grid gap-4 sm:grid-cols-2">
          <div>
            <label class="mb-1.5 block text-sm font-medium">Customer Name</label>
            <input
              v-model="form.customerName"
              type="text"
              placeholder="Acme Corp"
              class="w-full rounded-xl border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p v-if="errors.customerName" class="mt-1 text-xs text-red-500">{{ errors.customerName }}</p>
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-medium">Customer Email</label>
            <input
              v-model="form.customerEmail"
              type="email"
              placeholder="billing@acme.com"
              class="w-full rounded-xl border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p v-if="errors.customerEmail" class="mt-1 text-xs text-red-500">{{ errors.customerEmail }}</p>
          </div>
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <div>
            <label class="mb-1.5 block text-sm font-medium">Currency</label>
            <select
              v-model="form.currency"
              class="w-full rounded-xl border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="INR">INR</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
            </select>
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-medium">Tax Rate (bps)</label>
            <input
              v-model.number="form.taxRateBps"
              type="number"
              min="0"
              max="10000"
              placeholder="1800 = 18%"
              class="w-full rounded-xl border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p v-if="errors.taxRateBps" class="mt-1 text-xs text-red-500">{{ errors.taxRateBps }}</p>
          </div>
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <div>
            <label class="mb-1.5 block text-sm font-medium">Issued At</label>
            <input
              v-model="form.issuedAt"
              type="datetime-local"
              class="w-full rounded-xl border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p v-if="errors.issuedAt" class="mt-1 text-xs text-red-500">{{ errors.issuedAt }}</p>
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-medium">Due At</label>
            <input
              v-model="form.dueAt"
              type="datetime-local"
              class="w-full rounded-xl border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p v-if="errors.dueAt" class="mt-1 text-xs text-red-500">{{ errors.dueAt }}</p>
          </div>
        </div>

        <!-- Line items -->
        <div>
          <div class="mb-3 flex items-center justify-between">
            <label class="text-sm font-medium">Line Items</label>
            <button
              type="button"
              @click="addLineItem"
              class="rounded-lg border px-3 py-1.5 text-xs font-medium transition hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              + Add Item
            </button>
          </div>
          <p v-if="errors.lineItems" class="mb-2 text-xs text-red-500">{{ errors.lineItems }}</p>

          <div class="space-y-3">
            <div
              v-for="(item, i) in form.lineItems"
              :key="i"
              class="grid grid-cols-[1fr_80px_100px_36px] gap-2 items-start"
            >
              <div>
                <input
                  v-model="item.description"
                  type="text"
                  placeholder="Description"
                  class="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <input
                  v-model.number="item.quantity"
                  type="number"
                  min="1"
                  placeholder="Qty"
                  class="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <input
                  v-model.number="item.unitPriceMinor"
                  type="number"
                  min="1"
                  placeholder="Price (minor)"
                  class="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <button
                type="button"
                @click="removeLineItem(i)"
                :disabled="form.lineItems.length === 1"
                class="mt-0.5 rounded-xl p-2 text-red-500 hover:bg-red-50 disabled:opacity-30"
              >
                <Trash2Icon class="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-3 pt-2">
          <button
            type="button"
            @click="$emit('close')"
            class="rounded-xl border px-5 py-2.5 text-sm font-medium transition hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="isPending"
            class="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:opacity-60"
          >
            {{ isPending ? 'Creating…' : 'Create Invoice' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { useMutation } from '@tanstack/vue-query'
import { XIcon, Trash2Icon } from 'lucide-vue-next'
import { z } from 'zod'
import { invoicesApi } from '@/api/invoices'

const emit = defineEmits<{
  close: []
  created: []
}>()

const lineItemSchema = z.object({
  description: z.string().min(3, 'At least 3 characters'),
  quantity: z.number().min(1, 'Must be ≥ 1'),
  unitPriceMinor: z.number().min(1, 'Must be ≥ 1'),
})

const invoiceSchema = z.object({
  customerName: z.string().min(2, 'At least 2 characters'),
  customerEmail: z.string().email('Invalid email'),
  currency: z.string().min(3, 'Required'),
  taxRateBps: z.number().int('Must be an integer').min(0).max(10000),
  issuedAt: z.string().min(1, 'Required'),
  dueAt: z.string().min(1, 'Required'),
  lineItems: z.array(lineItemSchema).min(1, 'At least one line item required'),
})

type FormState = {
  customerName: string
  customerEmail: string
  currency: string
  taxRateBps: number | ''
  issuedAt: string
  dueAt: string
  lineItems: { description: string; quantity: number | ''; unitPriceMinor: number | '' }[]
}

const form = reactive<FormState>({
  customerName: '',
  customerEmail: '',
  currency: 'INR',
  taxRateBps: '',
  issuedAt: '',
  dueAt: '',
  lineItems: [{ description: '', quantity: '', unitPriceMinor: '' }],
})

const errors = reactive<Record<string, string>>({})

function addLineItem() {
  form.lineItems.push({ description: '', quantity: '', unitPriceMinor: '' })
}

function removeLineItem(index: number) {
  form.lineItems.splice(index, 1)
}

const { mutate, isPending } = useMutation({
  mutationFn: invoicesApi.create,
  onSuccess: () => emit('created'),
})

function handleSubmit() {
  Object.keys(errors).forEach((k) => delete errors[k])

  const result = invoiceSchema.safeParse({
    ...form,
    taxRateBps: form.taxRateBps === '' ? undefined : form.taxRateBps,
    lineItems: form.lineItems.map((item) => ({
      description: item.description,
      quantity: item.quantity === '' ? undefined : item.quantity,
      unitPriceMinor: item.unitPriceMinor === '' ? undefined : item.unitPriceMinor,
    })),
  })

  if (!result.success) {
    for (const issue of result.error.issues) {
      const key = issue.path.join('.')
      if (!errors[key]) errors[key] = issue.message
    }
    return
  }

  mutate({
    ...result.data,
    issuedAt: new Date(result.data.issuedAt).toISOString(),
    dueAt: new Date(result.data.dueAt).toISOString(),
  })
}
</script>
