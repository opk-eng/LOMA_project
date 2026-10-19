'use server'

import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { revalidatePath } from 'next/cache'
import { requireAuth } from '@/lib/auth'
import prisma from '@/lib/db'

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
]

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads')
const UPLOAD_URL_PREFIX = '/uploads'

export type UploadResult =
  | { success: true; path: string; fileName: string; size: number; mimeType: string }
  | { success: false; error: string }

function generateSafeFileName(originalName: string): string {
  const ext = originalName.split('.').pop()?.toLowerCase() || 'jpg'
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 10)
  return `${timestamp}-${random}.${ext}`
}

export async function uploadImageAction(
  _prevState: UploadResult,
  formData: FormData
): Promise<UploadResult> {
  await requireAuth()

  const file = formData.get('image') as File
  if (!file || file.size === 0) {
    return { success: false, error: 'Nenhum arquivo enviado.' }
  }

  // Validate file type
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      success: false,
      error: 'Tipo de arquivo não permitido. Use JPEG, PNG, WebP ou AVIF.',
    }
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      success: false,
      error: `Arquivo muito grande. Tamanho máximo: ${MAX_FILE_SIZE / 1024 / 1024}MB.`,
    }
  }

  try {
    // Ensure upload directory exists
    await mkdir(UPLOAD_DIR, { recursive: true })

    const fileName = generateSafeFileName(file.name)
    const filePath = join(UPLOAD_DIR, fileName)

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // Store reference in database
    const mediaAsset = await prisma.mediaAsset.create({
      data: {
        storagePath: filePath,
        fileName, // safe file name — used to build the public URL
        originalName: file.name, // display name
        mimeType: file.type,
        fileSize: file.size,
        altText: formData.get('altText') as string || undefined,
        attribution: formData.get('attribution') as string || undefined,
      },
    })

    revalidatePath('/admin/media')

    return {
      success: true,
      path: `${UPLOAD_URL_PREFIX}/${fileName}`,
      fileName: mediaAsset.id,
      size: file.size,
      mimeType: file.type,
    }
  } catch (error) {
    console.error('Upload error:', error)
    return { success: false, error: 'Erro ao salvar o arquivo.' }
  }
}

export async function deleteImageAction(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const session = await requireAuth()

  const asset = await prisma.mediaAsset.findUnique({ where: { id } })
  if (!asset) {
    return { success: false, error: 'Arquivo não encontrado.' }
  }

  // Delete from filesystem
  try {
    const { unlink } = await import('fs/promises')
    await unlink(asset.storagePath)
  } catch {
    // File may already be gone; continue with DB deletion
  }

  await prisma.mediaAsset.delete({ where: { id } })

  await prisma.auditLog.create({
    data: {
      actorId: session.userId,
      actorEmail: session.email,
      action: 'DELETE',
      entityType: 'MediaAsset',
      entityId: id,
      metadata: JSON.stringify({ fileName: asset.fileName }),
    },
  })

  revalidatePath('/admin/media')

  return { success: true }
}

export async function getMediaAssets() {
  return prisma.mediaAsset.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      fileName: true,
      originalName: true,
      mimeType: true,
      fileSize: true,
      altText: true,
      createdAt: true,
    },
  })
}