'use server'

import prisma from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { categorySchema } from '@/lib/validations'
import { revalidatePath } from 'next/cache'

export type CategoryActionResult =
  | { success: true; category: { id: string; slug: string } }
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

export async function createCategoryAction(
  _prevState: CategoryActionResult,
  formData: FormData
): Promise<CategoryActionResult> {
  const session = await requireAuth()

  const raw = {
    name: formData.get('name'),
    slug: formData.get('slug'),
    description: formData.get('description') || undefined,
    displayOrder: formData.get('displayOrder'),
    published: formData.get('published') === 'on',
  }

  const parsed = categorySchema.safeParse(raw)
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

  // Check slug uniqueness
  const existing = await prisma.category.findUnique({ where: { slug: data.slug } })
  if (existing) {
    return { success: false, error: 'Este slug já está em uso.', issues: { slug: ['Slug já existe.'] } }
  }

  const category = await prisma.category.create({ data })

  await logAudit(
    session.userId,
    session.email,
    'CREATE',
    'Category',
    category.id,
    { name: category.name, slug: category.slug }
  )

  revalidatePath('/admin/menu')
  revalidatePath('/admin')

  return { success: true, category: { id: category.id, slug: category.slug } }
}

export async function updateCategoryAction(
  _prevState: CategoryActionResult,
  formData: FormData
): Promise<CategoryActionResult> {
  const session = await requireAuth()

  const id = formData.get('id') as string
  if (!id) return { success: false, error: 'ID obrigatório.' }

  const raw = {
    name: formData.get('name'),
    slug: formData.get('slug'),
    description: formData.get('description') || undefined,
    displayOrder: formData.get('displayOrder'),
    published: formData.get('published') === 'on',
  }

  const parsed = categorySchema.safeParse(raw)
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

  // Check slug uniqueness (excluding self)
  const existing = await prisma.category.findFirst({
    where: { slug: data.slug, NOT: { id } },
  })
  if (existing) {
    return { success: false, error: 'Este slug já está em uso.', issues: { slug: ['Slug já existe.'] } }
  }

  const category = await prisma.category.update({
    where: { id },
    data,
  })

  await logAudit(
    session.userId,
    session.email,
    'UPDATE',
    'Category',
    category.id,
    { name: category.name, slug: category.slug }
  )

  revalidatePath('/admin/menu')
  revalidatePath('/admin')
  revalidatePath('/cardapio')

  return { success: true, category: { id: category.id, slug: category.slug } }
}

export async function toggleCategoryPublishAction(
  id: string,
  published: boolean
): Promise<CategoryActionResult> {
  const session = await requireAuth()

  const category = await prisma.category.update({
    where: { id },
    data: { published },
  })

  await logAudit(
    session.userId,
    session.email,
    published ? 'PUBLISH' : 'UNPUBLISH',
    'Category',
    category.id,
    { name: category.name }
  )

  revalidatePath('/admin/menu')
  revalidatePath('/admin')
  revalidatePath('/cardapio')

  return { success: true, category: { id: category.id, slug: category.slug } }
}

export async function deleteCategoryAction(id: string): Promise<CategoryActionResult> {
  const session = await requireAuth()

  // Check if category has menu items
  const itemCount = await prisma.menuItem.count({ where: { categoryId: id } })
  if (itemCount > 0) {
    return {
      success: false,
      error: 'Não é possível excluir: categoria possui itens associados.',
    }
  }

  const category = await prisma.category.delete({ where: { id } })

  await logAudit(
    session.userId,
    session.email,
    'DELETE',
    'Category',
    category.id,
    { name: category.name, slug: category.slug }
  )

  revalidatePath('/admin/menu')
  revalidatePath('/admin')

  return { success: true, category: { id: category.id, slug: category.slug } }
}

export async function reorderCategoriesAction(
  updates: { id: string; displayOrder: number }[]
): Promise<{ success: boolean; error?: string }> {
  const session = await requireAuth()

  await prisma.$transaction(
    updates.map((u) =>
      prisma.category.update({
        where: { id: u.id },
        data: { displayOrder: u.displayOrder },
      })
    )
  )

  await logAudit(
    session.userId,
    session.email,
    'REORDER',
    'Category',
    'multiple',
    { updates }
  )

  revalidatePath('/admin/menu')
  revalidatePath('/cardapio')

  return { success: true }
}