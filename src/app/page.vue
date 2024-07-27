<script setup lang="ts">
import L, { Marker } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import login from '@/app/auth/login/page.vue'
import { useHttp, useHttpMutation } from '@/composables/http/http'
import Cookies from 'js-cookie'
import type { ProfileResponse } from '@/types/profile'
import { DateTime } from 'luxon'
import { useMessage, type UploadFileInfo, type UploadSettledFileInfo } from 'naive-ui'
import icon from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'

const successCard = ref<HTMLElement>()
const message = useMessage()
const marker = ref<Marker>()
const showSuccess = ref(false)
const show = ref(false)
const form = ref<{
  facultyId?: string
  reportTypeId?: string | null
  phone?: string
  description?: string
  lat?: string
  long?: string
  imageUrl?: string
  dateTime?: number
  url_foto?: string
  custom_jenislaporan?: string
}>({ dateTime: DateTime.now().toMillis() })

const isAuthenticated = Cookies.get('token')
const { data: faculty, isLoading: isLoadingFaculty } =
  useHttp<R<{ id: string; name: string }[]>>('/fakultas')
const { data: reportType, isLoading: isLoadingReportType } =
  useHttp<R<{ id: string; name: string }[]>>('/jenis-laporan')
const { data: poto } = useHttp<R<{ id: string; url_foto: string }[]>>('/laporan-images')

const { mutate, isPending } = useHttpMutation<{
  tanggal_laporan: string
  fakultas_id: string
  jenislaporan_id?: string | null
  no_hp: string
  nama_pelapor: string
  keterangan_pelapor: string
  lat: string
  long: string
  url_foto: string
  custom_jenislaporan?: string
}>('/public/laporan', {
  method: 'POST',
  queryOptions: {
    onSuccess(data, variables, context) {
      message.success(data.message)
      showSuccess.value = true
      setTimeout(() => successCard.value?.scrollIntoView({ behavior: 'smooth' }), 1000)
    }
  }
})

const { mutate: upload, isPending: isUploadPending } = useHttpMutation<FormData, { data: string }>(
  '/upload-image',
  {
    method: 'POST',
    httpOptions: {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    },
    queryOptions: {
      onSuccess(data) {
        form.value.url_foto = data.data
      },
      onError(error) {
        message.error('Upload gagal, maksimal ukuran 1000kb')
      }
    }
  }
)

const { data: profile } = useHttp<ProfileResponse>('profile', {
  queryOptions: {
    queryKey: ['profile'],
    enabled: computed(() => (isAuthenticated ? true : false))
  }
})

watchOnce(
  profile,
  () => {
    setTimeout(() => {
      navigator.geolocation.getCurrentPosition(
        function (position) {
          var map = L.map('map').setView([position.coords.latitude, position.coords.longitude], 13)

          L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          }).addTo(map)

          L.Marker.extend({
            iconUrl: icon,
            shadowUrl: iconShadow
          })

          marker.value = L.marker([position.coords.latitude, position.coords.longitude])
            .addTo(map)
            .bindPopup('Lokasi anda saat ini.')
            .openPopup()

          form.value.lat = position.coords.latitude.toString()
          form.value.long = position.coords.longitude.toString()

          map.on('click', function (e) {
            if (marker.value) {
              map.removeLayer(marker.value)
            }

            marker.value = L.marker([e.latlng.lat, e.latlng.lng]).addTo(map)
            form.value.lat = e.latlng.lat.toString()
            form.value.long = e.latlng.lng.toString()
          })
        },
        function (error) {
          var map = L.map('map').setView([-6.2, 0.3], 13)
          L.Marker.extend({
            iconUrl: icon,
            shadowUrl: iconShadow
          })
          map.on('click', function (e) {
            if (marker.value) {
              map.removeLayer(marker.value)
            }

            marker.value = L.marker([e.latlng.lat, e.latlng.lng]).addTo(map)
          })
        }
      )
    }, 1000)
  },
  { immediate: true, deep: true }
)

const facultyOptions = computed(() => {
  return faculty.value?.data.map((v) => {
    return { label: v.name, value: v.id }
  })
})

const reportTypeOptions = computed(() => {
  const options = []
  reportType.value?.data.forEach((v) => {
    options.push({ label: v.name, value: v.id })
  })

  options.push({
    label: 'Lainnya',
    value: 'other'
  })

  return options
})

