'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X, Phone, Camera } from 'lucide-react'

const navigation = [
  { name: 'Início', href: '/' },
  { name: 'Cardápio', href: '/cardapio' },
  { name: 'Sobre', href: '/sobre' },
  { name: 'Galeria', href: '/galeria' },
  { name: 'Visite-nos', href: '/visite-nos' },
]

interface HeaderProps {
  phone: string
  instagramUrl: string
}

export default function Header({ phone, instagramUrl }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-background/95 backdrop-blur-sm border-b border-border' : 'bg-transparent'
      }`}
      role="banner"
    >
      <nav className="container" aria-label="Navegação principal">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 text-foreground focus-visible:outline-none"
            aria-label="LOMA — Página inicial"
          >
            <span className="font-heading text-2xl font-medium tracking-tight">LOMA</span>
            <span className="hidden sm:inline-block text-xs text-muted-foreground uppercase tracking-wider">
              Cozinha e Padaria Artesanal
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:gap-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 rounded-sm px-2 py-1"
              >
                {item.name}
              </Link>
            ))}
            <a
              href={`tel:${phone.replace(/\s/g, '')}`}
              className="flex items-center gap-1.5 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 rounded-sm px-2 py-1"
              aria-label={`Ligar para ${phone}`}
            >
              <Phone className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">{phone}</span>
            </a>
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            className="md:hidden flex items-center justify-center p-2 rounded-md text-foreground hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
            aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" aria-hidden="true" />
            ) : (
              <Menu className="h-6 w-6" aria-hidden="true" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        <div
          id="mobile-menu"
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            mobileMenuOpen ? 'max-h-96 opacity-100 pb-6' : 'max-h-0 opacity-0'
          }`}
          role="navigation"
          aria-label="Menu mobile"
        >
          <div className="flex flex-col gap-2 pt-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-base font-medium text-foreground/80 hover:text-foreground px-3 py-3 rounded-md transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <div className="flex items-center gap-3 px-3 py-2 border-t border-border mt-2">
              <a
                href={`tel:${phone.replace(/\s/g, '')}`}
                className="flex items-center gap-2 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
                aria-label={`Ligar para ${phone}`}
              >
                <Phone className="h-5 w-5" aria-hidden="true" />
                <span>{phone}</span>
              </a>
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
                aria-label="Instagram do LOMA"
              >
                <Camera className="h-5 w-5" aria-hidden="true" />
                <span>@lomacozinha</span>
              </a>
            </div>
          </div>
        </div>
      </nav>
    </header>
  )
}