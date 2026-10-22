import Link from 'next/link'
import { MapPin, Phone, Camera, ArrowRight } from 'lucide-react'
import Logo from '@/components/Logo'

interface FooterProps {
  businessName: string
  brandDescription: string
  address: string
  phone: string
  instagramUrl: string
  weekHours: Array<{ label: string; formatted: string }>
}

export default function Footer({
  businessName,
  brandDescription,
  address,
  phone,
  instagramUrl,
  weekHours,
}: FooterProps) {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-charcoal-900 text-cream-100" role="contentinfo">
      <div className="container py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Logo className="mb-6" showTagline />
            <p className="text-cream-400 text-sm leading-relaxed max-w-xs">
              {brandDescription || 'Cozinha e padaria artesanal em Asa Norte, Brasília.'}
            </p>
            <div className="flex gap-3 mt-6">
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-full bg-cream-100/10 text-cream-300 hover:text-cream-50 hover:bg-cream-100/20 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta-400"
                aria-label="Instagram do LOMA"
              >
                <Camera className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-heading text-base font-medium text-cream-50 mb-4 uppercase tracking-wider text-xs">
              Contato
            </h3>
            <address className="not-italic text-sm text-cream-400 space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-terracotta-400 mt-0.5 flex-shrink-0" aria-hidden="true" />
                <span>{address}</span>
              </div>
              <a
                href={`tel:${phone.replace(/\s/g, '')}`}
                className="flex items-center gap-3 text-cream-400 hover:text-cream-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta-400 rounded-sm px-1 -mx-1"
              >
                <Phone className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                <span>{phone}</span>
              </a>
            </address>
          </div>

          {/* Hours */}
          <div>
            <h3 className="font-heading text-base font-medium text-cream-50 mb-4 uppercase tracking-wider text-xs">
              Horário de Funcionamento
            </h3>
            <dl className="text-sm text-cream-400 space-y-1.5">
              {weekHours.map((day) => (
                <div key={day.label} className="flex justify-between gap-4">
                  <dt className="font-medium text-cream-300">{day.label}</dt>
                  <dd className="text-right whitespace-nowrap font-mono text-xs">{day.formatted}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="font-heading text-base font-medium text-cream-50 mb-4 uppercase tracking-wider text-xs">
              Navegação
            </h3>
            <nav aria-label="Navegação do rodapé">
              <ul className="space-y-2">
                {[
                  { name: 'Início', href: '/' },
                  { name: 'Cardápio', href: '/cardapio' },
                  { name: 'Sobre Nós', href: '/sobre' },
                  { name: 'Galeria', href: '/galeria' },
                  { name: 'Visite-nos', href: '/visite-nos' },
                ].map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-sm text-cream-400 hover:text-cream-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta-400 rounded-sm px-1 -mx-1 inline-flex items-center gap-1.5 py-1"
                    >
                      {item.name}
                      <ArrowRight className="h-3 w-3" aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-cream-100/10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <p className="text-sm text-cream-500">
              © {currentYear} {businessName}. Todos os direitos reservados.
            </p>
            <p className="text-sm text-cream-500">
              Feito com cuidado em Brasília
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
