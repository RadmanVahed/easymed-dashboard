<template>
  <div>
    <h1 class="flex justify-end text-lg mb-2">نمودار ورود اپ پزشک</h1>
    <!-- bind a ref so we can call its updateOptions() -->
    <apexchart
      ref="chartRef"
      type="area"
      :options="options"
      :series="series"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { ApexOptions } from 'apexcharts'

const colorMode = useColorMode()

// Only ever 'light' or 'dark'
const themeMode = computed<'light' | 'dark'>(() =>
  colorMode.value === 'dark' ? 'dark' : 'light'
)

const series = ref([{
  name: 'series1',
  data: [31, 40, 28, 51, 42, 109, 100]
}])

const options = computed<ApexOptions>(() => ({
  chart: {
    type: 'area',
    toolbar: { show: false },
    background: 'transparent'
  },
  theme: {
    // now themeMode.value is typed correctly
    mode: themeMode.value
  },
  dataLabels: { enabled: false },
  grid: { show: false },
  stroke: { curve: 'smooth' },
  xaxis: {
    type: 'datetime',
    categories: [
    '2018-09-19T00:00:00.000Z',
      '2018-09-20T00:00:00.000Z',
      '2018-09-21T00:00:00.000Z',
      '2018-09-22T00:00:00.000Z',
      '2018-09-23T00:00:00.000Z',
      '2018-09-24T00:00:00.000Z',
      '2018-09-25T00:00:00.000Z'
    ],
    labels: {
      style: {
        colors: themeMode.value === 'dark' ? '#FFF' : '#000'
      }
    }
  },
  tooltip: {
    x: { format: 'dd/MM/yy' }
  }
}))
</script>
