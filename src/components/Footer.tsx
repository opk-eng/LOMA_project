import Link from 'next/link'
import { MapPin, Phone, Instagram, Clock, ArrowRight } from 'lucide-react'

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
    <footer className="bg-muted/50 border-t border-border" role="contentinfo">
      <div className="container py-16 lg:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="block mb-6" aria-label={`${businessName} — Página inicial`}>
              <span className="font-heading text-3xl font-medium tracking-tight">LOMA</span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
              {brandDescription}
            </p>
            <div className="flex gap-4 mt-6">
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 rounded-full p-1"
                aria-label="Instagram do LOMA"
              >
                <Instagram className="h-5 w-5" aria-hidden="true" />
              </a>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-heading text-lg font-medium mb-4">Contato</h3>
            <address className="not-italic text-sm text-muted-foreground space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" aria-hidden="true" />
                <span>{address}</span>
              </div>
              <a
                href={`tel:${phone.replace(/\s/g, '')}`}
                className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 rounded-sm"
              >
                <Phone className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                <span>{phone}</span>
              </a>
            </address>
          </div>

          {/* Hours */}
          <div>
            <h3 className="font-heading text-lg font-medium mb-4">Horário de Funcionamento</h3>
            <dl className="text-sm text-muted-foreground space-y-2">
              {weekHours.map((day) => (
                <div key={day.label} className="flex justify-between gap-4">
                  <dt className="font-medium text-foreground">{day.label}</dt>
                  <dd className="text-right whitespace-nowrap">{day.formatted}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="font-heading text-lg font-medium mb-4">Navegação</h3>
            <nav aria-label="Navegação do rodapé">
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 rounded-sm inline-flex items-center gap-1"
                  >
                    Início
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                </li>
                <li>
                  <Link
                    href="/cardapio"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 rounded-sm inline-flex items-center gap-1"
                  >
                    Cardápio
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                </li>
                <li>
                  <Link
                    href="/sobre"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 rounded-sm inline-flex items-center gap-1"
                  >
                    Sobre Nós
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                </li>
                <li>
                  <Link
                    href="/galeria"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 rounded-sm inline-flex items-center gap-1"
                  >
                    Galeria
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                </li>
                <li>
                  <Link
                    href="/visite-nos"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 rounded-sm inline-flex items-center gap-1"
                  >
                    Visite-nos
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © {currentYear} {businessName}. Todos os direitos reservados.
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Feito com cuidado em Brasília</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}