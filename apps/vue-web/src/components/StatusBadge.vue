<template>
  <span :class="['inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize', styles[status]]">
    {{ status }}
  </span>
</template>

<script setup lang="ts">
import type { InvoiceStatus } from '@omazons/shared'

defineProps<{ status: InvoiceStatus }>()

const styles: Record<InvoiceStatus, string> = {
  draft: 'bg-gray-100 text-gray-700',
  issued: 'bg-blue-100 text-blue-700',
  paid: 'bg-green-100 text-green-700',
  void: 'bg-red-100 text-red-700',
}
</script>
