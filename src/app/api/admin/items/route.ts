import { requireAdmin } from '@/lib/admin-auth'
import prisma from '@/lib/db'

export async function GET() {
  try {
    await requireAdmin()

    const items = await prisma.menuItem.findMany({
      orderBy: [{ category: { displayOrder: 'asc' } }, { displayOrder: 'asc' }],
      include: {
        category: { select: { id: true, name: true } },
      },
    })

    return Response.json(items)
  } catch {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
}