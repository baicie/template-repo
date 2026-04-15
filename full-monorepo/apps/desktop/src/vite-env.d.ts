/// <reference types="vite/client" />

interface Window {
  api: typeof import('./preload/index').api
}
