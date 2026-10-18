import { Metadata } from 'next'
import prisma from '@/lib/db'
import Link from 'next/link'
import { Plus, Menu, Image, Settings, Eye, ChevronRight, Package, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export const metadata: Metadata = {
  title: 'Visão Geral',
  robots: 'noindex, nofollow',
}

interface StatCardProps {
  title: string
  value: number | string
  description?: string
  icon: React.ReactNode
  href?: string
  variant?: 'default' | 'success' | 'warning'
}

function StatCard({ title, value, description, icon, href, variant = 'default' }: StatCardProps) {
  const baseClass = 'card p-6'
  const variantClasses = {
    default: 'border-border',
    success: 'border-sage-300 bg-sage-50',
    warning: 'border-terracotta-300 bg-terracotta-50',
  }

  return (
    <article className={`${baseClass} ${variantClasses[variant]}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-charcoal-500 mb-1">{title}</p>
          <p className="font-heading text-3xl font-medium text-charcoal-900">{value}</p>
          {description && <p className="text-sm text-charcoal-500 mt-1">{description}</p>}
        </div>
        <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary-light flex items-center justify-center text-primary">
          {icon}
        </div>
      </div>
      {href && (
        <div className="mt-4 pt-4 border-t border-border">
          <Link
            href={href}
            className="text-sm font-medium text-primary hover:text-primary-hover flex items-center gap-1"
          >
            Ver detalhes
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      )}
    </article>
  )
}

export default async function AdminDashboardPage() {
  const [
    categoriesCount,
    itemsCount,
    publishedItemsCount,
    unpublishedItemsCount,
    mediaCount,
    recentCategories,
    recentItems,
  ] = await Promise.all([
    prisma.category.count(),
    prisma.menuItem.count(),
    prisma.menuItem.count({ where: { published: true } }),
    prisma.menuItem.count({ where: { published: false } }),
    prisma.mediaAsset.count(),
    prisma.category.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, slug: true, published: true, createdAt: true, _count: { select: { menuItems: true } } },
    }),
    prisma.menuItem.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, slug: true, published: true, available: true, category: { select: { name: true } }, createdAt: true },
    }),
  ])

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-medium">Visão Geral</h1>
          <p className="text-charcoal-600 mt-1">Acompanhe o status do seu conteúdo</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/menu?tab=categories" className="btn btn-primary">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Nova Categoria
          </Link>
          <Link href="/admin/menu?tab=items" className="btn btn-secondary">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Novo Item
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6" role="list" aria-label="Estatísticas">
        <StatCard
          title="Categorias"
          value={categoriesCount}
          description={`${publishedItemsCount > 0 ? 'com itens publicados' : ''}`}
          icon={<Package className="h-6 w-6" aria-hidden="true" />}
          href="/admin/menu?tab=categories"
        />
        <StatCard
          title="Itens no Cardápio"
          value={itemsCount}
          description={`${publishedItemsCount} publicados, ${unpublishedItemsCount} rascunhos`}
          icon={<Menu className="h-6 w-6" aria-hidden="true" />}
          href="/admin/menu?tab=items"
          variant={unpublishedItemsCount > 0 ? 'warning' : 'success'}
        />
        <StatCard
          title="Imagens na Galeria"
          value={mediaCount}
          description={mediaCount === 0 ? 'Adicione fotos do estabelecimento' : ''}
          icon={<Image className="h-6 w-6" aria-hidden="true" />}
          href="/admin/media"
          variant={mediaCount === 0 ? 'warning' : 'default'}
        />
        <StatCard
          title="Configurações"
          value="1"
          description="Informações do estabelecimento"
          icon={<Settings className="h-6 w-6" aria-hidden="true" />}
          href="/admin/settings"
        />
      </div>

      {/* Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Categories */}
        <section className="card" aria-labelledby="recent-categories-title">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <h2 id="recent-categories-title" className="font-heading text-lg font-medium">Categorias Recentes</h2>
            <Link href="/admin/menu?tab=categories" className="text-sm text-primary hover:text-primary-hover">
              Ver todas
            </Link>
          </div>
          <div className="divide-y divide-border">
            {recentCategories.length === 0 ? (
              <div className="p-6 text-center text-charcoal-500">
                <Package className="h-12 w-12 mx-auto text-charcoal-300 mb-3" aria-hidden="true" />
                <p>Nenhuma categoria criada ainda</p>
                <Link href="/admin/menu?tab=categories" className="text-primary hover:text-primary-hover text-sm mt-2 inline-block">
                  Criar primeira categoria →
                </Link>
              </div>
            ) : (
              recentCategories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/admin/menu?tab=categories&edit=${cat.id}`}
                  className="block p-4 hover:bg-cream-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-2.5 h-2.5 rounded-full ${cat.published ? 'bg-sage-500' : 'bg-charcoal-300'}`} aria-hidden="true" />
                      <div>
                        <p className="font-medium text-charcoal-900">{cat.name}</p>
                        <p className="text-xs text-charcoal-500">{cat._count.menuItems} itens • {cat.published ? 'Publicada' : 'Rascunho'}</p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-charcoal-300" aria-hidden="true" />
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>

        {/* Recent Items */}
        <section className="card" aria-labelledby="recent-items-title">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <h2 id="recent-items-title" className="font-heading text-lg font-medium">Itens Recentes</h2>
            <Link href="/admin/menu?tab=items" className="text-sm text-primary hover:text-primary-hover">
              Ver todos
            </Link>
          </div>
          <div className="divide-y divide-border">
            {recentItems.length === 0 ? (
              <div className="p-6 text-center text-charcoal-500">
                <Menu className="h-12 w-12 mx-auto text-charcoal-300 mb-3" aria-hidden="true" />
                <p>Nenhum item criado ainda</p>
                <Link href="/admin/menu?tab=items" className="text-primary hover:text-primary-hover text-sm mt-2 inline-block">
                  Criar primeiro item →
                </Link>
              </div>
            ) : (
              recentItems.map((item) => (
                <Link
                  key={item.id}
                  href={`/admin/menu?tab=items&edit=${item.id}`}
                  className="block p-4 hover:bg-cream-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`w-2.5 h-2.5 rounded-full ${item.published ? 'bg-sage-500' : 'bg-charcoal-300'}`} aria-hidden="true" />
                      <div className="min-w-0">
                        <p className="font-medium text-charcoal-900 truncate">{item.name}</p>
                        <p className="text-xs text-charcoal-500">
                          {item.category.name} • {item.published ? 'Publicado' : 'Rascunho'} • {item.available ? 'Disponível' : 'Indisponível'}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-charcoal-300" aria-hidden="true" />
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>
      </div>

      {/* Quick Actions */}
      <section className="card" aria-labelledby="quick-actions-title">
        <div className="p-6 border-b border-border">
          <h2 id="quick-actions-title" className="font-heading text-lg font-medium">Ações Rápidas</h2>
        </div>
        <div className="p-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/admin/menu?tab=categories&new=true" className="btn btn-outline h-auto py-4 flex flex-col items-center gap-2">
              <Package className="h-6 w-6" aria-hidden="true" />
              <span>Nova Categoria</span>
            </Link>
            <Link href="/admin/menu?tab=items&new=true" className="btn btn-outline h-auto py-4 flex flex-col items-center gap-2">
              <Menu className="h-6 w-6" aria-hidden="true" />
              <span>Novo Item do Cardápio</span>
            </Link>
            <Link href="/admin/media" className="btn btn-outline h-auto py-4 flex flex-col items-center gap-2">
              <Image className="h-6 w-6" aria-hidden="true" />
              <span>Gerenciar Imagens</span>
            </Link>
            <Link href="/admin/settings" className="btn btn-outline h-auto py-4 flex flex-col items-center gap-2">
              <Settings className="h-6 w-6" aria-hidden="true" />
              <span>Configurações do Site</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}