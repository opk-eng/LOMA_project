// src/lib/validations/schemas.ts
import { z } from "zod/v4";

// ── Slug generator ───────────────────────────────────────────────────────────

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

// ── Category ─────────────────────────────────────────────────────────────────

export const categorySchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(100),
  slug: z.string().min(1).max(100).optional(),
  description: z.string().max(500).nullable().optional(),
  order: z.number().int().min(0).default(0),
  published: z.boolean().default(false),
});

export type CategoryInput = z.infer<typeof categorySchema>;

// ── Menu Item ────────────────────────────────────────────────────────────────

export const menuItemSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(200),
  slug: z.string().min(1).max(200).optional(),
  categoryId: z.string().min(1, "Categoria é obrigatória"),
  description: z.string().max(1000).nullable().optional(),
  priceCents: z.number().int().min(0).nullable().optional(),
  imageUrl: z.string().max(500).nullable().optional(),
  imageAlt: z.string().max(200).nullable().optional(),
  order: z.number().int().min(0).default(0),
  published: z.boolean().default(false),
  available: z.boolean().default(true),
  isVegan: z.boolean().default(false),
  isVegetarian: z.boolean().default(false),
  isGlutenFree: z.boolean().default(false),
});

export type MenuItemInput = z.infer<typeof menuItemSchema>;

// ── Business settings ────────────────────────────────────────────────────────

export const businessSettingsSchema = z.object({
  businessName: z.string().min(1).max(200),
  tagline: z.string().max(500),
  description: z.string().max(2000),
  address: z.string().max(500),
  phone: z.string().max(30),
  instagramUrl: z.url().max(200),
  openingHours: z.string(), // JSON
  hasOutdoorSeating: z.boolean(),
  hasVeganOptions: z.boolean(),
  hasKidsMenu: z.boolean(),
  metaTitle: z.string().max(70),
  metaDescription: z.string().max(160),
});

export type BusinessSettingsInput = z.infer<typeof businessSettingsSchema>;

// ── Login ────────────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.email("E-mail inválido"),
  password: z.string().min(1, "Senha é obrigatória"),
});

export type LoginInput = z.infer<typeof loginSchema>;

// ── Upload ───────────────────────────────────────────────────────────────────

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
];
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

// ── Price formatting ─────────────────────────────────────────────────────────

export function formatPrice(cents: number | null): string {
  if (cents === null || cents === undefined) return "";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}

export function parsePriceToCents(value: string): number | null {
  if (!value || value.trim() === "") return null;
  // Accept "12,50" or "12.50" or "1250"
  const cleaned = value.replace(/[^\d,.]/g, "").replace(",", ".");
  const num = parseFloat(cleaned);
  if (isNaN(num)) return null;
  return Math.round(num * 100);
}
