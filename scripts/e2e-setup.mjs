/**
 * Prepares the isolated test database used by Playwright E2E tests.
 *
 * 1. Pushes the Prisma schema to `test.db` (SQLite, co-located with dev.db).
 * 2. Seeds the DB with the business settings, default admin account and
 *    development-only sample menu data (identical to the normal dev workflow).
 *
 * The E2E webServer in playwright.config.ts sets `DATABASE_URL=file:./test.db`
 * for the spawned Next.js process, so the schema is already in place by the
 * time the app starts.
 */
import { execSync } from 'node:child_process'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { unlinkSync, existsSync } from 'node:fs'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const TEST_DB = 'file:./test.db'

const env = { ...process.env, DATABASE_URL: TEST_DB }

// Start from a clean database so test runs are deterministic (E2E tests
// create categories/items with fixed slugs — leftovers would break re-runs).
if (existsSync(resolve(ROOT, 'test.db'))) {
  unlinkSync(resolve(ROOT, 'test.db'))
}

console.log('Setting up isolated E2E database…')
try {
  execSync('npx prisma db push --skip-generate', {
    cwd: ROOT,
    stdio: 'inherit',
    env,
  })
  console.log('Schema pushed to test.db.')
} catch (err) {
  console.error('Failed to push schema:', err.message)
  process.exit(1)
}

try {
  execSync('npx tsx prisma/seed.ts', {
    cwd: ROOT,
    stdio: 'inherit',
    env,
  })
  console.log('Database seeded (idempotent).')
} catch (err) {
  console.error('Failed to seed database:', err.message)
  process.exit(1)
}
