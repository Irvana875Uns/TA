<route lang="yaml">
  meta:
    layout: main.layout
  </route>

<script setup lang="ts">
import { pageSelect } from '@/constants/pages'
import Action from '../_components/action.vue'
import { useHttp, useHttpMutation } from '@/composables/http/http';
import { useMessage } from 'naive-ui';
import { render } from 'vue';


const router = useRouter()
const selectedId = ref<string>()
const showDeleteModal = ref(false)
const params = ref<{
  page?: number
  size?: number
  q?: string
  search?: string
}>({
  page: 1,
  size: 10
})


const createColumns = () => {
  return [
    {
      title: 'Nama',
      key: 'name'
    },
    {
      title: 'Email',
      key: 'email'
    },
    {
      title: 'Nomor HP',
      key: 'phone'
    },
    {
      title: 'Fakultas',
      key: 'fakultas_name',
    },
    {
      title: 'Role',
      key: 'role',
      render: (v: { role: string }) => {
        return v.role || 'user'
      }
    },
    {
      title: 'Action',
      key: 'action',
      render: (v: { id: string }) => h(Action, {
        onEdit: () => {
          selectedId.value = v.id
          router.push(`/management/operator/${v.id }`)
        },
        onDelete: () => {
          selectedId.value = v.id
          showDeleteModal.value = true
        }
      })
    }
  ]
}

const columns = createColumns()
const message = useMessage()

const { data: user, isLoading, refetch } = useHttp<R<{
  id: string
}[]>>('/user', {
  params
})

const { mutate: deleteAction, isPending } = useHttpMutation(computed(() => `/user/${selectedId.value}`), {
  method: 'DELETE',
  queryOptions: {
    onSuccess(data) {
      message.success(data.message)
      showDeleteModal.value = false
      refetch()
    },
    onError(error) {
      message.error(error.data.message)
    }
  }
})

const onDelete = () => {
  deleteAction({})
}

const data = computed(() => {
  return user.value?.data
})
</script>

<template>
  <div>
    <n-h2>
      Selamat Datang Halaman Manajemen Sistem SIGAP
    </n-h2>
  </div>
  <div>
    <div class="flex justify-between mb-5">
      <n-button type="primary" @click="$router.push('/management/operator/create')">Tambah</n-button>
      <div>
        <n-input v-model:value="params.search" placeholder="Cari"></n-input>
      </div>
    </div>
    <div class="w-full whitespace-pre overflow-auto">
      <n-data-table :loading="isLoading" :columns="columns" :data="data" />
    </div>
    <div class="flex justify-between mt-5">
      <div class="w-full items-center flex">
        Showing
        <div class="w-20">
          <n-select v-model:value="params.size" :options="pageSelect"></n-select>
        </div>
        <div>of {{ user?.filter?.total_data }} items</div>
      </div>
      <div class="flex">
        <div class="ml-5">Page</div>
        <n-pagination v-model:page="params.page"></n-pagination>
      </div>
    </div>
  </div>
  <n-modal v-model:show="showDeleteModal" title="Apakah anda yakin ingin menghapus data ini?" preset="card"
    class="max-w-lg">
    <template #action>
      <div class="flex justify-end gap-5">
        <n-button @click="showDeleteModal = false">Batal</n-button>
        <n-button :loading="isPending" type="primary" @click="onDelete()">Hapus</n-button>
      </div>
    </template>
  </n-modal>
</template>