const onSubmit = () => {
  mutate({
    fakultas_id: form.value.facultyId ?? '',
    jenislaporan_id: form.value.reportTypeId === 'other' ? null : form.value.reportTypeId ?? '',
    no_hp: form.value.phone ?? '',
    keterangan_pelapor: form.value.description ?? '',
    lat: form.value.lat ?? '',
    long: form.value.long ?? '',
    url_foto: form.value.url_foto as string,
    nama_pelapor: profile.value?.data?.name as string,
    tanggal_laporan: DateTime.fromMillis(form.value.dateTime || 0).toISO() as string,
    custom_jenislaporan: form?.value?.custom_jenislaporan || ''
  })
}

const onBack = () => {
  showSuccess.value = false
  form.value = {}
  window.location.reload()
}

const onUpload = (ev: { file: UploadSettledFileInfo; fileList: UploadSettledFileInfo[] }) => {
  if (!ev.file.file) return
  if (!['image/png', 'image/jpg', 'image/svg', 'image/jpeg'].includes(ev.file.file?.type)) {
    message.error('Hanya bisa upload gambar.')
    return false
  }
  const formData = new FormData()
  formData.append('image', ev.file.file)

  upload(formData)
}

const disablePreviousDate = (ts: number) => {
  return ts > Date.now()
}
</script>
<template>
  <n-modal v-model:show="show">
    <login />
  </n-modal>
  <div class="flex flex-col-reverse md:flex-row max-w-screen-xl mx-auto py-10 px-3">
    <div class="py-20 space-y-5">
      <div class="text-3xl font-semibold">Sistem Informasi Tanggap Peristiwa</div>
      <div>
        Sigap merupakan sistem informasi untuk melaporkan kejadian di lingkungan uns, baik kejadian
        alam maupun non alam.
      </div>
      <div>
        <n-button type="primary"> Laporkan Peristiwa </n-button>
      </div>
    </div>
    <div class="h-full">
      <img class="min-h-[40rem] object-contain" src="@/assets/images/hero.png" alt="" />
    </div>
  </div>
  <section class="bg-primary text-white relative px-3">
    <div class="max-w-screen-xl mx-auto py-10 flex flex-col md:flex-row justify-between gap-10">
      <div class="md:w-1/2">
        <div class="text-2xl font-semibold mb-5">
          Bagaimana Sigap Membantu Menyelesaikan Laporan Anda ?
        </div>
        <div>
          <n-steps vertical :current="1" status="process" class="!text-white">
            <n-step>
              <template #title>
                <div class="text-white">Tulis Laporan</div>
              </template>
            </n-step>
            <n-step title="Verifikasi" />
            <n-step title="Proses Tindak Lanjut" />
            <n-step title="Selesai" />
          </n-steps>
        </div>
      </div>
      <div ref="successCard" class="md:w-1/2 right-0">
        <div class="text-xl font-semibold mb-5">Sampaikan Laporan Anda</div>
        <n-card v-if="showSuccess" class="max-w-2xl">
          <n-result
            status="success"
            title="Laporan Terkirim"
            description="Laporan anda sedang diproses"
          >
            <div class="flex justify-center">
              <n-button type="primary" @click="onBack"> Kembali </n-button>
            </div>
          </n-result>
        </n-card>
        <template v-else>
          <div v-if="isAuthenticated">
            <n-card v-if="profile?.data.role == ''" class="absolute max-w-2xl">
              <n-form @submit.prevent="onSubmit">
                <n-form-item label="Nama">
                  <n-input :value="profile?.data.name as string" disabled />
                </n-form-item>
                <n-form-item label="Email">
                  <n-input :value="profile?.data.email as string" disabled />
                </n-form-item>
                <n-form-item ref="formRef" label="No. Handphone" path="phone">
                  <n-input v-model:value="form.phone" @keydown.enter.prevent />
                </n-form-item>
                <n-form-item label="Fakultas atau Unit">
                  <n-select
                    v-model:value="form.facultyId"
                    :options="facultyOptions"
                    :loading="isLoadingFaculty"
                  />
                </n-form-item>
                <n-form-item label="Jenis Laporan">
                  <n-select
                    v-model:value="form.reportTypeId"
                    :options="reportTypeOptions"
                    :loading="isLoadingReportType"
                  />
                </n-form-item>
                <n-form-item v-if="form.reportTypeId === 'other'" label="Jenis laporan lainnya">
                  <n-input v-model:value="form.custom_jenislaporan"> </n-input>
                </n-form-item>
                <n-form-item label="Tanggal">
                  <n-date-picker
                    v-model:value="form.dateTime"
                    :is-date-disabled="disablePreviousDate"
                  ></n-date-picker>
                </n-form-item>
                <n-form-item label="Lokasi">
                  <div id="map" class="w-full h-96"></div>
                </n-form-item>
                <n-form-item label="Deskripsi Laporan">
                  <n-input v-model:value="form.description" type="textarea" />
                </n-form-item>
                <n-form-item label="Foto ">
                  <n-spin :show="isUploadPending">
                    <n-upload
                      :loading="isUploadPending"
                      directory-dnd
                      :max="1"
                      accept="image/png, image/jpeg , image/jpg"
                      @before-upload="onUpload"
                    >
                      <n-upload-dragger>
                        <n-text style="font-size: 16px">
                          Click or drag a file to this area to upload
                        </n-text>
                        <n-p depth="3" style="margin: 8px 0 0 0">
                          Strictly prohibit from uploading sensitive information. For example, your
                          bank card PIN or your credit card expiry date.
                        </n-p>
                      </n-upload-dragger>
                    </n-upload>
                  </n-spin>
                </n-form-item>
                <div class="mb-5">
                  <n-checkbox>
                    Laporan ini saya buat sesuai dengan kondisi kejadian yang sesungguhnya
                  </n-checkbox>
                </div>
                <n-button
                  attr-type="submit"
                  :loading="isPending || isUploadPending"
                  type="primary"
                  block
                >
                  Kirim Laporan
                </n-button>
              </n-form>
            </n-card>
          </div>
          <n-card v-else>
            <div class="text-xl font-semibold mb-5">
              Silahkan Login Terlebih Dahulu untuk Mengirim Laporan
            </div>
            <n-button type="primary" @click="show = true"> Login </n-button>
          </n-card>
        </template>
      </div>
    </div>
  </section>
  <div class="max-w-screen-xl mx-auto pb-5 px-3">
    <div class="font-semibold py-5">Foto Dokumentasi</div>
    <div class="grid grid-cols-3 md:w-1/2 gap-5 pr-5">
      <n-image
        v-for="item in poto?.data"
        :src="item.url_foto"
        class="object-cover"
        object-fit="cover"
        :img-props="{ class: 'object-cover w-full' }"
      />
    </div>
  </div>
  <div class="py-10">
    <div class="text-center text-lg mb-5 font-bold">
      Daftar Nomor Penting (Darurat) Di Lingkungan Universitas Sebelas Maret
    </div>
    <n-table class="max-w-screen-lg mx-auto">
      <n-tr>
        <td rowspan="2">Ambulance</td>
        <td>PMI Surakarta</td>
        <td>118 atau 0271-646505</td>
      </n-tr>
      <n-tr>
        <td>IKA Universitas Sebelas Maret</td>
        <td>0858-7777-4788</td>
      </n-tr>
      <n-tr>
        <td rowspan="4">Rumah Sakit</td>
        <td>Dr. Moewardi</td>
        <td>0271-634634</td>
      </n-tr>
      <n-tr>
        <td>RSUD Surakarta</td>
        <td>0271-715500</td>
      </n-tr>
      <n-tr>
        <td>Ortopedi</td>
        <td>0271-714458</td>
      </n-tr>
      <n-tr>
        <td>Dr. Oen Kandang Sapi</td>
        <td>0271-643139</td>
      </n-tr>
      <n-tr>
        <td rowspan="3">Pemadam Kebakaran</td>
        <td></td>
        <td>113 atau 0271-655722</td>
      </n-tr>
      <n-tr>
        <td>Surakarta</td>
        <td>0271-710900</td>
      </n-tr>
      <n-tr>
        <td></td>
        <td>0271-593113</td>
      </n-tr>
      <n-tr>
        <td rowspan="1">Search And Rescue (SAR)</td>
        <td>Universitas Sebelas Maret</td>
        <td>0271-660880</td>
      </n-tr>
      <n-tr>
        <td rowspan="3">Polisi</td>
        <td>Polrestabes Surakarta</td>
        <td>0271-712600</td>
      </n-tr>
      <n-tr>
        <td>Satlantas Poltabes</td>
        <td>0271-656069</td>
      </n-tr>
      <n-tr>
        <td>Polsek Jebres</td>
        <td>0271-644506</td>
      </n-tr>
      <n-tr>
        <td rowspan="2">Lain-lain</td>
        <td>PLN</td>
        <td>0271-722091</td>
      </n-tr>
      <n-tr>
        <td>Derek Pemda</td>
        <td>0822-2100-0059</td>
      </n-tr>
    </n-table>
  </div>
</template>
