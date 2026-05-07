<template>
  <main class="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
    <!-- Topbar -->
    <header class="sticky top-0 z-50 border-b bg-white/80 dark:bg-zinc-950/80 backdrop-blur">
      <div class="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div class="flex items-center gap-3">
          <div class="rounded-2xl bg-indigo-50 dark:bg-indigo-950 p-2">
            <FileTextIcon class="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <h1 class="text-2xl font-bold tracking-tight">InvoiceHub</h1>
            <p class="text-sm text-zinc-500">Manage and post invoices effortlessly</p>
          </div>
        </div>

        <button
          @click="showCreate = true"
          class="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
        >
          <PlusIcon class="h-4 w-4" />
          New Invoice
        </button>
      </div>
    </header>

    <section class="mx-auto max-w-7xl px-6 py-8">
      <!-- Loading -->
      <div v-if="isLoading" class="flex justify-center py-20">
        <div class="h-10 w-10 animate-spin rounded-full border-4 border-zinc-200 border-t-indigo-600" />
      </div>

      <div v-else-if="isError" class="rounded-2xl border border-red-200 bg-red-50 p-8 text-center text-red-600">
        Failed to load invoices.
      </div>

      <div v-else class="overflow-hidden rounded-3xl border bg-white dark:bg-zinc-900 shadow-sm">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-zinc-50 dark:bg-zinc-800">
              <tr>
                <th class="h-14 px-4 text-left text-sm font-semibold">Invoice #</th>
                <th class="h-14 px-4 text-left text-sm font-semibold">Customer</th>
                <th class="h-14 px-4 text-left text-sm font-semibold">Status</th>
                <th class="h-14 px-4 text-left text-sm font-semibold">Currency</th>
                <th class="h-14 px-4 text-left text-sm font-semibold">Total</th>
                <th class="h-14 px-4 text-left text-sm font-semibold">Issued</th>
                <th class="h-14 px-4 text-left text-sm font-semibold">Due</th>
                <th class="h-14 px-4 text-left text-sm font-semibold">Actions</th>
              </tr>
            </thead>

            <tbody>
              <tr v-if="!invoices.length">
                <td colspan="8" class="py-12 text-center text-zinc-400">No invoices found.</td>
              </tr>
              <tr
                v-for="invoice in invoices"
                :key="invoice.id"
                class="border-t transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
              >
                <td class="px-4 py-4 font-medium">{{ invoice.number }}</td>
                <td class="px-4 py-4">
                  <p class="font-medium">{{ invoice.customerName }}</p>
                  <p class="text-xs text-zinc-400">{{ invoice.customerEmail }}</p>
                </td>
                <td class="px-4 py-4">
                  <StatusBadge :status="invoice.status" />
                </td>
                <td class="px-4 py-4">{{ invoice.currency }}</td>
                <td class="px-4 py-4 font-semibold">{{ formatMoney(invoice.totalMinor, invoice.currency) }}</td>
                <td class="px-4 py-4">{{ formatDate(invoice.issuedAt) }}</td>
                <td class="px-4 py-4">{{ formatDate(invoice.dueAt) }}</td>
                <td class="px-4 py-4">
                  <RouterLink
                    :to="`/invoices/${invoice.id}`"
                    class="font-medium text-indigo-600 hover:underline"
                  >
                    View
                  </RouterLink>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="flex items-center justify-between border-t px-6 py-4">
          <p class="text-sm text-zinc-500">Page {{ page }} of {{ totalPages || 1 }}</p>
          <div class="flex items-center gap-2">
            <button
              @click="page--"
              :disabled="page === 1"
              class="rounded-lg border px-4 py-2 text-sm transition hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              @click="page++"
              :disabled="page >= totalPages"
              class="rounded-lg border px-4 py-2 text-sm transition hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </section>

    <CreateInvoiceModal
      v-if="showCreate"
      @close="showCreate = false"
      @created="onCreated"
    />
  </main>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { FileTextIcon, PlusIcon } from 'lucide-vue-next'
import { invoicesApi } from '@/api/invoices'
import StatusBadge from '@/components/StatusBadge.vue'
import CreateInvoiceModal from '@/components/CreateInvoiceModal.vue'
import { formatMoney, formatDate } from '@/utils/format'

const LIMIT = 10
const page = ref(1)
const showCreate = ref(false)
const queryClient = useQueryClient()

const { data, isLoading, isError } = useQuery({
  queryKey: computed(() => ['invoices', page.value]),
  queryFn: () => invoicesApi.list(page.value, LIMIT),
})

const invoices = computed(() => data.value?.data ?? [])
const totalPages = computed(() => Math.ceil((data.value?.total ?? 0) / LIMIT))

function onCreated() {
  showCreate.value = false
  queryClient.invalidateQueries({ queryKey: ['invoices'] })
}
</script>
