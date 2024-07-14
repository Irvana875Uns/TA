<route lang="yaml">
meta:
  layout: main.layout
</route>

<script setup lang="ts">
import { onMounted } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useHttp } from '@/composables/http/http'
import { DateTime } from 'luxon'
import icon from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'

type Data = {
  id: string
  pelapor_id: string
  detail_id: any
  fakultas_id: string
  jenislaporan_id: string
  email_pelapor: string
  no_hp: string
  keterangan_pelapor: string
  keterangan_penanganan: string
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
</script>

<template>
  <div>
    <n-h2> Detail Laporan </n-h2>
  </div>
  <div>
    <div class="space-y-5">
      <n-table>
        <n-tr>
          <n-td> Kejadian </n-td>
          <n-td>
            {{ detail?.data.jenis_laporan }}
          </n-td>
        </n-tr>
        <n-tr>
          <n-td> Tanggal Kejadian </n-td>
          <n-td>
            {{ DateTime.fromISO(detail?.data.tanggal_laporan as string).toFormat('dd LLLL yyyy') }}
          </n-td>
        </n-tr>
        <n-tr>
          <n-td> Dilaporkan Pada </n-td>
          <n-td>
            {{ DateTime.fromISO(detail?.data.created_at as string).toFormat('dd LLLL yyyy') }}
          </n-td>
        </n-tr>
        <n-tr>
          <n-td> Dilaporkan oleh </n-td>
          <n-td>
            {{ detail?.data.nama_pelapor }}
          </n-td>
        </n-tr>
      </n-table>
      <div class="grid grid-cols-3 gap-5 mt-10">
        <n-card title="Status">
          {{ detail?.data.status }}
        </n-card>
        <n-card title="Jenis Laporan">
          {{ detail?.data.jenis_laporan }}
        </n-card>
        <n-card title="Kelas Bahaya"> Sedang </n-card>
      </div>
      <n-tabs @update-value="onChange" type="line" animated display-directive="show">
        <n-tab-pane name="detail" tab="Detail" class="space-y-5">
          <div id="map" class="w-full h-96"></div>
          <div>
            <n-table>
              <n-tr>
                <n-td class="w-52"> Keterangan </n-td>
                <n-td>
                  {{ detail?.data.keterangan_pelapor }}
                </n-td>
              </n-tr>
            </n-table>
            <n-table>
              <n-tr>
                <n-td class="w-52"> Keterangan Penanganan </n-td>
                <n-td>
                  {{ detail?.data.keterangan_penanganan }}
                </n-td>
              </n-tr>
            </n-table>
          </div>
        </n-tab-pane>
        <n-tab-pane name="photos" tab="Foto Kejadian">
          <div class="grid grid-cols-5 gap-5">
            <n-image :src="detail?.data.url_foto"></n-image>
          </div>
        </n-tab-pane>
      </n-tabs>
    </div>
  </div>
</template>
