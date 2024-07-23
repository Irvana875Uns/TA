<route lang="yaml">
meta:
  layout: main.layout
</route>

<script setup lang="ts">
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useHttp, useHttpMutation } from '@/composables/http/http'
import { DateTime } from 'luxon'
import icon from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'
import { useMessage } from 'naive-ui'
import { ref, computed, watchEffect } from 'vue'

const message = useMessage()

type Data = {
  id: string
  pelapor_id: string
  detail_id: any
  fakultas_id: string
  jenislaporan_id: string
  email_pelapor: string
  no_hp: string
  keterangan_pelapor: string
  lat: string
  long: string
  url_foto: string
  status: string
  created_at: string
  updated_at: string
  deleted_at: any
  fakultas_name: string
  jenis_laporan: string
  nama_pelapor: string
  tanggal_laporan: string
}

const route = useRoute()
const router = useRouter()

const { data: detail } = useHttp<R<Data>>(
  computed(() => `/laporan/${route.params.id}`),
  {
    queryOptions: {
      queryKey: ['detail', route.params.id],
      enabled: computed(() => !!route.params.id)
    }
  }
)

const initMap = (lat: number, lng: number) => {
  var map = L.map('map').setView([lat, lng], 13)
  L.Marker.extend({
    iconUrl: icon,
    shadowUrl: iconShadow
  })

  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map)

  L.marker([lat, lng]).addTo(map).bindPopup('Lokasi Kejadian.').openPopup()
}

watchEffect(() => {
  if (detail.value?.data) {
    console.log(detail.value.data)
    setTimeout(() => initMap(Number(detail.value?.data.lat), Number(detail.value?.data.long)), 500)
  }
})

const { mutate, isPending } = useHttpMutation<{
  kelas_bahaya_id: string
  penyebab: string
  kronologi: string
  keterangan_penanganan: string
  kerugian: string
  terpapar: number
  luka: number
  meninggal: number
  kerusakan_lingkungan: number
}>(
  computed(() => `/laporan/petugas-report/${route.params.id}`),
  {
    method: 'POST',
    queryOptions: {
      onSuccess(data) {
        message.success(data.message)
        router.push('/report')
      },
      onError: (err) => {
        message.error(err.data.message)
      }
    }
  }
)

const capitalize = (str: string) => {
  return str
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

const { data: user } =
  useHttp<R<{ id: string; name: string; role: string; fakultas_name: string }[]>>('/user')
const { data: dangerLevel } = useHttp<R<{ level: string, id: string }[]>>('/kelas-bahaya')

const users = computed(() => {
  return user.value?.data.map((v) => {
    const role = capitalize(v?.role?.split('_')?.join(' ') || '')
    return { label: `${v.name} - ${role} - ${v.fakultas_name}`, value: v.id }
  })
})

const dangerLevels = computed(() => {
  return dangerLevel.value?.data.map((v) => {
    return { label: v.level, value: v.id }
  })
})

// Form state
const formState = ref({
  kelas_bahaya_id: '',
  penyebab: '',
  kronologi: '',
  keterangan_penanganan: '',
  kerugian: '',
  terpapar: 0,
  luka: 0,
  meninggal: 0,
  kerusakan_lingkungan: 0
})

const onSubmit = () => {
  console.log('Submitting form with state:', formState.value)
  mutate(formState.value)
}
</script>

<template>
  <div>
    <n-h2> Buat Laporan Petugas </n-h2>
  </div>
  <div>
    <n-form @submit.prevent="onSubmit">
      <n-form-item label="Kelas Bahaya">
        <n-select v-model:value="formState.kelas_bahaya_id" :options="dangerLevels"></n-select>
      </n-form-item>
      <n-form-item label="Penyebab">
        <n-input v-model:value="formState.penyebab" type="textarea"></n-input>
      </n-form-item>
      <n-form-item label="Kronologi">
        <n-input v-model:value="formState.kronologi" type="textarea"></n-input>
      </n-form-item>
      <n-form-item label="Keterangan Penanganan">
        <n-input v-model:value="formState.keterangan_penanganan" type="textarea"></n-input>
      </n-form-item>
      <n-form-item label="Kerugian">
        <n-input v-model:value="formState.kerugian" type="textarea"></n-input>
      </n-form-item>
      <n-form-item label="Terpapar">
        <n-input-number v-model:value="formState.terpapar"></n-input-number>
      </n-form-item>
      <n-form-item label="Luka">
        <n-input-number v-model:value="formState.luka"></n-input-number>
      </n-form-item>
      <n-form-item label="Meninggal">
        <n-input-number v-model:value="formState.meninggal"></n-input-number>
      </n-form-item>
      <n-form-item label="Kerusakan lainnya">
        <n-input-number v-model:value="formState.kerusakan_lingkungan"></n-input-number>
      </n-form-item>
      <div class="flex flex-col gap-3">
        <n-button :loading="isPending" type="primary" attr-type="submit"> Tangani </n-button>
        <n-button @click="$router.back()"> Kembali </n-button>
      </div>
    </n-form>
  </div>
</template>
