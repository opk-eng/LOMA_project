import { requireAdmin } from '@/lib/admin-auth'
import prisma from '@/lib/db'

export async function GET() {
  try {
    await requireAdmin()

    const categories = await prisma.category.findMany({
      orderBy: { displayOrder: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        displayOrder: true,
        published: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { menuItems: true } },
      },
    })

    return Response.json(categories)
  } catch (error) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
}