/**
 * Helpers for Prisma integration tests.
 *
 * Connects to the isolated integration database (integration.db) using the
 * real Prisma client — no mocks — so tests exercise real SQL and referential
 * integrity constraints.
 *
 * Each suite should clean its own tables via `cleanupAll`.
 */
import prisma from '@/lib/db'

/** Wipe every table (child-first) so tests run in a clean, deterministic state. */
export async function cleanupAll() {
  await prisma.auditLog.deleteMany()
  await prisma.menuItem.deleteMany()
  await prisma.category.deleteMany()
  await prisma.mediaAsset.deleteMany()
  await prisma.adminUser.deleteMany()
  await prisma.businessSettings.deleteMany()
}

/** Create a published category with a unique random slug. */
export async function createCategory(overrides: Record<string, unknown> = {}) {
  const seq = Math.floor(Math.random() * 1e9)
  return prisma.category.create({
    data: {
      name: `Categoria ${seq}`,
      slug: `categoria-${seq}`,
      displayOrder: 0,
      published: true,
      ...overrides,
    },
  })
}

/** Create a menu item in the given category with a unique slug. */
export async function createItem(categoryId: string, overrides: Record<string, unknown> = {}) {
  const seq = Math.floor(Math.random() * 1e9)
  return prisma.menuItem.create({
    data: {
      categoryId,
      name: `Item ${seq}`,
      slug: `item-${seq}`,
      priceInCents: 1000,
      displayOrder: 0,
      published: true,
      ...overrides,
    },
  })
}
