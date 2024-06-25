<route lang="yaml">
meta:
  layout: main.layout
</route>

<script setup lang="ts">
import { pageSelect } from '@/constants/pages'
import type { RowData } from 'naive-ui/es/data-table/src/interface'
import { DateTime } from 'luxon'
import { useHttp, useHttpMutation } from '@/composables/http/http'
import { REPORT_STATUSES } from '@/constants/report'
import { NImage, useMessage } from 'naive-ui'
import L, { Marker } from 'leaflet'
import 'leaflet/dist/leaflet.css'

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
}

const params = ref<{
  page?: number
  size?: number
  status?: string
  q?: string
  type?: string
}>({})

const {
  data: report,
  isLoading,
  refetch
} = useHttp<R<Data>>('/laporan', {
  params
})

const message = useMessage()
const showApproval = ref(false)
const adminId = ref<string>()
const showReview = ref<boolean>(false)
const selectedId = ref<string>()
const router = useRouter()

const { data: detail } = useHttp<R<Data>>(
  computed(() => `/laporan/${selectedId.value}`),
  {
    queryOptions: {
      queryKey: ['detail', selectedId.value],
      enabled: computed(() => !!selectedId.value)
    }
  }
)

const { data: reportType, isLoading: isLoadingReportType } =
  useHttp<R<{ id: string; name: string }[]>>('/jenis-laporan')
const reportTypeOptions = computed(() => {
  return reportType.value?.data.map((v) => {
    return { label: v.name, value: v.id }
  })
})

const { mutate: approval, isPending } = useHttpMutation(
  computed(() => `/laporan/acc/${selectedId.value}`),
  {
    method: 'POST',
    queryOptions: {
      onSuccess: (data) => {
        refetch()
        showApproval.value = false
        showReview.value = false
        message.success('Berhasil mengubah status')
      }
    }
  }
)

const onApprove = () => {
  approval({
    status: 'terima',
    admin_unit_id: adminId.value
  })
}
const onReject = () => {
  approval({
    status: 'tolak'
  })
}

const createColumns = (): { key: string | keyof Data; title: string }[] & RowData[] => {
  return [
    {
      title: 'Tanggal dan Waktu',
      key: 'created_at',
      render: (v: { tanggal_laporan: string }) =>
        DateTime.fromISO(v.tanggal_laporan).toLocaleString(DateTime.DATETIME_MED_WITH_WEEKDAY)
    },
    {
      title: 'Nama Pelapor',
      key: 'email_pelapor'
    },
    {
      title: 'Fakultas',
      key: 'fakultas_name'
    },
    {
      title: 'Tipe Pengaduan',
      key: 'jenis_laporan'
    },
    {
      title: 'Status',
      key: 'status'
    },
    {
      title: 'Deskripsi',
      key: 'keterangan_pelapor'
    },
    {
      title: 'Photo',
      key: 'photo',
      render: (v: { url_foto: string }) =>
        h(NImage, {
          src: v.url_foto,
          height: 30,
          style: {
            height: '30px'
          }
        })
    }
  ]
}

const columns = createColumns()

const data = computed(() => {
  return report.value?.data
})

watchEffect(() => {
  if (showReview.value && detail.value?.data) {
    setTimeout(() => {
      var map = L.map('map').setView([+detail.value?.data.lat, +detail.value?.data.long], 13)
      L.Marker.extend({
        iconUrl: icon,
        shadowUrl: iconShadow
      })

      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map)

      L.marker([+detail.value?.data.lat, +detail.value?.data.long])
        .addTo(map)
        .bindPopup('Lokasi pelaporan.')
        .openPopup()
    }, 500)
  }
})

const reportStatusOpt = REPORT_STATUSES.map((v) => ({ label: v, value: v }))

const { data: user } = useHttp<R<{ id: string; name: string }[]>>('/user')

const users = computed(() => {
  return user.value?.data.map((v) => {
    return { label: v.name, value: v.id }
  })
})

const { data: profile } = useHttp('/profile')
</script>

