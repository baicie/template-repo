import { invoke } from '@tauri-apps/api/core'
import { open } from '@tauri-apps/plugin-shell'

const api = {
  openExternal: (url: string) => open(url)
}

invoke('plugin:shell|open', { path: url }).catch(console.error)

export type { }
export { api }
