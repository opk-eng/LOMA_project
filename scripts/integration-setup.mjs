/**
 * Prepares the isolated integration database for Vitest integration tests.
 *
 * 1. Deletes the existing test DB so schema pushes are deterministic.
 * 2. Pushes the Prisma schema to `integration.db` (SQLite).
 *
 * Run via `npm run test:integration:setup` or as the `pretest` hook.
 * Integration tests connect via `process.env.DATABASE_URL` (set in
 * tests/setup/test-setup.ts to file:./integration.db).
 */
import { execSync } from 'node:child_process'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { unlinkSync, existsSync } from 'node:fs'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const TEST_DB = 'file:./integration.db'

console.log('Setting up integration database...')

// Delete existing DB to guarantee a clean state.
if (existsSync(resolve(ROOT, 'integration.db'))) {
  unlinkSync(resolve(ROOT, 'integration.db'))
}

try {
  execSync('npx prisma db push --skip-generate', {
    cwd: ROOT,
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: TEST_DB },
  })
  console.log('Schema pushed to integration.db.')
} catch (err) {
  console.error('Failed to push schema:', err.message)
  process.exit(1)
}
