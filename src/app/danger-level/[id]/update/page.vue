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
const route = useRoute()

const { mutate, isPending } = useHttpMutation(computed(() => `/kelas-bahaya/${route.params.id}`), {
  method: 'PUT',
  queryOptions: {
    onSuccess(data,) {
      message.success(data.message)
      router.push('/danger-level')
    },
    onError(error) {
      message.error(error.data.message)
    }
  }
})

const rules: FormRules = {
  level: [
    {
      required: true,
      message: 'Kelas Bahaya Harus di isi',
    }
  ]
}

type FormType = {
  level?: string
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
      Selamat Datang Halaman Edit Kelas Bahaya Fakultas Sistem SIGAP
    </n-h2>
  </div>
  <div>
    <n-form @submit.prevent="onSubmit" :model="form" :rules="rules">
      <n-form-item label="Kelas Bahaya" path="name">
        <n-input v-model:value="form.level" />
      </n-form-item>
      <div class="flex gap-3">
        <n-button :loading="isPending" attr-type="submit" type="primary">
          Edit
        </n-button>
        <n-button type="tertiary" @click="router.back()">
          Batal
        </n-button>
      </div>
    </n-form>
  </div>
</template>
