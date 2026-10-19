import prisma from '@/lib/db'
import { formatPrice } from '@/lib/validations'

// ─── Public Data Fetching ────────────────────────────────────────────────────

/** Fetch all published categories with their published items */
export async function getPublishedCategoriesWithItems() {
  const categories = await prisma.category.findMany({
    where: { published: true },
    orderBy: { displayOrder: 'asc' },
    include: {
      menuItems: {
        where: { published: true },
        orderBy: { displayOrder: 'asc' },
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          priceInCents: true,
          imagePath: true,
          imageAlt: true,
          isVegan: true,
          isChildFriendly: true,
          available: true,
        },
      },
    },
  })

  return categories.map((cat) => ({
    ...cat,
    menuItems: cat.menuItems.map((item) => ({
      ...item,
      formattedPrice: formatPrice(item.priceInCents),
    })),
  }))
}

/** Fetch all published categories (for navigation/filters) */
export async function getPublishedCategories() {
  return prisma.category.findMany({
    where: { published: true },
    orderBy: { displayOrder: 'asc' },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
    },
  })
}

/** Fetch a single published category with its items by slug */
export async function getCategoryWithItems(slug: string) {
  return prisma.category.findUnique({
    where: { slug, published: true },
    include: {
      menuItems: {
        where: { published: true },
        orderBy: { displayOrder: 'asc' },
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          priceInCents: true,
          imagePath: true,
          imageAlt: true,
          isVegan: true,
          isChildFriendly: true,
          available: true,
        },
      },
    },
  })
}

/** Fetch published menu items with optional category filter */
export async function getPublishedMenuItems(categorySlug?: string) {
  const where: Record<string, unknown> = { published: true }
  if (categorySlug) {
    where.category = { slug: categorySlug, published: true }
  }

  const items = await prisma.menuItem.findMany({
    where,
    orderBy: [{ category: { displayOrder: 'asc' } }, { displayOrder: 'asc' }],
    include: {
      category: {
        select: { id: true, name: true, slug: true },
      },
    },
  })

  return items.map((item) => ({
    ...item,
    formattedPrice: formatPrice(item.priceInCents),
  }))
}

/** Search published menu items by name */
export async function searchMenuItems(query: string) {
  const items = await prisma.menuItem.findMany({
    where: {
      published: true,
      name: { contains: query },
    },
    orderBy: { displayOrder: 'asc' },
    include: {
      category: { select: { id: true, name: true, slug: true } },
    },
  })

  return items.map((item) => ({
    ...item,
    formattedPrice: formatPrice(item.priceInCents),
  }))
}

/** Fetch business settings (singleton) */
export async function getBusinessSettings() {
  return prisma.businessSettings.findUnique({
    where: { id: 'main' },
  })
}

/** Get today's opening hours (Brazil timezone) */
export function getTodaysHours(settings: Awaited<ReturnType<typeof getBusinessSettings>>): {
  open: string | null
  close: string | null
  isOpen: boolean
} | null {
  if (!settings) return null

  const now = new Date()
  // Brasilia is UTC-3 (no DST currently)
  const brasiliaTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }))
  const day = brasiliaTime.getDay() // 0 = Sunday

  const dayMap: Record<number, { open: string | undefined; close: string | undefined }> = {
    0: { open: settings.sundayOpen ?? undefined, close: settings.sundayClose ?? undefined },
    1: { open: settings.mondayOpen ?? undefined, close: settings.mondayClose ?? undefined },
    2: { open: settings.tuesdayOpen ?? undefined, close: settings.tuesdayClose ?? undefined },
    3: { open: settings.wednesdayOpen ?? undefined, close: settings.wednesdayClose ?? undefined },
    4: { open: settings.thursdayOpen ?? undefined, close: settings.thursdayClose ?? undefined },
    5: { open: settings.fridayOpen ?? undefined, close: settings.fridayClose ?? undefined },
    6: { open: settings.saturdayOpen ?? undefined, close: settings.saturdayClose ?? undefined },
  }

  const today = dayMap[day]
  if (!today.open || !today.close) return null

  const [openH, openM] = today.open.split(':').map(Number)
  const [closeH, closeM] = today.close.split(':').map(Number)

  const openDate = new Date(brasiliaTime)
  openDate.setHours(openH, openM, 0, 0)

  const closeDate = new Date(brasiliaTime)
  closeDate.setHours(closeH, closeM, 0, 0)

  // Handle overnight closing (e.g., open 18:00, close 02:00)
  let isOpen = false
  if (closeDate > openDate) {
    isOpen = brasiliaTime >= openDate && brasiliaTime < closeDate
  } else {
    isOpen = brasiliaTime >= openDate || brasiliaTime < closeDate
  }

  return {
    open: today.open,
    close: today.close,
    isOpen,
  }
}

