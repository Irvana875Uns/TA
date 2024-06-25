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

const onChange = (v: string) => {
  if (v != 'detail') return
  setTimeout(() => initMap(Number(detail.value?.data.lat), Number(detail.value?.data.long)), 500)
}

const { mutate } = useHttpMutation<{
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
      }
    }
  }
)

const { data: user } = useHttp<R<{ id: string; name: string }[]>>('/user')
const { data: dangerLevel } = useHttp<R<{ level: string }[]>>('/kelas-bahaya')

const users = computed(() => {
  return user.value?.data.map((v) => {
    return { label: v.name, value: v.id }
  })
})

const dangerLevels = computed(() => {
  return dangerLevel.value?.data.map((v) => {
    return { label: v.level, value: v.level }
  })
})

const onSubmit = () => {
  mutate({
    kelas_bahaya_id: '1',
    penyebab: 'test',
    kronologi: 'test',
    keterangan_penanganan: 'test',
    kerugian: 'test',
    terpapar: 1,
    luka: 1,
    meninggal: 1,
    kerusakan_lingkungan: 1
  })
}
</script>

<template>
  <div>
    <n-h2> Detail Laporan </n-h2>
  </div>
  <div>
    <n-form @submit.prevent="onSubmit">
      <n-form-item label="Petugas">
        <n-select :options="users"></n-select>
      </n-form-item>
      <n-form-item label="Kelas Bahaya">
        <n-select :options="dangerLevels"></n-select>
      </n-form-item>
      <n-form-item label="Penyebab">
        <n-input type="textarea"></n-input>
      </n-form-item>
      <n-form-item label="Kronologi">
        <n-input type="textarea"></n-input>
      </n-form-item>
      <n-form-item label="Keterangan Penanganan">
        <n-input type="textarea"></n-input>
      </n-form-item>
      <n-form-item label="Kerugian">
        <n-input type="textarea"></n-input>
      </n-form-item>
      <n-form-item label="Terpapar">
        <n-input-number></n-input-number>
      </n-form-item>
      <n-form-item label="Luka">
        <n-input-number></n-input-number>
      </n-form-item>
      <n-form-item label="Meninggal">
        <n-input-number></n-input-number>
      </n-form-item>
      <n-form-item label="Kerusakan lainnya">
        <n-input-number></n-input-number>
      </n-form-item>
      <div class="flex flex-col gap-3">
        <n-button type="primary" attr-type="submit"> Tangani </n-button>
        <n-button @click="$router.back()"> Kembali </n-button>
      </div>
    </n-form>
  </div>
</template>
