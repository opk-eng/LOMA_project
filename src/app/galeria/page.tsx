import { Metadata } from 'next'
import { getBusinessSettings, getMediaAssets } from '@/lib/public-data'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import GalleryClient from '@/components/GalleryClient'

export const metadata: Metadata = {
  title: 'Galeria',
  description: 'Fotos da LOMA — Cozinha e Padaria Artesanal: ambiente, pratos, pães e detalhes.',
}

export default async function GalleryPage() {
  const settings = await getBusinessSettings()
  const mediaAssets = await getMediaAssets()

  const businessName = settings?.businessName || 'LOMA — Cozinha e Padaria Artesanal'
  const phone = settings?.phone || '+55 61 3326-9714'
  const instagramUrl = settings?.instagramUrl || 'https://www.instagram.com/lomacozinha/'
  const brandDescription = settings?.brandDescription || ''
  const address = settings?.address || ''
  const weekHours = settings
    ? [
        { label: 'Segunda', formatted: `${settings.mondayOpen}–${settings.mondayClose}` },
        { label: 'Terça', formatted: `${settings.tuesdayOpen}–${settings.tuesdayClose}` },
        { label: 'Quarta', formatted: `${settings.wednesdayOpen}–${settings.wednesdayClose}` },
        { label: 'Quinta', formatted: `${settings.thursdayOpen}–${settings.thursdayClose}` },
        { label: 'Sexta', formatted: `${settings.fridayOpen}–${settings.fridayClose}` },
        { label: 'Sábado', formatted: `${settings.saturdayOpen}–${settings.saturdayClose}` },
        { label: 'Domingo', formatted: `${settings.sundayOpen}–${settings.sundayClose}` },
      ].filter((d) => d.formatted !== '–')
    : []

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
                <li aria-hidden="true"><ChevronRight className="h-4 w-4" /></li>
                <li aria-current="page" className="text-foreground font-medium">Galeria</li>
              </ol>
            </nav>
            <h1 className="font-heading text-4xl md:text-5xl font-medium tracking-tight mb-4">Galeria</h1>
            <p className="text-lg text-charcoal-600 max-w-2xl">
              Momentos, detalhes e sabores da LOMA. Todas as imagens são de autoria própria ou
              usadas com autorização.
            </p>
          </div>
        </section>

        <GalleryClient initialAssets={mediaAssets} />
      </main>
      <Footer
        businessName={businessName}
        brandDescription={brandDescription}
        address={address}
        phone={phone}
        instagramUrl={instagramUrl}
        weekHours={weekHours}
      />
    </>
  )
}
