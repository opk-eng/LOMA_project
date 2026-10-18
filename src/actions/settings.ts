'use server'

import prisma from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { businessSettingsSchema } from '@/lib/validations'
import { revalidatePath } from 'next/cache'

export type SettingsActionResult =
  | { success: true }
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

export async function updateSettingsAction(
  _prevState: SettingsActionResult,
  formData: FormData
): Promise<SettingsActionResult> {
  const session = await requireAuth()

  const raw = {
    businessName: formData.get('businessName'),
    brandDescription: formData.get('brandDescription') || '',
    address: formData.get('address') || '',
    phone: formData.get('phone') || '',
    instagramUrl: formData.get('instagramUrl') || '',
    mondayOpen: formData.get('mondayOpen') || undefined,
    mondayClose: formData.get('mondayClose') || undefined,
    tuesdayOpen: formData.get('tuesdayOpen') || undefined,
    tuesdayClose: formData.get('tuesdayClose') || undefined,
    wednesdayOpen: formData.get('wednesdayOpen') || undefined,
    wednesdayClose: formData.get('wednesdayClose') || undefined,
    thursdayOpen: formData.get('thursdayOpen') || undefined,
    thursdayClose: formData.get('thursdayClose') || undefined,
    fridayOpen: formData.get('fridayOpen') || undefined,
    fridayClose: formData.get('fridayClose') || undefined,
    saturdayOpen: formData.get('saturdayOpen') || undefined,
    saturdayClose: formData.get('saturdayClose') || undefined,
    sundayOpen: formData.get('sundayOpen') || undefined,
    sundayClose: formData.get('sundayClose') || undefined,
    hasOutdoorSeating: formData.get('hasOutdoorSeating') === 'on',
    hasVeganOptions: formData.get('hasVeganOptions') === 'on',
    hasChildMenu: formData.get('hasChildMenu') === 'on',
    seoTitle: formData.get('seoTitle') || undefined,
    seoDescription: formData.get('seoDescription') || undefined,
  }

  const parsed = businessSettingsSchema.safeParse(raw)
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

  await prisma.businessSettings.update({
    where: { id: 'main' },
    data,
  })

  await logAudit(
    session.userId,
    session.email,
    'UPDATE',
    'BusinessSettings',
    'main',
    { businessName: data.businessName }
  )

  revalidatePath('/admin/settings')
  revalidatePath('/')
  revalidatePath('/cardapio')
  revalidatePath('/sobre')
  revalidatePath('/visite-nos')

  return { success: true }
}

export async function updateOgImageAction(
  ogImagePath: string
): Promise<SettingsActionResult> {
  const session = await requireAuth()

  await prisma.businessSettings.update({
    where: { id: 'main' },
    data: { ogImagePath },
  })

  await logAudit(
    session.userId,
    session.email,
    'UPDATE',
    'BusinessSettings',
    'main',
    { ogImagePath }
  )

  revalidatePath('/')
  revalidatePath('/cardapio')
  revalidatePath('/sobre')
  revalidatePath('/visite-nos')

  return { success: true }
}