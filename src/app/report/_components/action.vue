<script setup lang="ts">
import { useHttp } from '@/composables/http/http'
import { REPORT_STATUSES } from '@/constants/report'
import type { ProfileResponse } from '@/types/profile'

const { data: profile } = useHttp<ProfileResponse>('/profile')

defineProps<{
  id: string
  status:
    | 'laporan-ditolak'
    | 'laporan-ditangani'
    | 'laporan-masuk'
    | 'laporan-tertangani'
    | string
}>()

defineEmits<{
  (e: 'review'): void
  (e: 'detail'): void
  (e: 'approval'): void
}>()
</script>

<template>
  <div class="flex gap-2">
    <n-tooltip>
      <template #trigger>
        <n-button @click="$emit('detail')" type="tertiary"> Detail </n-button>
      </template>
      Detail
    </n-tooltip>
    <template v-if="['admin', 'operator'].includes(profile?.data.role as string)">
      <n-tooltip v-if="status == 'laporan-ditolak'">
        <template #trigger>
          <n-button @click="$emit('review')" type="error"> Tinjau Ulang </n-button>
        </template>
        Tinjau
      </n-tooltip>
      <n-tooltip v-if="status == 'laporan-masuk'">
        <template #trigger>
          <n-button @click="$emit('approval')" type="success"> Approval </n-button>
        </template>
        Approval
      </n-tooltip>
    </template>
    <n-tooltip v-if="status == 'laporan-diterima'">
      <template #trigger>
        <n-button type="primary" @click="$router.push(`/report/${id}/exec`)">
          Buat laporan
        </n-button>
      </template>
      Buat Laporan
    </n-tooltip>
  </div>
</template>
