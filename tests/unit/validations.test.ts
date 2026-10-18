import { describe, it, expect } from 'vitest'
import { formatPrice, parsePriceToCents, generateSlug } from '@/lib/validations'
import { categorySchema, menuItemSchema, businessSettingsSchema, loginSchema } from '@/lib/validations'

describe('Validation Helpers', () => {
  describe('formatPrice', () => {
    it('formats cents to Brazilian real correctly', () => {
      expect(formatPrice(0)).toBe('0,00')
      expect(formatPrice(50)).toBe('0,50')
      expect(formatPrice(950)).toBe('9,50')
      expect(formatPrice(1200)).toBe('12,00')
      expect(formatPrice(1250)).toBe('12,50')
      expect(formatPrice(3200)).toBe('32,00')
      expect(formatPrice(123456)).toBe('1.234,56')
    })
  })

  describe('parsePriceToCents', () => {
    it('parses Brazilian price strings to cents', () => {
      expect(parsePriceToCents('12,50')).toBe(1250)
      expect(parsePriceToCents('R$ 12,50')).toBe(1250)
      expect(parsePriceToCents('R$12,50')).toBe(1250)
      expect(parsePriceToCents('12.50')).toBe(1250)
      expect(parsePriceToCents('9,50')).toBe(950)
      expect(parsePriceToCents('0,50')).toBe(50)
    })

    it('handles invalid input', () => {
      expect(parsePriceToCents('')).toBe(0)
      expect(parsePriceToCents('abc')).toBe(0)
      expect(parsePriceToCents('R$')).toBe(0)
    })
  })

  describe('generateSlug', () => {
    it('generates URL-safe slugs from Portuguese text', () => {
      expect(generateSlug('Padaria Artesanal')).toBe('padaria-artesanal')
      expect(generateSlug('Café da Manhã')).toBe('cafe-da-manha')
      expect(generateSlug('Pão de Fermentação Natural')).toBe('pao-de-fermentacao-natural')
      expect(generateSlug('Bruschetta de Tomate')).toBe('bruschetta-de-tomate')
    })

    it('handles special characters and spaces', () => {
      expect(generateSlug('  Hello   World  ')).toBe('hello-world')
      expect(generateSlug('Test@#$%^&*()')).toBe('test')
      expect(generateSlug('Multiple---Hyphens')).toBe('multiple-hyphens')
    })

    it('truncates to 100 characters', () => {
      const longText = 'a'.repeat(150)
      expect(generateSlug(longText).length).toBe(100)
    })

    it('lowercases everything', () => {
      expect(generateSlug('UPPERCASE')).toBe('uppercase')
      expect(generateSlug('MiXeD CaSe')).toBe('mixed-case')
    })
  })
})

