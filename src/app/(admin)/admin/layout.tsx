import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getAdminSession } from '@/lib/admin-auth'

export const metadata: Metadata = {
  title: 'Painel Administrativo',
  robots: 'noindex, nofollow',
}

const adminNavigation = [
  { name: 'Visão Geral', href: '/admin', icon: 'LayoutDashboard' },
  { name: 'Cardápio', href: '/admin/menu', icon: 'Menu' },
  { name: 'Mídia', href: '/admin/media', icon: 'Image' },
  { name: 'Configurações', href: '/admin/settings', icon: 'Settings' },
]

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getAdminSession()

  if (!session) {
    redirect('/admin/login')
  }

  return (
    <html lang="pt-BR">
      <head>
        <meta name="robots" content="noindex, nofollow" />
      </head>
      <body className="min-h-screen bg-cream-50 font-body">
        <a href="#admin-main" className="skip-link">Pular para o conteúdo principal</a>

        <div className="flex h-screen overflow-hidden">
          {/* Sidebar */}
          <aside
            className="w-64 bg-charcoal-900 text-cream-50 flex flex-col hidden lg:flex border-r border-charcoal-700"
            role="navigation"
            aria-label="Navegação do painel administrativo"
          >
            <div className="p-6 border-b border-charcoal-700">
              <Link href="/admin" className="flex items-center gap-2" aria-label="Painel administrativo LOMA">
                <span className="font-heading text-2xl font-medium">LOMA</span>
                <span className="text-xs text-cream-400 uppercase tracking-wider hidden sm:inline">Admin</span>
              </Link>
            </div>

            <nav className="flex-1 p-4 space-y-1" aria-label="Menu principal">
              {adminNavigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2.5 text-cream-300 hover:text-cream-50 hover:bg-charcoal-800 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                >
                  <span className="text-sm font-medium">{item.name}</span>
                </Link>
              ))}
            </nav>

            <div className="p-4 border-t border-charcoal-700">
              <p className="text-xs text-cream-400 mb-2">Conectado como</p>
              <p className="text-sm font-medium text-cream-50 truncate">{session.email}</p>
              <form action={async () => { 'use server'; const { logoutAction } = await import('@/actions/auth'); await logoutAction(); }} className="mt-3">
                <button type="submit" className="w-full text-left px-3 py-2 text-sm text-cream-400 hover:text-cream-50 hover:bg-charcoal-800 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
                  Sair
                </button>
              </form>
            </div>
          </aside>

          {/* Main Content */}
          <main
            id="admin-main"
            className="flex-1 overflow-y-auto lg:overflow-y-auto"
            role="main"
          >
            {/* Top Bar */}
            <header className="bg-background border-b border-border sticky top-0 z-20">
              <div className="container px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <h2 className="font-heading text-xl font-medium">Painel Administrativo</h2>
                </div>
                <div className="flex items-center gap-4">
                  <a
                    href="/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-charcoal-500 hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 rounded"
                  >
                    Ver site público →
                  </a>
                </div>
              </div>
            </header>

            {/* Page Content */}
            <div className="container px-6 py-8">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  )
}