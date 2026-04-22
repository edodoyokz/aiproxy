import type { IRuntimeAdapter } from './adapter'
import { createCLIProxyAPIPlusAdapterFromEnv } from './cliproxyapiplus-adapter'
import { MockRuntimeAdapter } from './mock-adapter'

let adapterInstance: IRuntimeAdapter | null = null

export function getRuntimeAdapter(): IRuntimeAdapter {
  if (!adapterInstance) {
    const mode = process.env.RUNTIME_MODE || 'mock'

    if (mode === 'cliproxyapiplus') {
      adapterInstance = createCLIProxyAPIPlusAdapterFromEnv()
    } else {
      adapterInstance = new MockRuntimeAdapter()
    }
  }

  return adapterInstance
}

export function resetRuntimeAdapter(): void {
  adapterInstance = null
}