describe('Zod Schemas', () => {
  describe('loginSchema', () => {
    it('accepts valid email and password', () => {
      const result = loginSchema.safeParse({ email: 'admin@loma.local', password: 'secret123' })
      expect(result.success).toBe(true)
    })

    it('rejects invalid email', () => {
      const result = loginSchema.safeParse({ email: 'invalid', password: 'secret123' })
      expect(result.success).toBe(false)
    })

    it('rejects empty password', () => {
      const result = loginSchema.safeParse({ email: 'admin@loma.local', password: '' })
      expect(result.success).toBe(false)
    })
  })

  describe('categorySchema', () => {
    const validCategory = {
      name: 'Padaria Artesanal',
      slug: 'padaria-artesanal',
      description: 'Pães artesanais',
      displayOrder: 1,
      published: true,
    }

    it('accepts valid category', () => {
      const result = categorySchema.safeParse(validCategory)
      expect(result.success).toBe(true)
    })

    it('rejects empty name', () => {
      const result = categorySchema.safeParse({ ...validCategory, name: '' })
      expect(result.success).toBe(false)
    })

    it('rejects invalid slug (uppercase)', () => {
      const result = categorySchema.safeParse({ ...validCategory, slug: 'Padaria-Artesanal' })
      expect(result.success).toBe(false)
    })

    it('rejects invalid slug (spaces)', () => {
      const result = categorySchema.safeParse({ ...validCategory, slug: 'padaria artesanal' })
      expect(result.success).toBe(false)
    })

    it('rejects invalid slug (special chars)', () => {
      const result = categorySchema.safeParse({ ...validCategory, slug: 'padaria@artesanal' })
      expect(result.success).toBe(false)
    })

    it('accepts valid slug with numbers and hyphens', () => {
      const result = categorySchema.safeParse({ ...validCategory, slug: 'cat-123-test' })
      expect(result.success).toBe(true)
    })

    it('coerces displayOrder to number', () => {
      const result = categorySchema.safeParse({ ...validCategory, displayOrder: '5' })
      expect(result.success).toBe(true)
      expect(result.data?.displayOrder).toBe(5)
    })

    it('defaults published to false', () => {
      const result = categorySchema.safeParse({ name: 'Test', slug: 'test' })
      expect(result.success).toBe(true)
      expect(result.data?.published).toBe(false)
    })
  })

  describe('menuItemSchema', () => {
    const validItem = {
      categoryId: 'cat-123',
      name: 'Pão de Fermentação Natural',
      slug: 'pao-fermentacao-natural',
      description: 'Pão artesanal',
      priceInCents: 1200,
      displayOrder: 1,
      published: true,
      available: true,
      isVegan: false,
      isChildFriendly: false,
    }

    it('accepts valid menu item', () => {
      const result = menuItemSchema.safeParse(validItem)
      expect(result.success).toBe(true)
    })

    it('rejects empty categoryId', () => {
      const result = menuItemSchema.safeParse({ ...validItem, categoryId: '' })
      expect(result.success).toBe(false)
    })

    it('rejects negative price', () => {
      const result = menuItemSchema.safeParse({ ...validItem, priceInCents: -100 })
      expect(result.success).toBe(false)
    })

    it('coerces priceInCents from string', () => {
      const result = menuItemSchema.safeParse({ ...validItem, priceInCents: '1500' })
      expect(result.success).toBe(true)
      expect(result.data?.priceInCents).toBe(1500)
    })

    it('rejects non-integer price', () => {
      const result = menuItemSchema.safeParse({ ...validItem, priceInCents: 12.5 })
      expect(result.success).toBe(false)
    })

    it('defaults available to true', () => {
      const result = menuItemSchema.safeParse({ ...validItem, available: undefined })
      expect(result.success).toBe(true)
      expect(result.data?.available).toBe(true)
    })

    it('defaults isVegan and isChildFriendly to false', () => {
      const result = menuItemSchema.safeParse({ ...validItem, isVegan: undefined, isChildFriendly: undefined })
      expect(result.success).toBe(true)
      expect(result.data?.isVegan).toBe(false)
      expect(result.data?.isChildFriendly).toBe(false)
    })
  })

  describe('businessSettingsSchema', () => {
    const validSettings = {
      businessName: 'LOMA',
      brandDescription: 'Descrição',
      address: 'Endereço',
      phone: '+55 61 3326-9714',
      instagramUrl: 'https://instagram.com/lomacozinha',
      mondayOpen: '07:30',
      mondayClose: '22:00',
      hasOutdoorSeating: true,
      hasVeganOptions: true,
      hasChildMenu: true,
    }

    it('accepts valid settings', () => {
      const result = businessSettingsSchema.safeParse(validSettings)
      expect(result.success).toBe(true)
    })

    it('rejects invalid time format', () => {
      const result = businessSettingsSchema.safeParse({ ...validSettings, mondayOpen: '7:30' })
      expect(result.success).toBe(false)
    })

    it('rejects invalid time (25:00)', () => {
      const result = businessSettingsSchema.safeParse({ ...validSettings, mondayOpen: '25:00' })
      expect(result.success).toBe(false)
    })

    it('accepts valid 24h time format', () => {
      const result = businessSettingsSchema.safeParse({ ...validSettings, mondayOpen: '13:45', mondayClose: '23:59' })
      expect(result.success).toBe(true)
    })

    it('rejects invalid Instagram URL', () => {
      const result = businessSettingsSchema.safeParse({ ...validSettings, instagramUrl: 'not-a-url' })
      expect(result.success).toBe(false)
    })

    it('accepts empty Instagram URL', () => {
      const result = businessSettingsSchema.safeParse({ ...validSettings, instagramUrl: '' })
      expect(result.success).toBe(true)
    })

    it('defaults boolean services to true', () => {
      const result = businessSettingsSchema.safeParse({
        businessName: 'Test',
        brandDescription: '',
        address: '',
        phone: '',
      })
      expect(result.success).toBe(true)
      expect(result.data?.hasOutdoorSeating).toBe(true)
      expect(result.data?.hasVeganOptions).toBe(true)
      expect(result.data?.hasChildMenu).toBe(true)
    })
  })
})