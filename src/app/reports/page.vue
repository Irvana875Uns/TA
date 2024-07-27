<route lang="yaml">
meta:
  layout: main.layout
</route>

<script setup lang="ts">
import L, { Marker } from 'leaflet'
import 'leaflet/dist/leaflet.css'
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
const router = useRouter()

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
}>('/laporan/add-laporan-adminunit', {
  method: 'POST',
  queryOptions: {
    onSuccess(data, variables, context) {
      router.push('/dashboard')
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
            <n-text style="font-size: 16px"> Click or drag a file to this area to upload </n-text>
            <n-p depth="3" style="margin: 8px 0 0 0">
              Strictly prohibit from uploading sensitive information. For example, your bank card
              PIN or your credit card expiry date.
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
    <n-button attr-type="submit"  type="primary">
      Kirim Laporan
    </n-button>
  </n-form>
</template>
