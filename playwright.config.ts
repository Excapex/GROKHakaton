import { defineConfig } from '@playwright/test'

// E2E pokriva petlju upload -> nalaz -> odluka -> izlaz -> revizija (issue #15).
// Namerno nije u CI-ju dok testovi ne postoje — vidi README.
export default defineConfig({
  testDir: 'e2e',
  use: { baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:5173' },
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : { command: 'npm run dev', url: 'http://localhost:5173', reuseExistingServer: true },
})
