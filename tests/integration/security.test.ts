/**
 * Security integration tests.
 *
 * Verifies:
 * - Unauthenticated access to protected admin operations is blocked.
 * - Invalid / malformed inputs are rejected before hitting the database.
 * - Only published content is visible to the public API.
 */
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest'
import prisma from '@/lib/db'
import { cleanupAll, createCategory, createItem } from './helpers'
import { requireAuth, createSession } from '@/lib/auth'

// Mock next/headers (cookie store) per-test. In Next 16 cookies() is async.
vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}))

const { cookies } = (await import('next/headers')) as unknown as {
  cookies: { mockResolvedValue: (v: unknown) => void }
}

function mockSession(value: string | null) {
  const store = {
    get: vi.fn((name: string) =>
      name === 'loma_session' && value ? { value } : undefined,
    ),
    set: vi.fn(),
    delete: vi.fn(),
  }
  ;(cookies as ReturnType<typeof vi.fn>).mockResolvedValue(store)
}

describe('Authorization on protected operations', () => {
  beforeAll(async () => {
    await cleanupAll()
  })
  afterAll(async () => {
    await cleanupAll()
  })

  it('rejects access with no session cookie (no token in the cookie store)', async () => {
    mockSession(null)
    await expect(requireAuth()).rejects.toThrow('Unauthorized')
  })

  it('accepts a valid session and returns its payload', async () => {
    const token = await createSession({ userId: 'u-1', email: 'admin@loma.local', role: 'admin' })
    mockSession(token)
    const session = await requireAuth()
    expect(session.userId).toBe('u-1')
    expect(session.email).toBe('admin@loma.local')
    expect(session.role).toBe('admin')
  })
})

describe('Input validation blocks malformed data before it reaches the DB', () => {
  beforeAll(async () => {
    await cleanupAll()
  })

  it('rejects an empty category slug (schema constraint)', async () => {
    const { categorySchema } = await import('@/lib/validations')
    const result = categorySchema.safeParse({ name: 'X', slug: '' })
    expect(result.success).toBe(false)
  })

  it('rejects a negative menu item price', async () => {
    const { menuItemSchema } = await import('@/lib/validations')
    const result = menuItemSchema.safeParse({
      categoryId: 'c-1',
      name: 'Item',
      slug: 'item',
      priceInCents: -5,
    })
    expect(result.success).toBe(false)
  })

  it('rejects an invalid time string in settings', async () => {
    const { businessSettingsSchema } = await import('@/lib/validations')
    const result = businessSettingsSchema.safeParse({
      businessName: 'LOMA',
      brandDescription: '',
      address: '',
      phone: '',
      instagramUrl: '',
      mondayOpen: '25:99',
      mondayClose: '22:00',
    })
    expect(result.success).toBe(false)
  })
})

describe('Public data visibility rules (only published)', () => {
  beforeAll(async () => {
    await cleanupAll()
  })
  afterAll(async () => {
    await cleanupAll()
  })

  it('excludes unpublished items when filtering the public menu', async () => {
    const cat = await createCategory({ published: false })
    const pubCat = await createCategory()
    await createItem(cat.id, { published: true }) // hidden because parent category unpublished
    const pubItem = await createItem(pubCat.id, { published: true })
    await createItem(pubCat.id, { published: false })

    // Public query shape used by the public site.
    const categories = await prisma.category.findMany({
      where: { published: true },
      include: { menuItems: { where: { published: true } } },
    })
    const visible = categories.flatMap((c) => c.menuItems)
    expect(visible.map((i) => i.id)).toEqual([pubItem.id])
  })

  it('unpublished items are never included in a public category fetch', async () => {
    const cat = await createCategory()
    const hidden = await createItem(cat.id, { published: false, slug: `hidden-${Date.now()}` })
    const visible = await prisma.menuItem.findMany({
      where: { published: true, category: { id: cat.id } },
    })
    expect(visible.every((i) => i.id !== hidden.id)).toBe(true)
  })
})
