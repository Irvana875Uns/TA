<script setup lang="ts">
import { useHttpMutation } from '@/composables/http/http'
import { type CallbackTypes } from 'vue3-google-login'
import Cookie from 'js-cookie'

type Form = {
  token: string
}

const router = useRouter()

const { mutate, isPending } = useHttpMutation<Form>('/login-sso', {
  method: 'POST',
  queryOptions: {
    onError(error, variables, context) {
      console.log(error)
    },
    onSuccess(data, variables, context) {
      Cookie.set('token', data.data.token)
      window.location.reload()
    },
  }
})

const onGoogleLogin: CallbackTypes.TokenResponseCallback = (token) => {
  console.log(token)
  mutate({
    token: token.access_token
  })
}
</script>

<template>
  <div class="max-w-2xl mx-auto">
    <n-card clearable>
      <div class="flex justify-center flex-col items-center text-center mb-3">
        <div class="font-semibold text-3xl mb-3">Masuk ke Akunmu</div>
        <p class="text-center mb-3">
          Nikmati pelaporanmu dengan mudah bersama
          <span class="text-primary"> SIGAP</span>
        </p>
      </div>
      <div class="text-center my-3">Masuk Menggunakan Akun Google</div>
      <GoogleLogin class="w-full" auto-login :callback="onGoogleLogin" popup-type="TOKEN">
        <n-button :loading="isPending" type="primary" block> Google </n-button>
      </GoogleLogin>
    </n-card>
  </div>
</template>
