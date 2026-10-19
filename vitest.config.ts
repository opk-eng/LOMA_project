import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    // Use the real Node runtime (not jsdom) so that:
    //  - globalThis.crypto / TextEncoder stay in the Node realm, which
    //    jose's HS256 signer expects (jsdom's realm causes an
    //    "invalid key type" instanceof failure).
    //  - Prisma's SQLite connection works directly against the filesystem.
    environment: 'node',
    // Integration tests share a single SQLite file; run files one at a time
    // so one file's cleanupAll() never wipes rows out from under another.
    pool: 'forks',
    fileParallelism: false,
    setupFiles: ['./tests/setup/test-setup.ts'],
    include: ['tests/unit/**/*.test.ts', 'tests/integration/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 60,
        statements: 70,
      },
    },
  },
})