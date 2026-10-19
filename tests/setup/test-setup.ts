/**
 * Global Vitest setup.
 *
 * Applied to every test file. Sets a dedicated integration database URL so
 * that tests using a real PrismaClient are isolated from the development
 * database. Unit tests import tests/setup/unit-mocks.ts to get module
 * mocks (Prisma, bcrypt, jose, next/navigation, etc).
 */
process.env.DATABASE_URL = 'file:./integration.db'

// jsdom polyfills
if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
}
