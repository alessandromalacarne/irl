// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  nitro: {
    preset: 'aws-lambda',
  },

  runtimeConfig: {
    apiUrl: process.env.API_URL
  },

  compatibilityDate: '2025-07-15',
  devtools: { enabled: true }
})
