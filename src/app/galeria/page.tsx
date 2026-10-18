import { Metadata } from 'next'
import { getBusinessSettings, getMediaAssets } from '@/lib/public-data'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronRight, Expand, Instagram } from 'lucide-react'

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
                <li aria-hidden="true"><svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></li>
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

        {/* Gallery Grid */}
        <section className="py-12 md:py-16" aria-labelledby="gallery-content-title">
          <div className="container">
            <h2 id="gallery-content-title" className="sr-only">Imagens da galeria</h2>

            {mediaAssets.length === 0 ? (
              <div className="text-center py-20">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-6">
                  <svg className="h-10 w-10 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="font-heading text-2xl font-medium mb-2">Galeria vazia</h3>
                <p className="text-charcoal-600 mb-6">
                  Ainda não há imagens publicadas. Administradores podem fazer upload no painel.
                </p>
                <div className="bg-terracotta-50 border border-terracotta-200 rounded-lg p-6 max-w-md mx-auto text-left">
                  <p className="text-sm text-terracotta-800 mb-2">
                    <strong>Nota sobre direitos de imagem:</strong> Priorizamos fotografias oficiais da LOMA
                    do Instagram (com autorização) ou fornecidas diretamente pelo estabelecimento.
                  </p>
                  <p className="text-sm text-terracotta-700">
                    Não usamos imagens de outros estabelecimentos nem placeholders como se fossem oficiais.
                    As imagens aqui devem ser autorizadas pelo proprietário.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div
                  className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
                  role="list"
                  aria-label="Imagens da galeria"
                >
                  {mediaAssets.map((asset) => (
                    <article
                      key={asset.id}
                      className="relative aspect-[4/3] overflow-hidden rounded-lg bg-muted group cursor-zoom-in"
                      role="listitem"
                    >
                      <Image
                        src={`/uploads/${asset.fileName}`}
                        alt={asset.altText || `Imagem da galeria LOMA`}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                        <div className="w-full flex justify-between items-end text-white">
                          <span className="text-sm font-medium truncate max-w-[80%]">
                            {asset.altText || 'Imagem LOMA'}
                          </span>
                          <button
                            className="p-2 bg-white/20 backdrop-blur rounded-full text-white hover:bg-white/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                            aria-label={`Ampliar ${asset.altText || 'imagem'}`}
                          >
                            <Expand className="h-5 w-5" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>

                {/* Instagram link */}
                <div className="text-center mt-12 pt-8 border-t border-border">
                  <p className="text-charcoal-600 mb-4">
                    Acompanhe mais no nosso Instagram:
                  </p>
                  <a
                    href={instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline inline-flex items-center gap-2"
                  >
                    <Instagram className="h-5 w-5" aria-hidden="true" />
                    @lomacozinha
                    <ChevronRight className="h-4 w-4" aria-hidden="true" />
                  </a>
                </div>
              </>
            )}
          </div>
        </section>
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