import type { NextConfig } from 'next'
import path from 'path'

const POLYFILL_PATH = './src/lib/mutation-observer-polyfill.ts'

const nextConfig: NextConfig = {
  webpack: (config) => {
    const originalEntry = config.entry

    config.entry = async () => {
      const entries = await originalEntry()

      // Ensure the MutationObserver guard is the first thing that runs in the client bundle
      const mainApp = entries['main-app']
      if (Array.isArray(mainApp) && !mainApp.includes(POLYFILL_PATH)) {
        entries['main-app'] = [POLYFILL_PATH, ...mainApp]
      }

      return entries
    }

    // Resolve path for server-side type checking, keeps IDE happy
    config.resolve.alias = {
      ...config.resolve.alias,
      '@mutation-polyfill': path.resolve(__dirname, POLYFILL_PATH),
    }

    return config
  },
}

export default nextConfig
