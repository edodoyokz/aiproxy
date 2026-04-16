/**
 * Runtime Integration Module
 * 
 * Central export point for runtime adapter and related utilities.
 * Switch between mock and real implementation here.
 */

import { IRuntimeAdapter } from './adapter'
import { MockRuntimeAdapter } from './mock-adapter'

/**
 * TODO: Replace with real CLIProxyAPIPlus adapter when ready
 * 
 * To integrate real CLIProxyAPIPlus client:
 * 1. Create CLIProxyAPIPlusAdapter class implementing IRuntimeAdapter
 * 2. Import it here: import { CLIProxyAPIPlusAdapter } from './cliproxyapiplus-adapter'
 * 3. Update getRuntimeAdapter() to return new CLIProxyAPIPlusAdapter()
 * 4. Configure environment variables for API credentials
 * 
 * Example real adapter initialization:
 * ```typescript
 * export function getRuntimeAdapter(): IRuntimeAdapter {
 *   const apiKey = process.env.CLIPROXYAPIPLUS_API_KEY
 *   const apiUrl = process.env.CLIPROXYAPIPLUS_API_URL || 'https://api.cliproxyapiplus.io'
 *   
 *   if (!apiKey) {
 *     throw new Error('CLIPROXYAPIPLUS_API_KEY environment variable is required')
 *   }
 *   
 *   return new CLIProxyAPIPlusAdapter({
 *     apiKey,
 *     apiUrl,
 *     timeout: 30000,
 *   })
 * }
 * ```
 */

let adapterInstance: IRuntimeAdapter | null = null

/**
 * Get singleton runtime adapter instance
 * Currently returns mock implementation
 */
export function getRuntimeAdapter(): IRuntimeAdapter {
  if (!adapterInstance) {
    // TODO: Switch to real adapter based on environment
    // if (process.env.NODE_ENV === 'production') {
    //   adapterInstance = new CLIProxyAPIPlusAdapter(...)
    // } else {
    //   adapterInstance = new MockRuntimeAdapter()
    // }
    
    adapterInstance = new MockRuntimeAdapter()
  }
  
  return adapterInstance
}

/**
 * Reset adapter instance (useful for testing)
 */
export function resetRuntimeAdapter(): void {
  adapterInstance = null
}

// Re-export types and interfaces
export * from './types'
export * from './adapter'
export { MockRuntimeAdapter } from './mock-adapter'