/** Format opening hours for display */
export function formatHours(open?: string | null, close?: string | null): string {
  if (!open || !close) return 'Fechado'
  return `${open}–${close}`
}

/** Get all days' hours for display */
export function getWeekHours(settings: Awaited<ReturnType<typeof getBusinessSettings>>) {
  if (!settings) return []

  const days = [
    { key: 'sunday', label: 'Domingo', open: settings.sundayOpen ?? undefined, close: settings.sundayClose ?? undefined },
    { key: 'monday', label: 'Segunda', open: settings.mondayOpen ?? undefined, close: settings.mondayClose ?? undefined },
    { key: 'tuesday', label: 'Terça', open: settings.tuesdayOpen ?? undefined, close: settings.tuesdayClose ?? undefined },
    { key: 'wednesday', label: 'Quarta', open: settings.wednesdayOpen ?? undefined, close: settings.wednesdayClose ?? undefined },
    { key: 'thursday', label: 'Quinta', open: settings.thursdayOpen ?? undefined, close: settings.thursdayClose ?? undefined },
    { key: 'friday', label: 'Sexta', open: settings.fridayOpen ?? undefined, close: settings.fridayClose ?? undefined },
    { key: 'saturday', label: 'Sábado', open: settings.saturdayOpen ?? undefined, close: settings.saturdayClose ?? undefined },
  ]

  return days.map((d) => ({
    ...d,
    formatted: formatHours(d.open, d.close),
  }))
}

/** Generate Google Maps directions URL */
export function getDirectionsUrl(address: string): string {
  const encoded = encodeURIComponent(address)
  return `https://www.google.com/maps/dir/?api=1&destination=${encoded}`
}

/** Get published media assets for gallery */
export async function getMediaAssets() {
  return prisma.mediaAsset.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      fileName: true,
      mimeType: true,
      fileSize: true,
      altText: true,
      storagePath: true,
      createdAt: true,
    },
  })
}

/** Schema.org structured data for restaurant */
export function generateRestaurantSchema(settings: Awaited<ReturnType<typeof getBusinessSettings>>) {
  if (!settings) return null

  return {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: settings.businessName,
    description: settings.brandDescription,
    address: {
      '@type': 'PostalAddress',
      streetAddress: settings.address,
    },
    telephone: settings.phone,
    url: process.env.NEXT_PUBLIC_SITE_URL,
    sameAs: settings.instagramUrl ? [settings.instagramUrl] : undefined,
    openingHoursSpecification: [
      { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Monday', opens: settings.mondayOpen, closes: settings.mondayClose },
      { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Tuesday', opens: settings.tuesdayOpen, closes: settings.tuesdayClose },
      { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Wednesday', opens: settings.wednesdayOpen, closes: settings.wednesdayClose },
      { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Thursday', opens: settings.thursdayOpen, closes: settings.thursdayClose },
      { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Friday', opens: settings.fridayOpen, closes: settings.fridayClose },
      { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Saturday', opens: settings.saturdayOpen, closes: settings.saturdayClose },
      { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Sunday', opens: settings.sundayOpen, closes: settings.sundayClose },
    ].filter((h) => h.opens && h.closes),
    servesCuisine: 'Bakery, Brazilian',
    priceRange: '$$',
  }
}