/**
 * Shared mocks for Vitest unit tests.
 *
 * Imported at the top of each unit test file so the mocks apply to that
 * test file (vitest hoists vi.mock) before the module being tested is
 * evaluated.
 */
import { vi, beforeAll, afterAll } from 'vitest'

// next/navigation
vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

// next/cache
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
  cache: vi.fn(),
}))

// next/headers (cookies)
vi.mock('next/headers', () => ({
  cookies: () => ({
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
  }),
}))

// Prisma client
vi.mock('@/lib/db', () => ({
  default: {
    category: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    menuItem: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    mediaAsset: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
    businessSettings: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    adminUser: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
    },
    auditLog: {
      create: vi.fn(),
    },
    $transaction: vi.fn(),
    $queryRaw: vi.fn(),
    $disconnect: vi.fn(),
  },
}))

// bcryptjs
vi.mock('bcryptjs', () => {
  const m = { hash: vi.fn().mockResolvedValue('hashed'), compare: vi.fn().mockResolvedValue(true) }
  return { default: m, ...m }
})

// jose
vi.mock('jose', () => ({
  SignJWT: vi.fn().mockImplementation(() => ({
    setProtectedHeader: vi.fn().mockReturnThis(),
    setIssuedAt: vi.fn().mockReturnThis(),
    setExpirationTime: vi.fn().mockReturnThis(),
    sign: vi.fn().mockResolvedValue('mock-jwt-token'),
  })),
  jwtVerify: vi.fn().mockResolvedValue({
    payload: { userId: 'test-user', email: 'test@test.com', role: 'admin' },
  }),
}))

// Global test utilities
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Suppress ReactDOM.render warnings in jsdom tests
const originalError = console.error
beforeAll(() => {
  console.error = (...args: unknown[]) => {
    if ((args[0] as string)?.includes?.('Warning: ReactDOM.render is no longer supported')) return
    originalError.call(console, ...args)
  }
})
afterAll(() => {
  console.error = originalError
})
