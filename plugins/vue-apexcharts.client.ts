import { defineNuxtPlugin } from '#app'
import VueApexCharts from 'vue3-apexcharts'

export default defineNuxtPlugin((nuxtApp) => {
  // globally register <apexchart> component
  nuxtApp.vueApp.component('apexchart', VueApexCharts)
})
