<template>
  <main class="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
    <!-- Topbar -->
    <header class="sticky top-0 z-50 border-b bg-white/80 dark:bg-zinc-950/80 backdrop-blur">
      <div class="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div class="flex items-center gap-3">
          <RouterLink to="/" class="rounded-xl p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800">
            <ArrowLeftIcon class="h-5 w-5" />
          </RouterLink>
          <div class="rounded-2xl bg-indigo-50 dark:bg-indigo-950 p-2">
            <ReceiptIcon class="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <h1 class="text-2xl font-bold">Invoice Details</h1>
            <p class="text-sm text-zinc-500">{{ data?.number ?? '…' }}</p>
          </div>
        </div>
      </div>
    </header>

    <!-- Loading -->
    <div v-if="isLoading" class="flex justify-center py-20">
      <div class="h-10 w-10 animate-spin rounded-full border-4 border-zinc-200 border-t-indigo-600" />
    </div>

    <!-- Not found -->
    <div v-else-if="!data" class="flex justify-center py-20 text-zinc-400">
      Invoice not found.
    </div>

    <section v-else class="mx-auto max-w-7xl space-y-6 px-6 py-8">
      <!-- Hero card -->
      <div class="rounded-3xl border bg-white dark:bg-zinc-900 p-8 shadow-sm">
        <div class="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p class="text-sm text-zinc-500">Invoice Number</p>
            <p class="mt-1 text-xs text-zinc-400">ID: #{{ data.id }}</p>
            <h2 class="mt-2 text-4xl font-bold tracking-tight">{{ data.number }}</h2>

            <div class="mt-4">
              <StatusBadge :status="data.status" class="text-sm px-3 py-1" />
            </div>

            <!-- Actions -->
            <div class="mt-6 flex flex-wrap gap-3">
              <button
                @click="downloadPdf"
                :disabled="isDownloading"
                class="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50"
              >
                <DownloadIcon class="h-4 w-4" />
                {{ isDownloading ? 'Downloading…' : 'Download PDF' }}
              </button>

              <button
                v-for="nextStatus in allowedTransitions"
                :key="nextStatus"
                @click="updateStatus(nextStatus)"
                :disabled="isUpdating"
                class="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium capitalize text-white transition hover:bg-indigo-700 disabled:opacity-50"
              >
                Mark as {{ nextStatus }}
              </button>
            </div>
          </div>

          <!-- Totals -->
          <div class="grid gap-4 sm:grid-cols-3">
            <div class="rounded-2xl border bg-zinc-50 dark:bg-zinc-800 p-4">
              <p class="text-sm text-zinc-500">Subtotal</p>
              <h3 class="mt-2 text-2xl font-bold">{{ formatMoney(data.subtotalMinor, data.currency) }}</h3>
            </div>
            <div class="rounded-2xl border bg-zinc-50 dark:bg-zinc-800 p-4">
              <p class="text-sm text-zinc-500">Tax</p>
              <h3 class="mt-2 text-2xl font-bold text-orange-500">{{ formatMoney(data.taxMinor, data.currency) }}</h3>
            </div>
            <div class="rounded-2xl border bg-indigo-600 p-4 text-white">
              <p class="text-sm opacity-80">Total</p>
              <h3 class="mt-2 text-3xl font-bold">{{ formatMoney(data.totalMinor, data.currency) }}</h3>
            </div>
          </div>
        </div>
      </div>

      <!-- Customer + Timeline -->
      <div class="grid gap-6 lg:grid-cols-2">
        <div class="rounded-3xl border bg-white dark:bg-zinc-900 p-6 shadow-sm">
          <div class="mb-6 flex items-center gap-3">
            <div class="rounded-xl bg-indigo-50 dark:bg-indigo-950 p-2">
              <UserIcon class="h-5 w-5 text-indigo-600" />
            </div>
            <h2 class="text-xl font-semibold">Customer Details</h2>
          </div>
          <dl class="space-y-5">
            <div>
              <dt class="text-sm text-zinc-500">Name</dt>
              <dd class="mt-1 text-lg font-medium">{{ data.customerName }}</dd>
            </div>
            <div>
              <dt class="flex items-center gap-1.5 text-sm text-zinc-500">
                <MailIcon class="h-4 w-4" /> Email
              </dt>
              <dd class="mt-1 text-lg font-medium">{{ data.customerEmail }}</dd>
            </div>
            <div>
              <dt class="flex items-center gap-1.5 text-sm text-zinc-500">
                <CreditCardIcon class="h-4 w-4" /> Currency
              </dt>
              <dd class="mt-1 text-lg font-medium">{{ data.currency }}</dd>
            </div>
          </dl>
        </div>

        <div class="rounded-3xl border bg-white dark:bg-zinc-900 p-6 shadow-sm">
          <div class="mb-6 flex items-center gap-3">
            <div class="rounded-xl bg-indigo-50 dark:bg-indigo-950 p-2">
              <CalendarIcon class="h-5 w-5 text-indigo-600" />
            </div>
            <h2 class="text-xl font-semibold">Invoice Timeline</h2>
          </div>
          <dl class="space-y-5">
            <div>
              <dt class="text-sm text-zinc-500">Issued At</dt>
              <dd class="mt-1 text-lg font-medium">{{ new Date(data.issuedAt).toLocaleString() }}</dd>
            </div>
            <div>
              <dt class="text-sm text-zinc-500">Due At</dt>
              <dd class="mt-1 text-lg font-medium">{{ new Date(data.dueAt).toLocaleString() }}</dd>
            </div>
            <div>
              <dt class="text-sm text-zinc-500">Created At</dt>
              <dd class="mt-1 text-lg font-medium">{{ new Date(data.createdAt).toLocaleString() }}</dd>
            </div>
            <div>
              <dt class="text-sm text-zinc-500">Tax Rate</dt>
              <dd class="mt-1 text-lg font-medium">{{ data.taxRateBps / 100 }}%</dd>
            </div>
          </dl>
        </div>
      </div>

      <!-- Line items -->
      <div class="rounded-3xl border bg-white dark:bg-zinc-900 p-6 shadow-sm">
        <div class="mb-6 flex items-center gap-3">
          <div class="rounded-xl bg-indigo-50 dark:bg-indigo-950 p-2">
            <FileTextIcon class="h-5 w-5 text-indigo-600" />
          </div>
          <h2 class="text-xl font-semibold">Line Items</h2>
        </div>

        <div class="overflow-hidden rounded-2xl border">
          <table class="w-full text-sm">
            <thead class="bg-zinc-50 dark:bg-zinc-800">
              <tr>
                <th class="px-6 py-4 text-left font-semibold">Description</th>
                <th class="px-6 py-4 text-left font-semibold">Quantity</th>
                <th class="px-6 py-4 text-left font-semibold">Unit Price</th>
                <th class="px-6 py-4 text-left font-semibold">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="item in data.lineItems"
                :key="item.id"
                class="border-t"
              >
                <td class="px-6 py-4 font-medium">{{ item.description }}</td>
                <td class="px-6 py-4">{{ item.quantity }}</td>
                <td class="px-6 py-4">{{ formatMoney(item.unitPriceMinor, data.currency) }}</td>
                <td class="px-6 py-4 font-semibold">{{ formatMoney(item.totalMinor, data.currency) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import {
  ArrowLeftIcon,
  ReceiptIcon,
  DownloadIcon,
  UserIcon,
  MailIcon,
  CreditCardIcon,
  CalendarIcon,
  FileTextIcon,
} from 'lucide-vue-next'
import type { InvoiceStatus } from '@omazons/shared'
import { ALLOWED_STATUS_TRANSITIONS } from '@omazons/shared'
import { invoicesApi } from '@/api/invoices'
import StatusBadge from '@/components/StatusBadge.vue'
import { formatMoney } from '@/utils/format'

const route = useRoute()
const queryClient = useQueryClient()
const id = computed(() => route.params.id as string)

const { data, isLoading } = useQuery({
  queryKey: computed(() => ['invoice', id.value]),
  queryFn: () => invoicesApi.getById(id.value),
  enabled: computed(() => !!id.value),
})

const allowedTransitions = computed<InvoiceStatus[]>(
  () => (data.value ? ALLOWED_STATUS_TRANSITIONS[data.value.status] : [])
)

const { mutate: mutateStatus, isPending: isUpdating } = useMutation({
  mutationFn: (status: InvoiceStatus) =>
    invoicesApi.updateStatus(id.value, { status }),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['invoice', id.value] })
    queryClient.invalidateQueries({ queryKey: ['invoices'] })
  },
})

function updateStatus(status: InvoiceStatus) {
  mutateStatus(status)
}

const isDownloading = ref(false)

async function downloadPdf() {
  if (!data.value) return
  isDownloading.value = true
  try {
    const blob = await invoicesApi.downloadPdf(id.value)
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${data.value.number}.pdf`
    a.click()
    URL.revokeObjectURL(url)
  } finally {
    isDownloading.value = false
  }
}
</script>
