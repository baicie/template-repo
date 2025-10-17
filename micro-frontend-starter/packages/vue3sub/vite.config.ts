import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

import qiankun from "vite-plugin-qiankun";

const useDevMode = true

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    // useDevMode = true 时不开启热更新
    vue(),
    qiankun('vue3sub', {
      useDevMode
    })
  ],
  base: '/',
  server: {
    port: 7108,
    cors: true,
  },
})
