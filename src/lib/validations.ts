import { z } from 'zod'

// ─── Auth ────────────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.email('E-mail inválido'),
  password: z.string().min(1, 'Senha obrigatória'),
})

// ─── Category ────────────────────────────────────────────────────────────────

export const categorySchema = z.object({
  name: z.string().min(1, 'Nome obrigatório').max(100, 'Nome muito longo'),
  slug: z
    .string()
    .min(1, 'Slug obrigatório')
    .max(100)
    .regex(/^[a-z0-9-]+$/, 'Slug deve conter apenas letras minúsculas, números e hífens'),
  description: z.string().max(500, 'Descrição muito longa').optional(),
  displayOrder: z.coerce.number().int().min(0).default(0),
  published: z.boolean().default(false),
})

export type CategoryInput = z.infer<typeof categorySchema>

// ─── Menu Item ────────────────────────────────────────────────────────────────

export const menuItemSchema = z.object({
  categoryId: z.string().min(1, 'Categoria obrigatória'),
  name: z.string().min(1, 'Nome obrigatório').max(150, 'Nome muito longo'),
  slug: z
    .string()
    .min(1, 'Slug obrigatório')
    .max(150)
    .regex(/^[a-z0-9-]+$/, 'Slug deve conter apenas letras minúsculas, números e hífens'),
  description: z.string().max(1000, 'Descrição muito longa').optional(),
  priceInCents: z.coerce
    .number()
    .int('Preço deve ser um número inteiro de centavos')
    .min(0, 'Preço não pode ser negativo')
    .default(0),
  imagePath: z.string().optional(),
  imageAlt: z.string().max(200).optional(),
  displayOrder: z.coerce.number().int().min(0).default(0),
  published: z.boolean().default(false),
  available: z.boolean().default(true),
  isVegan: z.boolean().default(false),
  isChildFriendly: z.boolean().default(false),
})

export type MenuItemInput = z.infer<typeof menuItemSchema>

// ─── Business Settings ───────────────────────────────────────────────────────

const timeString = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Use formato HH:MM (ex: 07:30)')
  .optional()

export const businessSettingsSchema = z.object({
  businessName: z.string().min(1, 'Nome obrigatório').max(200),
  brandDescription: z.string().max(2000).default(''),
  address: z.string().max(500).default(''),
  phone: z.string().max(30).default(''),
  instagramUrl: z.url('URL do Instagram inválida').optional().or(z.literal('')),
  mondayOpen: timeString,
  mondayClose: timeString,
  tuesdayOpen: timeString,
  tuesdayClose: timeString,
  wednesdayOpen: timeString,
  wednesdayClose: timeString,
  thursdayOpen: timeString,
  thursdayClose: timeString,
  fridayOpen: timeString,
  fridayClose: timeString,
  saturdayOpen: timeString,
  saturdayClose: timeString,
  sundayOpen: timeString,
  sundayClose: timeString,
  hasOutdoorSeating: z.boolean().default(true),
  hasVeganOptions: z.boolean().default(true),
  hasChildMenu: z.boolean().default(true),
  seoTitle: z.string().max(200).optional(),
  seoDescription: z.string().max(300).optional(),
})

export type BusinessSettingsInput = z.infer<typeof businessSettingsSchema>

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Converts price in cents to display string: 1250 → "12,50" */
export function formatPrice(cents: number): string {
  return (cents / 100).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

/**
 * Parses a price string to cents. Accepts "12,50", "R$ 12,50", "12.50",
 * "1.234,56" (thousands separator). The last decimal separator (comma or
 * dot) is treated as the cents separator; digits before it are reais.
 */
export function parsePriceToCents(value: string): number {
  const cleaned = value.replace(/[^0-9,.]/g, '')
  if (!cleaned) return 0

  const lastComma = cleaned.lastIndexOf(',')
  const lastDot = cleaned.lastIndexOf('.')
  const sep = lastComma > lastDot ? lastComma : lastDot

  if (sep === -1) {
    // No decimal separator: interpret as whole reais.
    const reais = parseInt(cleaned, 10)
    return isNaN(reais) ? 0 : reais * 100
  }

  const intPart = cleaned.slice(0, sep).replace(/[.,]/g, '')
  const fracPart = cleaned.slice(sep + 1).replace(/[.,]/g, '').slice(0, 2)
  const reais = intPart ? parseInt(intPart, 10) : 0
  const cents = fracPart ? parseInt(fracPart.padEnd(2, '0'), 10) : 0
  if (isNaN(reais) || isNaN(cents)) return 0
  return reais * 100 + cents
}

/** Generates a URL-safe slug from a string */
export function generateSlug(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 100)
}
