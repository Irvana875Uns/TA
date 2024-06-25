<route lang="yaml">
  meta:
    layout: main.layout
  </route>
<script setup lang="ts">
import { pageSelect } from '@/constants/pages'
import { useHttp, useHttpMutation } from '@/composables/http/http';
import { DateTime } from 'luxon';
import Action from './_components/action.vue';
import { useMessage } from 'naive-ui';

const createColumns = () => {
  return [
    {
      title: 'Nama',
      key: 'level',
    },
    {
      key: 'created_at',
      title: 'Dibuat Pada',
      render: (v: { created_at: string }) => DateTime.fromISO(v.created_at).toLocaleString(DateTime.DATETIME_MED_WITH_WEEKDAY)
    },
    {
      title: 'Action',
      key: 'action',
      render: (v: { id: string }) => h(Action, {
        onDelete: () => {
          selectedId.value = v.id
          showDeleteModal.value = true
        },
        onEdit: () => {
          router.push(`/danger-level/${v.id}/update`)
        }
      }),
    },
  ]
}


const columns = createColumns()
const message = useMessage()
const router = useRouter()
const selectedId = ref()
const showDeleteModal = ref(false)

const { data: dangerLevel, isLoading, refetch } = useHttp<R<{ name: string }>>('/kelas-bahaya')
const { mutate: deleteAction, isPending } = useHttpMutation(computed(() => `/kelas-bahaya/${selectedId.value}`), {
  method: 'DELETE',
  queryOptions: {
    onSuccess(data,) {
      message.success(data.message)
      showDeleteModal.value = false
      refetch()
    },
    onError(error) {
      message.error(error.data.message)
    }
  }
})

const onDelete = (id: string) => {
  selectedId.value = id
  deleteAction({})
}

const data = computed(() => dangerLevel.value?.data)
</script>

<template>
  <div>
    <n-h2>
      Selamat Datang Halaman Kelas Bahaya Sistem SIGAP
    </n-h2>
  </div>
  <div>
    <div class="flex flex-col md:flex-row gap-5 mb-10">
      <n-button type="primary" @click="$router.push('/danger-level/create')">
        Create
      </n-button>
      <n-input placeholder="Cari"></n-input>
    </div>
    <div class="w-full whitespace-pre overflow-auto">
      <n-data-table :loading="isLoading" :columns="columns" :data="(data as any)" />
    </div>
    <div class="flex justify-between mt-5">
      <div class="w-full items-center flex">
        Showing
        <div class="w-20">
          <n-select :options="pageSelect"></n-select>
        </div>
        <div>of 100 items</div>
      </div>
      <div class="flex">
        <div class="ml-5">Page</div>
        <n-pagination></n-pagination>
      </div>
    </div>
  </div>
  <n-modal v-model:show="showDeleteModal" title="Apakah anda yakin ingin menghapus data ini?" preset="card"
    class="max-w-lg">
    <template #action>
      <div class="flex justify-end gap-5">
        <n-button @click="showDeleteModal = false">Cancel</n-button>
        <n-button :loading="isPending" type="primary" @click="onDelete(selectedId)">Delete</n-button>
      </div>
    </template>
  </n-modal>
</template>