<template>
  <div class="mb-5">
    <n-h2>
      Hai {{ profile?.data?.name }}
    </n-h2>
    <p> Selamat Datang Halaman Laporan Sistem SIGAP </p>
  </div>
  <div>
    <div class="flex flex-col md:flex-row gap-5 mb-10">
      <n-select
        v-model:value="params.status"
        placeholder="Status"
        :options="reportStatusOpt"
        clearable
      ></n-select>
      <n-select
        v-model:value="params.type"
        placeholder="Tipe Pengaduan"
        :options="reportTypeOptions"
        clearable
      ></n-select>
      <n-input v-model:value="params.q" placeholder="Cari"></n-input>
    </div>
    <div class="w-full whitespace-pre overflow-auto">
      <n-data-table :loading="isLoading" :columns="columns" :data="data as any" />
    </div>
    <div class="flex justify-between mt-5">
      <div class="w-full items-center flex">
        Showing
        <div class="w-20">
          <n-select v-model:value="params.size" :options="pageSelect"></n-select>
        </div>
        <div>of {{ report?.filter?.total_data }} pages</div>
      </div>
      <div class="flex">
        <div class="ml-5">Page</div>
        <n-pagination v-model:page="params.page"></n-pagination>
      </div>
    </div>
  </div>
  <n-modal v-model:show="showReview" preset="card" class="max-w-xl">
    <n-table>
      <n-tr>
        <n-td> Nama </n-td>
        <n-td>
          {{ detail?.data.nama_pelapor }}
        </n-td>
      </n-tr>
      <n-tr>
        <n-td> Email </n-td>
        <n-td>
          {{ detail?.data?.email_pelapor }}
        </n-td>
      </n-tr>
      <n-tr>
        <n-td> Nomor Handphone </n-td>
        <n-td>
          {{ detail?.data?.no_hp }}
        </n-td>
      </n-tr>
      <n-tr>
        <n-td> Fakultas </n-td>
        <n-td>
          {{ detail?.data.fakultas_name }}
        </n-td>
      </n-tr>
      <n-tr>
        <n-td> Jenis Laporan </n-td>
        <n-td>
          {{ detail?.data.jenis_laporan }}
        </n-td>
      </n-tr>
      <n-tr>
        <n-td> Tanggal </n-td>
        <n-td v-if="detail?.data.created_at">
          {{
            DateTime.fromISO(detail?.data.created_at as string).toLocaleString(
              DateTime.DATE_MED_WITH_WEEKDAY
            )
          }}
        </n-td>
      </n-tr>
      <n-tr>
        <n-td> Deskripsi </n-td>
        <n-td>
          {{ detail?.data.keterangan_pelapor }}
        </n-td>
      </n-tr>
      <n-tr>
        <n-td> Lokasi </n-td>
        <n-td>
          <div id="map" class="w-full h-96"></div>
        </n-td>
      </n-tr>
      <n-tr>
        <n-td> Foto </n-td>
        <n-td>
          <n-image class="h-10" :src="detail?.data.url_foto"></n-image>
        </n-td>
      </n-tr>
    </n-table>
    <n-form class="w-full">
      <n-form-item label="Admin Unit">
        <n-select v-model:value="adminId" :options="users" placeholder="Pilih Admin Unit" />
      </n-form-item>
      <div class="flex justify-center gap-3">
        <n-button type="success" :loading="isPending" @click="onApprove"> Terima </n-button>
        <n-button type="error" :loading="isPending" @click="onReject"> Tolak </n-button>
      </div>
    </n-form>
  </n-modal>
  <n-modal v-model:show="showApproval" preset="card" class="max-w-lg">
    <n-form class="w-full">
      <n-form-item label="Admin Unit">
        <n-select v-model:value="adminId" :options="users" placeholder="Pilih Admin Unit" />
      </n-form-item>
      <div class="flex justify-center gap-3">
        <n-button type="success" :loading="isPending" @click="onApprove"> Terima </n-button>
        <n-button type="error" :loading="isPending" @click="onReject"> Tolak </n-button>
      </div>
    </n-form>
  </n-modal>
</template>
