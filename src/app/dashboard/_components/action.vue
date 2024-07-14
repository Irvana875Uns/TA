<script setup lang="ts">
import { useHttp } from '@/composables/http/http';
import type { ProfileResponse } from '@/types/profile';

const { data: profile } = useHttp<ProfileResponse>('/profile')

defineProps<{
  status: 'laporan-ditolak' |
  'laporan-ditangani' |
  'laporan-masuk' |
  'laporan-tertangani' | string
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
    <template v-if="['admin', 'operator'].includes(profile?.data.role as string)">
      <n-tooltip v-if="status == 'laporan-ditolak'">
        <template #trigger>
          <n-button @click="$emit('review')" type="error"> Tinjau Ulang </n-button>
        </template>
        Tinjau
      </n-tooltip>
      <n-tooltip v-if="status == 'laporan-masuk'">
        <template #trigger>
          <n-button @click="$emit('approval')" type="success"> Terima </n-button>
        </template>
        Terima
      </n-tooltip>
    </template>
  </div>
</template>