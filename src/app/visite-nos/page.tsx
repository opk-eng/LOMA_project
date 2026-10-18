import { Metadata } from 'next'
import { getBusinessSettings, getDirectionsUrl, getTodaysHours } from '@/lib/public-data'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { MapPin, Phone, Instagram, Clock, CheckCircle, ChevronRight, ArrowRight, ExternalLink } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Visite-nos',
  description: 'Endereço, horário de funcionamento, telefone e rotas para a LOMA — Cozinha e Padaria Artesanal em Asa Norte, Brasília.',
}

export default async function VisitPage() {
  const settings = await getBusinessSettings()

  const businessName = settings?.businessName || 'LOMA — Cozinha e Padaria Artesanal'
  const phone = settings?.phone || '+55 61 3326-9714'
  const instagramUrl = settings?.instagramUrl || 'https://www.instagram.com/lomacozinha/'
  const brandDescription = settings?.brandDescription || ''
  const address = settings?.address || 'CLN 303, Bloco B, Loja 6, Asa Norte, Brasília - DF, CEP 70735-520, Brazil'
  const weekHours = settings
    ? [
        { label: 'Segunda-feira', open: settings.mondayOpen, close: settings.mondayClose, formatted: `${settings.mondayOpen}–${settings.mondayClose}` },
        { label: 'Terça-feira', open: settings.tuesdayOpen, close: settings.tuesdayClose, formatted: `${settings.tuesdayOpen}–${settings.tuesdayClose}` },
        { label: 'Quarta-feira', open: settings.wednesdayOpen, close: settings.wednesdayClose, formatted: `${settings.wednesdayOpen}–${settings.wednesdayClose}` },
        { label: 'Quinta-feira', open: settings.thursdayOpen, close: settings.thursdayClose, formatted: `${settings.thursdayOpen}–${settings.thursdayClose}` },
        { label: 'Sexta-feira', open: settings.fridayOpen, close: settings.fridayClose, formatted: `${settings.fridayOpen}–${settings.fridayClose}` },
        { label: 'Sábado', open: settings.saturdayOpen, close: settings.saturdayClose, formatted: `${settings.saturdayOpen}–${settings.saturdayClose}` },
        { label: 'Domingo', open: settings.sundayOpen, close: settings.sundayClose, formatted: `${settings.sundayOpen}–${settings.sundayClose}` },
      ].filter((d) => d.open && d.close)
    : []

  const todaysHours = settings ? getTodaysHours(settings) : null
  const directionsUrl = getDirectionsUrl(address)

  const services = [
    { icon: CheckCircle, title: 'Área externa', description: 'Mesas ao ar livre disponíveis' },
    { icon: CheckCircle, title: 'Opções veganas', description: 'Pratos 100% vegetais no cardápio' },
    { icon: CheckCircle, title: 'Menu infantil', description: 'Opções pensadas para crianças' },
  ]

  return (
    <>
      <Header phone={phone} instagramUrl={instagramUrl} />
      <main id="main-content" className="flex-1 pt-16">
        {/* Page Header */}
        <section className="bg-cream-100 py-16 md:py-24">
          <div className="container">
            <nav aria-label="Breadcrumb" className="mb-8">
              <ol className="flex items-center gap-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/" className="hover:text-foreground transition-colors">Início</Link>
                </li>
                <li aria-hidden="true"><svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></li>
                <li aria-current="page" className="text-foreground font-medium">Visite-nos</li>
              </ol>
            </nav>
            <h1 className="font-heading text-4xl md:text-5xl font-medium tracking-tight mb-4">Venha nos visitar</h1>
            <p className="text-lg text-charcoal-600 max-w-2xl">
              Estamos na Asa Norte, de portas abertas todos os dias. Venha tomar um café,
              experimentar nossos pães ou almoçar conosco.
            </p>
          </div>
        </section>

        {/* Main Info Grid */}
        <section className="py-12 md:py-16 bg-background" aria-labelledby="visit-info-title">
          <div className="container">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
              {/* Address & Contact */}
              <div>
                <h2 id="visit-info-title" className="font-heading text-2xl md:text-3xl font-medium mb-8">Onde estamos</h2>

                <address className="space-y-6 not-italic">
                  <div>
                    <h3 className="font-heading text-lg font-medium mb-2 flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-primary" aria-hidden="true" />
                      Endereço
                    </h3>
                    <p className="text-charcoal-600">{address}</p>
                  </div>

                  <div>
                    <h3 className="font-heading text-lg font-medium mb-2 flex items-center gap-2">
                      <Phone className="h-5 w-5 text-primary" aria-hidden="true" />
                      Telefone
                    </h3>
                    <a
                      href={`tel:${phone.replace(/\s/g, '')}`}
                      className="text-charcoal-600 hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 rounded-sm inline-flex items-center gap-2"
                    >
                      {phone}
                    </a>
                  </div>

                  <div>
                    <h3 className="font-heading text-lg font-medium mb-2 flex items-center gap-2">
                      <Instagram className="h-5 w-5 text-primary" aria-hidden="true" />
                      Instagram
                    </h3>
                    <a
                      href={instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-charcoal-600 hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 rounded-sm inline-flex items-center gap-2"
                    >
                      @lomacozinha
                      <ExternalLink className="h-4 w-4" aria-hidden="true" />
                    </a>
                  </div>
                </address>

                {/* Directions button */}
                <div className="mt-8 pt-8 border-t border-border">
                  <a
                    href={directionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary w-full sm:w-auto inline-flex items-center justify-center gap-2"
                  >
                    <MapPin className="h-5 w-5" aria-hidden="true" />
                    Abrir no Google Maps
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </a>
                  <p className="text-sm text-muted-foreground mt-3 text-center sm:text-left">
                    Abre no Google Maps com rota traçada até a LOMA
                  </p>
                </div>
              </div>

              {/* Hours & Status */}
              <div>
                <h2 className="font-heading text-2xl md:text-3xl font-medium mb-8">Horário de funcionamento</h2>

                {/* Today status */}
                {todaysHours && (
                  <div className="card p-6 mb-8" style={{ borderColor: todaysHours.isOpen ? 'var(--color-sage-300)' : 'var(--color-terracotta-300)' }}>
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          todaysHours.isOpen ? 'bg-sage-500' : 'bg-terracotta-500'
                        }`}
                        aria-hidden="true"
                      />
                      <span className="font-medium text-lg">
                        {todaysHours.isOpen ? 'Aberto agora' : 'Fechado no momento'}
                      </span>
                    </div>
                    <p className="text-charcoal-600">
                      {todaysHours.isOpen
                        ? `Aberto até ${todaysHours.close} (horário de Brasília)`
                        : `Abre hoje às ${todaysHours.open} (horário de Brasília)`}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      * Horário baseado no fuso de Brasília (UTC-3). Confira por telefone em feriados.
                    </p>
                  </div>
                )}

                {/* Weekly hours */}
                <dl className="space-y-3" role="list">
                  {weekHours.map((day) => (
                    <div
                      key={day.label}
                      className="flex items-center justify-between py-3 px-4 bg-cream-50 rounded-lg"
                      role="listitem"
                    >
                      <dt className="font-medium text-charcoal-900">{day.label}</dt>
                      <dd className="font-medium text-primary whitespace-nowrap">{day.formatted}</dd>
                    </div>
                  ))}
                </dl>

                <p className="text-sm text-muted-foreground mt-6 text-center">
                  Funcionamos todos os dias, inclusive feriados (consulte por telefone).
                </p>
              </div>
            </div>

            {/* Services */}
            <div className="mt-16 pt-16 border-t border-border">
              <h3 className="font-heading text-xl font-medium mb-8 text-center">Serviços disponíveis</h3>
              <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
                {services.map((service) => (
                  <article key={service.title} className="card p-6 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-sage-100 text-sage-600 mb-4">
                      <service.icon className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <h4 className="font-heading text-lg font-medium mb-2">{service.title}</h4>
                    <p className="text-charcoal-600 text-sm">{service.description}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Map placeholder / CTA */}
        <section className="py-16 md:py-24 bg-cream-50" aria-labelledby="map-title">
          <div className="container">
            <div className="text-center max-w-2xl mx-auto">
              <h2 id="map-title" className="font-heading text-3xl md:text-4xl font-medium tracking-tight mb-6">
                Fácil de chegar
              </h2>
              <p className="text-charcoal-600 text-lg mb-10">
                Estamos na CLN 303, Bloco B, Loja 6 — no coração da Asa Norte.
                Próximo à W3 Norte, com estacionamento rotativo na rua e acesso fácil de transporte público.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href={directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary btn-lg"
                >
                  <MapPin className="h-5 w-5" aria-hidden="true" />
                  Traçar Rota no Google Maps
                </a>
                <Link href="/cardapio" className="btn btn-outline btn-lg">
                  Ver Cardápio Antes de Vir
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Map embed placeholder */}
        <section className="py-16 bg-charcoal-900" aria-labelledby="map-embed-title">
          <div className="container">
            <div className="aspect-video bg-charcoal-800 rounded-xl flex items-center justify-center relative overflow-hidden">
              <div className="text-center text-cream-50 p-8">
                <MapPin className="h-16 w-16 mx-auto text-terracotta-400 mb-4" aria-hidden="true" />
                <h3 className="font-heading text-2xl font-medium mb-2">Mapa interativo</h3>
                <p className="text-cream-400 mb-6 max-w-md mx-auto">
                  Para uma experiência mais leve e respeitando sua privacidade, usamos um link direto
                  para o Google Maps em vez de incorporar o mapa pesado.
                </p>
                <a
                  href={directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline btn-lg border-cream-300 text-cream-50 hover:bg-cream-100 hover:text-charcoal-900 inline-flex items-center gap-2"
                >
                  <ExternalLink className="h-5 w-5" aria-hidden="true" />
                  Abrir no Google Maps
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer
        businessName={businessName}
        brandDescription={brandDescription}
        address={address}
        phone={phone}
        instagramUrl={instagramUrl}
        weekHours={weekHours.map((d) => ({ label: d.label, formatted: d.formatted }))}
      />
    </>
  )
}