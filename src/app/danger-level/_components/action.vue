<script setup lang="ts">
import { CreateOutline, TrashOutline } from '@vicons/ionicons5'

const emit = defineEmits(['edit', 'delete'])
</script>

<template>
  <div class="flex gap-2">
    <n-tooltip>
      <template #trigger>
        <n-button circle type="tertiary" @click="emit('edit')">
          <template #icon>
            <n-icon :component="CreateOutline"></n-icon>
          </template>
        </n-button>
      </template>
      Edit
    </n-tooltip>
    <n-tooltip>
      <template #trigger>
        <n-button circle type="error" @click="emit('delete')">
          <template #icon>
            <n-icon :component="TrashOutline"></n-icon>
          </template>
        </n-button>
      </template>
      Hapus
    </n-tooltip>
  </div>
</template>