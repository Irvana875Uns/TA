<route lang="yaml">
  meta:
    layout: main.layout
</route>

<script setup lang="ts">
import { Bar, Doughnut } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, DoughnutController, ArcElement, type ChartOptions, type ChartData } from 'chart.js';
import { DateTime } from 'luxon';
import { useHttp } from '@/composables/http/http';
import { computed } from 'vue';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);
ChartJS.register(DoughnutController, ArcElement, Tooltip, Legend);

// Fetch data for the bar chart
const { data: barChartData, isLoading: isLoadingBarChart } = useHttp<R<{ month: string, total_transaction: string }[]>>('/chart');

// Fetch data for the doughnut chart
const { data: doughnutChartData, isLoading: isLoadingDoughnutChart } = useHttp<R<{ tipe_pengaduan: string | null, count: string }[]>>('/chart-tipe');

// Bar chart options and data
const barChartOptions: ChartOptions<'bar'> = {
  responsive: true,
  maintainAspectRatio: true,
};

const barChartDataComputed = computed<ChartData<'bar'>>(() => ({
  labels: barChartData.value?.data?.map((v) => DateTime.fromISO(v.month).toFormat('MMMM')) || [],
  datasets: [
    {
      label: 'Laporan',
      data: barChartData.value?.data?.map((v) => +v.total_transaction) || [],
      backgroundColor: '#0fb2a9',
    },
  ],
}));

// Doughnut chart options and data
const doughnutChartOptions: ChartOptions<'doughnut'> = {
  responsive: true,
  maintainAspectRatio: true,
};

const doughnutChartDataComputed = computed<ChartData<'doughnut'>>(() => {
  const data = doughnutChartData.value?.data || [];
  return {
    labels: data.map((item) => item.tipe_pengaduan || 'Unknown'), // Ganti null dengan 'Unknown'
    datasets: [
      {
        data: data.map((item) => +item.count),
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#FF5733',
          '#C70039'
        ],
      },
    ],
  };
});
</script>

<template>
  <div class="max-w-screen-xl mx-auto space-y-5">
    <div class="text-center font-semibold text-2xl">
      Grafik Laporan Kejadian di Lingkungan UNS Berdasarkan Laporan Masuk
    </div>

    <div class="chart-container">
      <Bar
        v-if="!isLoadingBarChart"
        :style="{ height: '400px', width: '100%' }"
        :options="barChartOptions"
        :data="barChartDataComputed"
      />
      <div v-else>Loading bar chart...</div>
    </div>

    <div class="text-center text-2xl font-semibold">
      Grafik Laporan Kejadian di Lingkungan UNS Berdasarkan Tipe Pengaduan
    </div>

    <div class="chart-container">
      <Doughnut
        v-if="!isLoadingDoughnutChart"
        :style="{ height: '400px', width: '400px' }"
        :options="doughnutChartOptions"
        :data="doughnutChartDataComputed"
      />
      <div v-else>Loading doughnut chart...</div>
    </div>
  </div>
</template>

<style scoped>
.chart-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .chart-container {
    flex-direction: column;
  }
}
</style>
