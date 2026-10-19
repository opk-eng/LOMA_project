/**
 * Playwright global setup: run before any test file.
 *
 * Ensures the isolated E2E database (test.db) is re-created and seeded so the
 * suite is deterministic regardless of how Playwright is invoked. Delegates to
 * the same logic as `npm run test:e2e:setup`.
 */
import { execSync } from 'node:child_process'
import { resolve } from 'node:path'

export default function globalSetup() {
  const root = resolve(__dirname, '..', '..')
  execSync('node scripts/e2e-setup.mjs', {
    cwd: root,
    stdio: 'inherit',
  })
}

export function globalTeardown() {
  // No-op teardown — leaving test.db in place lets a developer inspect the
  // final state. `globalSetup` re-creates it on every run.
}
