<route lang="yaml">
meta:
  layout: main.layout
</route>

<script setup lang="ts">
import { useHttp, useHttpMutation } from '@/composables/http/http'
import { ROLES } from '../../_constants/role'
import { useMessage } from 'naive-ui'

const message = useMessage()
const route = useRoute()
const router = useRouter()
const { data } = useHttp<R<{ name: string; email: string; role: string; phone: string }>>(
  computed(() => `user/${route.params.id}`)
)

const formData = ref({
  name: '',
  email: '',
  role: '',
  phone: ''
})

watch(
  data,
  () => {
    if (!data.value) return
    formData.value = {
      name: data.value?.data.name,
      email: data.value?.data.email,
      role: data.value?.data.role,
      phone: data.value?.data.phone
    }
  },
  {
    deep: true
  }
)

const { mutate: updateUser, isPending } = useHttpMutation(
  computed(() => `user/${route.params.id}`),
  {
    method: 'PUT',
    queryOptions: {
      onSuccess(data) {
        message.success(data.message)
        router.push('/management/admin')
      }
    }
  }
)

const onSubmit = () => {
  updateUser(formData.value)
}
</script>

<template>
  <div>
    <n-h2> Selamat Datang Halaman Manajemen Sistem SIGAP </n-h2>
  </div>
  <div>
    <n-form @submit.prevent="onSubmit">
      <n-form-item label="Nama">
        <n-input v-model:value="formData.name" />
      </n-form-item>
      <n-form-item label="Email">
        <n-input v-model:value="formData.email" />
      </n-form-item>
      <n-form-item label="Role">
        <n-select
          v-model:value="formData.role"
          clearable
          :options="ROLES.map((v) => ({ label: v, value: v }))"
        ></n-select>
      </n-form-item>
      <n-form-item label="Nomor Hp">
        <n-input v-model:value="formData.phone" />
      </n-form-item>
      <div class="flex gap-3">
        <n-button type="primary" attr-type="submit" :loading="isPending"> Edit </n-button>
        <n-button type="tertiary" @click="$router.back()"> Batal </n-button>
      </div>
    </n-form>
  </div>
</template>
