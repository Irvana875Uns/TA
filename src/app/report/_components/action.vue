<script setup lang="ts">
import { REPORT_STATUSES } from '@/constants/report';

defineProps<{
  status: 'laporan-ditolak' |
  'laporan-diterima' |
  'laporan-masuk' |
  'sedang-ditangani' |
  'sudah-ditangani' | string
}>()

defineEmits<{
  (e: 'review'): void
  (e: 'detail'): void
  (e: 'approval'): void
}>()
</script>

<template>
  <div class="flex gap-2">
    <n-tooltip >
      <template #trigger>
        <n-button @click="$emit('detail')" type="tertiary">
          Detail
        </n-button>
      </template>
      Detail
    </n-tooltip>
    <n-tooltip v-if="status == 'laporan-ditolak'">
      <template #trigger>
        <n-button @click="$emit('review')" type="error">
          Tinjau Ulang
        </n-button>
      </template>
      Tinjau
    </n-tooltip>
    <n-tooltip v-if="status == 'laporan-masuk'">
      <template #trigger>
        <n-button @click="$emit('approval')" type="success">
          Approval
        </n-button>
      </template>
      Approval
    </n-tooltip>
  </div>
</template>