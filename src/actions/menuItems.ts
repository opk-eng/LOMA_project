'use server'

import prisma from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { menuItemSchema } from '@/lib/validations'
import { revalidatePath } from 'next/cache'

export type MenuItemActionResult =
  | { success: true; item: { id: string; slug: string } }
  | { success: false; error: string; issues?: Record<string, string[]> }

async function logAudit(
  actorId: string,
  actorEmail: string,
  action: string,
  entityType: string,
  entityId: string,
  metadata?: Record<string, unknown>
) {
  await prisma.auditLog.create({
    data: {
      actorId,
      actorEmail,
      action,
      entityType,
      entityId,
      metadata: metadata ? JSON.stringify(metadata) : null,
    },
  })
}

export async function createMenuItemAction(
  _prevState: MenuItemActionResult,
  formData: FormData
): Promise<MenuItemActionResult> {
  const session = await requireAuth()

  const raw = {
    categoryId: formData.get('categoryId'),
    name: formData.get('name'),
    slug: formData.get('slug'),
    description: formData.get('description') || undefined,
    priceInCents: formData.get('priceInCents'),
    imagePath: formData.get('imagePath') || undefined,
    imageAlt: formData.get('imageAlt') || undefined,
    displayOrder: formData.get('displayOrder'),
    published: formData.get('published') === 'on',
    available: formData.get('available') === 'on',
    isVegan: formData.get('isVegan') === 'on',
    isChildFriendly: formData.get('isChildFriendly') === 'on',
  }

  const parsed = menuItemSchema.safeParse(raw)
  if (!parsed.success) {
    const issues: Record<string, string[]> = {}
    for (const issue of parsed.error.issues) {
      const path = issue.path.join('.')
      if (!issues[path]) issues[path] = []
      issues[path].push(issue.message)
    }
    return { success: false, error: 'Dados inválidos.', issues }
  }

  const data = parsed.data

  // Verify category exists
  const category = await prisma.category.findUnique({ where: { id: data.categoryId } })
  if (!category) {
    return { success: false, error: 'Categoria não encontrada.', issues: { categoryId: ['Categoria inválida.'] } }
  }

  // Check slug uniqueness
  const existing = await prisma.menuItem.findUnique({ where: { slug: data.slug } })
  if (existing) {
    return { success: false, error: 'Este slug já está em uso.', issues: { slug: ['Slug já existe.'] } }
  }

  const item = await prisma.menuItem.create({ data })

  await logAudit(
    session.userId,
    session.email,
    'CREATE',
    'MenuItem',
    item.id,
    { name: item.name, slug: item.slug, categoryId: item.categoryId }
  )

  revalidatePath('/admin/menu')
  revalidatePath('/admin')
  revalidatePath('/cardapio')

  return { success: true, item: { id: item.id, slug: item.slug } }
}

export async function updateMenuItemAction(
  _prevState: MenuItemActionResult,
  formData: FormData
): Promise<MenuItemActionResult> {
  const session = await requireAuth()

  const id = formData.get('id') as string
  if (!id) return { success: false, error: 'ID obrigatório.' }

  const raw = {
    categoryId: formData.get('categoryId'),
    name: formData.get('name'),
    slug: formData.get('slug'),
    description: formData.get('description') || undefined,
    priceInCents: formData.get('priceInCents'),
    imagePath: formData.get('imagePath') || undefined,
    imageAlt: formData.get('imageAlt') || undefined,
    displayOrder: formData.get('displayOrder'),
    published: formData.get('published') === 'on',
    available: formData.get('available') === 'on',
    isVegan: formData.get('isVegan') === 'on',
    isChildFriendly: formData.get('isChildFriendly') === 'on',
  }

  const parsed = menuItemSchema.safeParse(raw)
  if (!parsed.success) {
    const issues: Record<string, string[]> = {}
    for (const issue of parsed.error.issues) {
      const path = issue.path.join('.')
      if (!issues[path]) issues[path] = []
      issues[path].push(issue.message)
    }
    return { success: false, error: 'Dados inválidos.', issues }
  }

  const data = parsed.data

  // Verify category exists
  const category = await prisma.category.findUnique({ where: { id: data.categoryId } })
  if (!category) {
    return { success: false, error: 'Categoria não encontrada.', issues: { categoryId: ['Categoria inválida.'] } }
  }

  // Check slug uniqueness (excluding self)
  const existing = await prisma.menuItem.findFirst({
    where: { slug: data.slug, NOT: { id } },
  })
  if (existing) {
    return { success: false, error: 'Este slug já está em uso.', issues: { slug: ['Slug já existe.'] } }
  }

  const item = await prisma.menuItem.update({
    where: { id },
    data,
  })

  await logAudit(
    session.userId,
    session.email,
    'UPDATE',
    'MenuItem',
    item.id,
    { name: item.name, slug: item.slug, categoryId: item.categoryId }
  )

  revalidatePath('/admin/menu')
  revalidatePath('/admin')
  revalidatePath('/cardapio')

  return { success: true, item: { id: item.id, slug: item.slug } }
}

export async function toggleMenuItemPublishAction(
  id: string,
  published: boolean
): Promise<MenuItemActionResult> {
  const session = await requireAuth()

  const item = await prisma.menuItem.update({
    where: { id },
    data: { published },
  })

  await logAudit(
    session.userId,
    session.email,
    published ? 'PUBLISH' : 'UNPUBLISH',
    'MenuItem',
    item.id,
    { name: item.name, categoryId: item.categoryId }
  )

  revalidatePath('/admin/menu')
  revalidatePath('/admin')
  revalidatePath('/cardapio')

  return { success: true, item: { id: item.id, slug: item.slug } }
}

export async function toggleMenuItemAvailableAction(
  id: string,
  available: boolean
): Promise<MenuItemActionResult> {
  const session = await requireAuth()

  const item = await prisma.menuItem.update({
    where: { id },
    data: { available },
  })

  await logAudit(
    session.userId,
    session.email,
    available ? 'MAKE_AVAILABLE' : 'MAKE_UNAVAILABLE',
    'MenuItem',
    item.id,
    { name: item.name }
  )

  revalidatePath('/admin/menu')
  revalidatePath('/admin')
  revalidatePath('/cardapio')

  return { success: true, item: { id: item.id, slug: item.slug } }
}

export async function deleteMenuItemAction(id: string): Promise<MenuItemActionResult> {
  const session = await requireAuth()

  const item = await prisma.menuItem.delete({ where: { id } })

  await logAudit(
    session.userId,
    session.email,
    'DELETE',
    'MenuItem',
    item.id,
    { name: item.name, slug: item.slug, categoryId: item.categoryId }
  )

  revalidatePath('/admin/menu')
  revalidatePath('/admin')
  revalidatePath('/cardapio')

  return { success: true, item: { id: item.id, slug: item.slug } }
}

export async function reorderMenuItemsAction(
  updates: { id: string; displayOrder: number }[]
): Promise<{ success: boolean; error?: string }> {
  const session = await requireAuth()

  await prisma.$transaction(
    updates.map((u) =>
      prisma.menuItem.update({
        where: { id: u.id },
        data: { displayOrder: u.displayOrder },
      })
    )
  )

  await logAudit(
    session.userId,
    session.email,
    'REORDER',
    'MenuItem',
    'multiple',
    { updates }
  )

  revalidatePath('/admin/menu')
  revalidatePath('/cardapio')

  return { success: true }
}