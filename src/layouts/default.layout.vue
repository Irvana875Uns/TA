<script setup lang="ts">
import login from '@/app/auth/login/page.vue'
import { useHttp } from '@/composables/http/http';
import type { ProfileResponse } from '@/types/profile';
import Cookies from 'js-cookie';

const openModal = ref(false)
const show = ref<boolean>()

const { data, isSuccess } = useHttp<ProfileResponse>('profile', {
  queryOptions: {
    queryKey: ['profile'],
    enabled: computed(() => Cookies.get('token') ? true : false)
  }
})

const options = [
  // {
  //   label: 'Profile',
  //   key: 'profile'
  // },
  {
    label: 'Logout',
    key: '/auth/logout'
  }
]
</script>

<template>
  <main>
    <n-modal v-model:show="show">
      <login />
    </n-modal>
    <nav>
      <div class="max-w-screen-xl w-full mx-auto flex justify-between h-18 items-center px-3">
        <div class="text-primary font-bold text-2xl">SIGAP</div>
        <div>
          <ul class="flex gap-4 items-center">
            <li v-if="data?.data && data?.data.role !== ''">
            <router-link v-if="data?.data.role === 'petugas'" to="/report">Report</router-link>
           <router-link v-else to="/dashboard">Dashboard</router-link>
            </li>
            <li>
              <router-link to="/">Home</router-link>
            </li>
            <li v-if="data?.data.role==''">
              <router-link to="/data">Laporan Saya</router-link>
            </li>
            <li>
              <div v-if="isSuccess">
                <div>
                  <n-dropdown :options="options" @select="(v) => $router.push(v)">
                    {{ data?.data.name }}
                  </n-dropdown>
                </div>
              </div>
              <div v-else>
                <n-button type="primary" @click="show = true">Masuk</n-button>
              </div>
            </li>
            <n-modal v-model:show="openModal" preset="dialog">
              <n-card>
                <div class="font-bold text-center mb-5">Masuk ke Akunmu</div>
                <div class="text-center mb-5">
                  Nikmati laporanmu dengan mudah bersama
                  <span class="text-primary"> SIGAP</span>
                </div>
                <div class="text-center mb-5">Gunakan Email Anda</div>
                <n-form ref="formref" class="mx-auto max-w-[400px]">
                  <n-form-item path="email" label="Email">
                    <n-input placeholder="Masukkan Email">
                      <template #prefix>
                        <n-icon><i-mdi:email-outline /></n-icon>
                      </template>
                    </n-input>
                  </n-form-item>
                  <n-form-item path="password" label="Password">
                    <n-input placeholder="Masukkan Password">
                      <template>
                        <n-icon><i-mdi:password-outline /></n-icon>
                      </template>
                    </n-input>
                  </n-form-item>
                  <div class="flex justify-center mt-3 mb-5">
                    <n-button type="primary" block class="mx-auto max-w-[400px] !w-full !rounded-lg">Masuk</n-button>
                  </div>
                </n-form>
                <div class="text-center mb-5">Masuk Menggunakan Akun Google</div>
                <div class="flex justify-center mt-3 mb-5">
                  <n-button type="primary" block class="mx-auto max-w-[400px] !w-full !rounded-lg">GOOGLE</n-button>
                </div>
              </n-card>
            </n-modal>
          </ul>
        </div>
      </div>
    </nav>
    <div><router-view /></div>
  </main>
  <div class="bg-primary text-white py-10 sticky mt-96">
    <div class="max-w-screen-xl mx-auto grid gap-4 md:grid-cols-3 px-3">
      <div>
        <div class="flex gap-5">
          <img src="@/assets/images/uns.png" alt="" />
          <img src="@/assets/images/sv.png" alt="" />
          <img src="@/assets/images/d3ti.png" alt="" />
        </div>
        <div class="text-3xl font-bold">SIGAP</div>
        <div>Sigap merupakan sistem informasi untuk melaporkan kejadian di lingkungan uns, baik kejadian
          alam maupun non alam.</div>
      </div>
      <div>
        <div class="text-xl">Kontak</div>
        <ul>
          <li>(+62)89 xxxx xxxx xxx</li>
          <li>(+62)89 xxxx xxxx xxx</li>
        </ul>
      </div>
      <div>
        <div class="text-xl">Alamat</div>
        <div>
          Jl. Jend. Urip Sumoharjo No.112, Purwodiningratan, Kec. Jebres, Kota Surakarta, Jawa
          Tengah 57129
        </div>
      </div>
    </div>
  </div>
</template>
