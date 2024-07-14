<route lang="yaml">
  meta:
    layout: main.layout
  </route>
  
<script setup lang="ts">
import { useHttp, useHttpMutation } from '@/composables/http/http';
import { roleOptions } from '@/app/management/_constants/role'
import { useMessage } from 'naive-ui';

type Form = {
  name?: string
  email?: string
  role?: 'admin' | 'user' | 'petugas' | 'admin_unit' | ''
  phone?: string
  address?: string
  gender?: string
  facultyId?: string
}

const message = useMessage()
const { data: faculty, isLoading: isLoadingFaculty } = useHttp<R<{ id: string, name: string }[]>>('/fakultas')

const facultyOptions = computed(() => {
  return faculty.value?.data.map((v) => {
    return { label: v.name, value: v.id }
  })
})

const router = useRouter()
const form = ref<Form>({
})

const { mutate, isPending, } = useHttpMutation('/user', {
  method: 'POST',
  queryOptions: {
    onSuccess(data) {
      router.push('/management/admin-unit')
      message.success(data.message)
    },
    onError(error) {
      message.error(error.data.message)
    }
  }
})

const onSubmit = () => {
  mutate({
    "name": form.value?.name,
    "email": form.value?.email,
    "role": form.value?.role,
    // "gender": form.value?.gender,
    "fakultas_id": form.value?.facultyId,
    "phone": form.value?.phone,
    // "address": form.value?.address
  })
}
</script>
  
<template>
  <div>
    <n-h2>
      Selamat Datang Halaman Manajemen Sistem SIGAP
    </n-h2>
  </div>
  <div>
    <n-form  :model="form" @submit.prevent="onSubmit">
      <n-form-item label="Nama">
        <n-input v-model:value="form.name"/>
      </n-form-item>
      <n-form-item label="Email">
        <n-input v-model:value="form.email"/>
      </n-form-item>
      <n-form-item label="Role">
        <n-select v-model:value="form.role" :options="roleOptions"></n-select>
      </n-form-item>
      <n-form-item label="Nomor HP">
        <n-input v-model:value="form.phone" />
      </n-form-item>
      <n-form-item label="Fakultas">
        <n-select v-model:value="form.facultyId" :options="facultyOptions" :loading="isLoadingFaculty"></n-select>
      </n-form-item>
      <div class="flex gap-3">
        <n-button type="primary" :loading="isPending" attr-type="submit">
          Tambahkan
        </n-button>
        <n-button type="tertiary">
          Batal
        </n-button>
      </div>
    </n-form>
  </div>
</template>
