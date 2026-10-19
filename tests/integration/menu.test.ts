import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import prisma from '@/lib/db'
import { cleanupAll, createCategory, createItem } from './helpers'

describe('Category CRUD (real DB)', () => {
  beforeAll(async () => {
    await cleanupAll()
  })
  afterAll(async () => {
    await cleanupAll()
  })

  it('creates a category with schema-defined defaults', async () => {
    const cat = await prisma.category.create({
      data: { name: 'Pães', slug: 'paes', description: 'Pães artesanais' },
    })
    expect(cat.id).toBeDefined()
    expect(cat.displayOrder).toBe(0)
    expect(cat.published).toBe(false)
  })

  it('enforces unique slugs', async () => {
    await prisma.category.create({ data: { name: 'Cafés', slug: 'cafes' } })

    let err: { code?: string } | undefined
    try {
      await prisma.category.create({ data: { name: 'Cafés 2', slug: 'cafes' } })
    } catch (e) {
      err = e as { code?: string }
    }
    expect(err).toBeTruthy()
    expect(err?.code).toBe('P2002')
  })

  it('prevents deleting a category that still has items (Restrict FK)', async () => {
    const cat = await createCategory()
    await createItem(cat.id)

    let err: { code?: string } | undefined
    try {
      await prisma.category.delete({ where: { id: cat.id } })
    } catch (e) {
      err = e as { code?: string }
    }
    expect(err).toBeTruthy()
    // The category must still exist.
    const stillThere = await prisma.category.findUnique({ where: { id: cat.id } })
    expect(stillThere).toBeTruthy()
  })

  it('can delete a category once its items are removed', async () => {
    const cat = await createCategory()
    const item = await createItem(cat.id)
    await prisma.menuItem.delete({ where: { id: item.id } })

    const deleted = await prisma.category.delete({ where: { id: cat.id } })
    expect(deleted.id).toBe(cat.id)
  })

  it('toggle publish/unpublish', async () => {
    const cat = await createCategory({ published: false })
    const on = await prisma.category.update({ where: { id: cat.id }, data: { published: true } })
    expect(on.published).toBe(true)
    const off = await prisma.category.update({ where: { id: cat.id }, data: { published: false } })
    expect(off.published).toBe(false)
  })
})

describe('Menu Item (real DB)', () => {
  beforeAll(async () => {
    await cleanupAll()
  })
  afterAll(async () => {
    await cleanupAll()
  })

  it('enforces unique slugs for items', async () => {
    const cat = await createCategory()
    await createItem(cat.id, { slug: 'unique-item' })

    let err: { code?: string } | undefined
    try {
      await createItem(cat.id, { slug: 'unique-item' })
    } catch (e) {
      err = e as { code?: string }
    }
    expect(err).toBeTruthy()
    expect(err?.code).toBe('P2002')
  })

  it('stores prices as integer cents (no float errors)', async () => {
    const cat = await createCategory()
    const item = await createItem(cat.id, { priceInCents: 1250 })
    expect(item.priceInCents).toBe(1250)
    // 12.50 in R$ — round-trip display
    expect((1250 / 100).toFixed(2)).toBe('12.50')
  })

  it('toggles published and available flags', async () => {
    const cat = await createCategory()
    const item = await createItem(cat.id, { published: false, available: false })
    const updated = await prisma.menuItem.update({
      where: { id: item.id },
      data: { published: true, available: true },
    })
    expect(updated.published).toBe(true)
    expect(updated.available).toBe(true)
  })

  it('orders items deterministically by displayOrder within a category', async () => {
    const cat = await createCategory()
    await createItem(cat.id, { displayOrder: 3, name: 'Third' })
    await createItem(cat.id, { displayOrder: 1, name: 'First' })
    await createItem(cat.id, { displayOrder: 2, name: 'Second' })

    const items = await prisma.menuItem.findMany({
      where: { categoryId: cat.id },
      orderBy: { displayOrder: 'asc' },
    })
    expect(items.map((i) => i.name)).toEqual(['First', 'Second', 'Third'])
  })

  it('tracks created/updated timestamps', async () => {
    const cat = await createCategory()
    const item = await createItem(cat.id)
    expect(item.createdAt).toBeInstanceOf(Date)
    expect(item.updatedAt).toBeInstanceOf(Date)

    await new Promise((r) => setTimeout(r, 20))
    const updated = await prisma.menuItem.update({ where: { id: item.id }, data: { displayOrder: 99 } })
    expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(item.updatedAt.getTime())
  })
})

describe('Business Settings (real DB)', () => {
  beforeAll(async () => {
    await cleanupAll()
  })
  afterAll(async () => {
    await cleanupAll()
  })

  it('upsert of the settings singleton is idempotent', async () => {
    const seed = {
      id: 'main',
      businessName: 'LOMA',
      brandDescription: '',
      address: '',
      phone: '',
      instagramUrl: '',
      mondayOpen: '07:30',
      mondayClose: '22:00',
    }

    await prisma.businessSettings.upsert({ where: { id: 'main' }, update: {}, create: seed })
    await prisma.businessSettings.upsert({ where: { id: 'main' }, update: {}, create: seed })

    const count = await prisma.businessSettings.count()
    expect(count).toBe(1)
  })

  it('opening-hours fields accept HH:MM strings and nullable days', async () => {
    // Start from a clean singleton row so we test the exact values we create.
    await prisma.businessSettings.deleteMany({ where: { id: 'main' } })
    await prisma.businessSettings.create({
      data: {
        id: 'main',
        businessName: 'LOMA',
        brandDescription: '',
        address: '',
        phone: '',
        instagramUrl: '',
        saturdayOpen: '08:00',
        saturdayClose: '20:00',
        sundayOpen: null,
        sundayClose: null,
      },
    })
    const s = await prisma.businessSettings.findUnique({ where: { id: 'main' } })
    expect(s?.saturdayOpen).toBe('08:00')
    expect(s?.saturdayClose).toBe('20:00')
    expect(s?.sundayOpen).toBeNull()
  })
})
