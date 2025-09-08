// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: false },
  modules: ['@nuxt/ui', '@nuxt/icon' , '@pinia/nuxt'],
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
  },
  runtimeConfig: {
    public: {
      apiBaseUrl: 'https://intelligent-colden-d2cajkshs.liara.run/api/'
    }
  },
})