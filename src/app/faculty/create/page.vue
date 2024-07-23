<route lang="yaml">
  meta:
    layout: main.layout
</route>

<script setup lang="ts">
import { useHttpMutation } from '@/composables/http/http';
import { useMessage, type FormRules } from 'naive-ui';
import { ref } from 'vue';

const message = useMessage()
const router = useRouter()

const { mutate, isPending } = useHttpMutation('/fakultas', {
  method: 'POST',
  queryOptions: {
    onSuccess(data, variables, context) {
      message.success(data.message)
      router.push('/faculty')
    },
    onError(error) {
      message.error(error.data.message)
    }
  }
})

const rules: FormRules = {
  name: [
    {
      required: true,
      message: 'Fakultas harus diisi',
    }
  ]
}

type FormType = {
  name?: string
}

const form = ref<FormType>({
})

const onSubmit = () => {
  mutate(form.value)
}

</script>

<template>
  <div>
    <n-h2>
      Selamat Datang Halaman Tambah Fakultas Sistem SIGAP
    </n-h2>
  </div>
  <div>
    <n-form @submit.prevent="onSubmit" :model="form" :rules="rules">
      <n-form-item label="Fakultas" path="name">
        <n-input v-model:value="form.name" />
      </n-form-item>
      <div class="flex gap-3">
        <n-button :loading="isPending" attr-type="submit" type="primary">
          Tambahkan
        </n-button>
        <n-button type="tertiary" @click="$router.back()">
          Batal
        </n-button>
      </div>
    </n-form>
  </div>
</template>
