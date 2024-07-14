<route lang="yaml">
meta:
  layout: default.layout
</route>

<script setup lang="ts">
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, type ChartOptions, type ChartData, } from 'chart.js'
import { DateTime, Info } from 'luxon'
import { pageSelect } from '@/constants/pages';
import type { RowData } from 'naive-ui/es/data-table/src/interface';
import { useHttp } from '@/composables/http/http';
import { REPORT_STATUSES } from '@/constants/report';
import { NImage } from 'naive-ui';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)


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
}

const filter = ref<{
  status?: string
  q?: string
  type?: string
}>({
})

const { data: report } = useHttp<R<Data>>('public/my-report', {
  params: filter
})

const { data: chart, isLoading: isLoadingChart } = useHttp<R<{ month: string, total_transaction: string }[]>>('/chart')
const { data: reportType, isLoading: isLoadingReportType } = useHttp<R<{ id: string, name: string }[]>>('/jenis-laporan')
const reportTypeOptions = computed(() => {
  return reportType.value?.data.map((v) => {
    return { label: v.name, value: v.id }
  })
})

const chartOptions: ChartOptions<'bar'> = {
  responsive: true,
  maintainAspectRatio: true
}

const chartData = computed<ChartData<'bar'>>(() => ({
  labels: chart.value?.data?.map((v) => DateTime.fromISO(v.month).toFormat('MMMM')) || [],
  datasets: [
    {
      label: 'Laporan', data: chart.value?.data?.map((v) => +v.total_transaction) || [], backgroundColor: '#0fb2a9',
    },
  ]
}))

const createColumns = () => {
  return [
    {
      title: 'Tanggal dan Waktu',
      key: 'created_at',
      render: (v: { tanggal_laporan: string }) => DateTime.fromISO(v.tanggal_laporan).toLocaleString(DateTime.DATETIME_MED_WITH_WEEKDAY)
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
      key: 'status',
    },
    {
      title: 'Deskripsi',
      key: 'keterangan_pelapor',
    },
    {
      title: 'Photo',
      key: 'photo',
      render: (v: { url_foto: string }) => h(NImage, {
        src: v.url_foto,
        height: 30,
        style: {
          height: '30px'
        }
      })
    },
  ]
}

const columns = createColumns()

const data = computed(() => {
  return report.value?.data
})

const reportStatusOpt = REPORT_STATUSES.map((v) => ({ label: v, value: v }))
</script>

<template>
  <div class="max-w-screen-xl mx-auto space-y-5">
    <div class="text-center font-semibold text-2xl">
      Data Laporan Kejadian di Lingkungan UNS
      Data Tahun 2024
    </div>

    <div>
      <Bar style="height: 400px; width: 100%;" :options="chartOptions" :data="chartData" />
    </div>

    <div>
      <div class="text-center text-2xl font-semibold">
        Data Laporan Kejadian di Lingkungan UNS
        Data Tahun 2024
      </div>
    </div>
    <div>
      <div class="flex flex-col md:flex-row gap-5 mb-10">
        <n-select v-model:value="filter.status" placeholder="Status" :options="reportStatusOpt" clearable></n-select>
        <n-select v-model:value="filter.type" placeholder="Tipe Pengaduan" :options="reportTypeOptions" clearable></n-select>
        <n-input v-model:value="filter.q" placeholder="Cari"></n-input>
      </div>
      <div class="w-full whitespace-pre overflow-auto">
        <n-data-table :columns="columns" :data="data as any" />
      </div>
    </div>
  </div>
</template>
