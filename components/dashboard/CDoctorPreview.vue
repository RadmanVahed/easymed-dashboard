<template>
  <div>
    <h1 class="flex justify-end text-lg mb-2">نمودار اپ پزشک</h1>
    <apexchart ref="chartRef" type="radialBar" :options="options" :series="series" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { ApexOptions } from 'apexcharts'

const colorMode = useColorMode()

const themeMode = computed<'light' | 'dark'>(() =>
  colorMode.value === 'dark' ? 'dark' : 'light'
)

const DoctorCount = ref(0)
const LoginCount = ref(0)
const loading = ref(false)
const API_BASE = 'https://easymed-doctor-app.radmanvahed.workers.dev'

const series = ref([0, 0])

// هر دو متغیر رو watch کن
watch([DoctorCount, LoginCount], ([newDoctorCount, newLoginCount]) => {
  series.value = [
    newDoctorCount,
    newLoginCount,
  ]
}, { immediate: true })

const fetchDoctorsCount = async () => {
  loading.value = true
  try {
    const response = await fetch(`${API_BASE}/users-count`, {
      method: 'GET',
    });
    const result = await response.json();
    console.log(result);
    DoctorCount.value = result.totalUsers
  } catch (error) {
    console.error('Error fetching data:', error);
  } finally {
    loading.value = false
  }
}

const fetchLoginCount = async () => {
  try {
    loading.value = true
    const response = await fetch(`${API_BASE}/daily-logins-count`, {
      method: 'GET'
    })
    const result = await response.json()
    LoginCount.value = result.totalLogins
  } catch (error) {
    console.error('Error fetching login count:', error);
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchDoctorsCount()
  fetchLoginCount()
})

const options = computed<ApexOptions>(() => ({
  chart: {
    height: 390,
    type: 'radialBar',
    background: 'transparent'
  },
  theme: {
    mode: themeMode.value
  },
  plotOptions: {
    radialBar: {
      offsetY: 0,
      startAngle: 0,
      endAngle: 270,
      hollow: {
        margin: 5,
        size: '30%',
        background: 'transparent',
      },
      dataLabels: {
        name: {
          show: false,
        },
        value: {
          show: false,
        }
      },
      barLabels: {
        enabled: true,
        useSeriesColors: true,
        offsetX: -8,
        fontSize: '16px',
        formatter: function (seriesName: string, opts: any) {
          return seriesName + ":  " + opts.w.globals.series[opts.seriesIndex]
        },
      },
    }
  },
  // '#39539E', '#0077B5'
  colors: ['#1ab7ea', '#0084ff'],
  labels: ['تعداد پزشکان', 'تعداد ورودهای امروز'],
  responsive: [{
    breakpoint: 480,
    options: {
      legend: {
        show: false
      }
    }
  }]
}))
</script>
