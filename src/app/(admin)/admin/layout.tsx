import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getAdminSession } from '@/lib/admin-auth'
import { ToastProvider } from '@/components/ui/Toast'
import { Menu, LayoutDashboard, Package, ImageIcon, Settings, LogOut } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Painel Administrativo',
  robots: 'noindex, nofollow',
}

const adminNavigation = [
  { name: 'Visão Geral', href: '/admin', icon: LayoutDashboard },
  { name: 'Cardápio', href: '/admin/menu', icon: Package },
  { name: 'Mídia', href: '/admin/media', icon: ImageIcon },
  { name: 'Configurações', href: '/admin/settings', icon: Settings },
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
    <ToastProvider>
      <div className="min-h-screen bg-cream-50 flex">
        {/* Mobile sidebar overlay */}
        <div className="lg:hidden fixed inset-0 z-40 hidden" id="admin-mobile-overlay" aria-hidden="true">
          <div className="absolute inset-0 bg-black/50" id="admin-mobile-backdrop" />
        </div>

        {/* Sidebar */}
        <aside
          className="fixed lg:static inset-y-0 left-0 z-50 w-64 bg-charcoal-900 text-cream-50 flex flex-col transform -translate-x-full lg:translate-x-0 transition-transform duration-300"
          id="admin-sidebar"
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
            {adminNavigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2.5 text-cream-300 hover:text-cream-50 hover:bg-charcoal-800 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                >
                  <Icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                  <span className="text-sm font-medium">{item.name}</span>
                </Link>
              )
            })}
          </nav>

          <div className="p-4 border-t border-charcoal-700">
            <p className="text-xs text-cream-400 mb-2">Conectado como</p>
            <p className="text-sm font-medium text-cream-50 truncate">{session.email}</p>
            <form action={async () => { 'use server'; const { logoutAction } = await import('@/actions/auth'); await logoutAction(); }} className="mt-3">
              <button type="submit" className="w-full flex items-center gap-2 px-3 py-2 text-sm text-cream-400 hover:text-cream-50 hover:bg-charcoal-800 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
                <LogOut className="h-4 w-4" aria-hidden="true" />
                Sair
              </button>
            </form>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
          {/* Top Bar */}
          <header className="bg-background border-b border-border sticky top-0 z-30">
            <div className="px-4 sm:px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Mobile menu button */}
                <button
                  type="button"
                  className="lg:hidden p-2 rounded-md text-charcoal-600 hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                  onClick={() => {
                    const sidebar = document.getElementById('admin-sidebar')
                    const overlay = document.getElementById('admin-mobile-overlay')
                    if (sidebar && overlay) {
                      sidebar.classList.toggle('-translate-x-full')
                      overlay.classList.toggle('hidden')
                      overlay.setAttribute('aria-hidden', overlay.classList.contains('hidden') ? 'true' : 'false')
                    }
                  }}
                  aria-label="Abrir menu de navegação"
                >
                  <Menu className="h-5 w-5" aria-hidden="true" />
                </button>
                <h2 className="font-heading text-xl font-medium">Painel Administrativo</h2>
              </div>
              <div className="flex items-center gap-4">
                <a
                  href="/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-charcoal-500 hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 rounded px-2 py-1"
                >
                  Ver site público →
                </a>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto">
            <div className="container max-w-6xl px-4 sm:px-6 py-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ToastProvider>
  )
}
