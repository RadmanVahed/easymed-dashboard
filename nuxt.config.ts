// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: false },
  modules: ['@nuxt/ui', '@nuxt/icon'],
  css:['./assets/css/style.css'],
   ssr: false,
   app: {
    baseURL: '/easymed-dashboard/',
    buildAssetsDir: 'assets/',
  },
  nitro: {
    prerender: {
      routes: ['/']
    }
  }
})