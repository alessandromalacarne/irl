// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  nitro: {
    preset: 'aws-lambda',
  },

  runtimeConfig: {
    public: {
      apiUrl: process.env.API_URL ?? 'http://localhost:3000/'
    }
  },

  compatibilityDate: '2025-07-15',
  devtools: { enabled: true }
})
