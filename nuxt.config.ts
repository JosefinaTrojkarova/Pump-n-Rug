// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  future: { compatibilityVersion: 4 },
  modules: ['@nuxt/eslint'],

  css: [
    '~/assets/reset.css',
    '~/assets/global.scss',
  ],

  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler',
          // additionalData: '@use "~/assets/_colors.scss" as *;'
        },
      },
    }
  },

  devtools: { enabled: true }
})