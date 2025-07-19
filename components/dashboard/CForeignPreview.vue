<template>
  <ClientOnly>
    <apexchart
      type="radialBar"
      :options="options"
      :series="series"
      :height="350"
    />
  </ClientOnly>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { ApexOptions } from 'apexcharts'

const series = ref<number[]>([75])

const options = ref<ApexOptions>({
  chart: {
    type: 'radialBar',
    height: 350,
    toolbar: { show: true }
  },
  plotOptions: {
    radialBar: {
      startAngle: -135,
      endAngle: 225,
      hollow: {
        margin: 0,
        size: '70%',
        background: '#fff',
        dropShadow: {
          enabled: true,
          top: 3,
          left: 0,
          blur: 4,
          opacity: 0.5
        }
      },
      track: {
        background: '#fff',
        strokeWidth: '67%',
        dropShadow: {
          enabled: true,
          top: -3,
          left: 0,
          blur: 4,
          opacity: 0.7
        }
      },
      dataLabels: {
        show: true,
        name: {
          offsetY: -10,
          show: true,
          color: '#888',
          fontSize: '17px'
        },
        value: {
          formatter: (val: any) => parseInt(val, 10).toString(),
          color: '#111',
          fontSize: '36px',
          show: true
        }
      }
    }
  },
  fill: {
    type: 'gradient',
    gradient: {
      shade: 'dark',
      type: 'horizontal',
      shadeIntensity: 0.5,
      gradientToColors: ['#ABE5A1'],
      inverseColors: true,
      opacityFrom: 1,
      opacityTo: 1,
      stops: [0, 100]
    }
  },
  stroke: {
    lineCap: 'round'
  },
  labels: ['Percent']
})
</script>
