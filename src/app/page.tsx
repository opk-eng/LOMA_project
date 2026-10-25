import { Metadata } from 'next'
import { getBusinessSettings, getPublishedCategoriesWithItems, getMediaAssets } from '@/lib/public-data'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { ArrowRight, MapPin, Leaf, Coffee, Wheat, Phone } from 'lucide-react'
import Image from 'next/image'
import { AnimatedSection } from '@/components/AnimatedSection'

export const metadata: Metadata = {
  title: 'LOMA — Cozinha e Padaria Artesanal',
  description:
    'Cozinha e padaria artesanal em Asa Norte, Brasília. Ingredientes naturais servidos de forma extraordinária.',
}

export default async function HomePage() {
  const settings = await getBusinessSettings()
  const categories = await getPublishedCategoriesWithItems()
  const mediaAssets = await getMediaAssets()

  const businessName = settings?.businessName || 'LOMA — Cozinha e Padaria Artesanal'
  const brandDescription =
    settings?.brandDescription ||
    'Somos aficionados por servir o simples de forma extraordinária. O ingrediente, em sua forma natural e pura, como a natureza nos provê, é criativamente servido de maneira bela e delicada.'
  const address = settings?.address || 'CLN 303, Bloco B, Loja 6, Asa Norte, Brasília - DF, CEP 70735-520, Brazil'
  const phone = settings?.phone || '+55 61 3326-9714'
  const instagramUrl = settings?.instagramUrl || 'https://www.instagram.com/lomacozinha/'
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

  const categoryPreviews = categories.filter((c) => c.menuItems.length > 0).slice(0, 4)
  const galleryImages = mediaAssets.slice(0, 8)

  return (
    <>
      <Header phone={phone} instagramUrl={instagramUrl} />
      <main id="main-content" className="flex-1">
        {/* Hero Section */}
        <section
          className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-cream-100"
          aria-labelledby="hero-title"
        >
          {/* Decorative background */}
          <div className="absolute inset-0 z-0 hero-bg" aria-hidden="true">
            <div className="hero-blob hero-blob-a left-[6%] top-[12%] h-72 w-72 hidden sm:block" />
            <div className="hero-blob hero-blob-b right-[8%] bottom-[10%] h-80 w-80" style={{ animationDelay: '-11s' }} />
          </div>

          <div className="container relative z-10 py-24 px-4 text-center">
            <div className="max-w-3xl mx-auto">
              <span className="hero-enter inline-flex items-center gap-2 px-4 py-1.5 text-sm font-medium text-primary bg-primary-light rounded-full mb-8 border border-primary/20">
                <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                Asa Norte, Brasília
              </span>
              <h1
                id="hero-title"
                className="hero-enter hero-enter-delay-1 font-heading text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight text-foreground text-balance leading-tight mb-6"
              >
                Somos aficionados por servir o{' '}
                <span className="text-primary">simples</span>{' '}
                de forma{' '}
                <span className="text-primary">extraordinária</span>
              </h1>
              <p className="hero-enter hero-enter-delay-2 text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto text-pretty">
                {brandDescription}
              </p>
              <div className="hero-enter hero-enter-delay-3 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/cardapio"
                  className="btn btn-primary btn-lg w-full sm:w-auto group"
                >
                  Explorar Cardápio
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </Link>
                <Link
                  href="/visite-nos"
                  className="btn btn-outline btn-lg w-full sm:w-auto"
                >
                  <MapPin className="h-5 w-5" aria-hidden="true" />
                  Como Chegar
                </Link>
              </div>
            </div>
          </div>

          {/* Scroll indicator */}
          <div
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
            aria-hidden="true"
          >
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <span className="text-xs uppercase tracking-widest">Scroll</span>
              <div className="w-px h-8 bg-gradient-to-b from-border to-transparent" />
            </div>
          </div>
        </section>

        {/* Philosophy Section */}
        <AnimatedSection
          className="py-20 md:py-28 lg:py-32 bg-background"
          aria-labelledby="philosophy-title"
        >
          <div className="container">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              <div>
                <span className="text-sm font-medium text-primary uppercase tracking-wider mb-3 block">
                  Nossa Filosofia
                </span>
                <h2 id="philosophy-title" className="font-heading text-3xl md:text-4xl font-medium tracking-tight mb-6">
                  O ingrediente, em sua forma natural e pura
                </h2>
                <div className="space-y-4">
                  <p className="text-lg text-muted-foreground">
                    Acreditamos que a verdadeira arte culinária começa no respeito ao ingrediente.
                    Buscamos produtos locais, sazonais e de qualidade excepcional, deixando que
                    seus sabores naturais brilhem em cada preparação.
                  </p>
                  <p className="text-muted-foreground">
                    Nossa cozinha é artesanal no sentido mais profundo: fermentação natural,
                    preparos lentos, técnicas tradicionais adaptadas ao paladar contemporâneo.
                    Cada pão, cada prato, cada bebida carrega o tempo e o cuidado necessários
                    para transformar o simples em extraordinário.
                  </p>
                  <p className="text-muted-foreground">
                    Convidamos você a experimentar essa simplicidade elaborada — um café da manhã
                    demorado, um almoço leve, um pão ainda quente da fornada da manhã.
                  </p>
                </div>
              </div>
              <div className="relative aspect-[4/3] lg:aspect-square">
                <div className="absolute inset-0 panel-gradient rounded-2xl" />
                {/* Elegant placeholder for kitchen photography */}
                <div className="relative h-full flex items-center justify-center rounded-2xl overflow-hidden bg-background/50 backdrop-blur-[2px]">
                  <div className="text-center p-8">
                    <Wheat className="h-16 w-16 mx-auto text-primary/80 mb-4" aria-hidden="true" />
                    <p className="font-heading text-foreground/80 text-base font-medium">
                      Fotografia da cozinha
                    </p>
                    <p className="text-muted-foreground text-sm mt-1">
                      Imagem autorizada pela LOMA
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </AnimatedSection>

        {/* Highlights / Services */}
        <AnimatedSection
          className="py-20 md:py-28 bg-surface"
          aria-labelledby="highlights-title"
        >
          <div className="container">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-sm font-medium text-primary uppercase tracking-wider mb-3 block">
                O que oferecemos
              </span>
              <h2 id="highlights-title" className="font-heading text-3xl md:text-4xl font-medium tracking-tight">
                Experiências pensadas para você
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: Wheat,
                  title: 'Padaria Artesanal',
                  description:
                    'Pães de fermentação natural, croissants folhados, focaccias e doces assados diariamente.',
                },
                {
                  icon: Coffee,
                  title: 'Café da Manhã Completo',
                  description:
                    'Opções nutritivas e saborosas: granola artesanal, ovos beneditinos, frutas da estação.',
                },
                {
                  icon: Leaf,
                  title: 'Opções Veganas & Infantil',
                  description:
                    'Cardápio inclusivo com pratos veganos e menu especial para crianças.',
                },
              ].map((item) => (
                <article
                  key={item.title}
                  className="card p-8 text-center group"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-light text-primary mb-6 group-hover:scale-105 transition-transform duration-300">
                    <item.icon className="h-8 w-8" aria-hidden="true" />
                  </div>
                  <h3 className="font-heading text-xl font-medium mb-3">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </article>
              ))}
            </div>
          </div>
        </AnimatedSection>

        {/* Menu Preview */}
        {categoryPreviews.length > 0 && (
          <AnimatedSection
            className="py-20 md:py-28 bg-background"
            aria-labelledby="menu-preview-title"
          >
            <div className="container">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
                <div>
                  <span className="text-sm font-medium text-primary uppercase tracking-wider mb-3 block">
                    Nosso Cardápio
                  </span>
                  <h2 id="menu-preview-title" className="font-heading text-3xl md:text-4xl font-medium tracking-tight">
                    Sabores da casa
                  </h2>
                </div>
                <Link
                  href="/cardapio"
                  className="btn btn-outline self-start group link-underline"
                >
                  Ver Cardápio Completo
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </Link>
              </div>

              <div className="grid-auto-fit">
                {categoryPreviews.map((category) => (
                  <article key={category.id} className="card overflow-hidden">
                    <div className="p-6">
                      <h3 className="font-heading text-xl font-medium mb-2">{category.name}</h3>
                      {category.description && (
                        <p className="text-muted-foreground text-sm mb-4">{category.description}</p>
                      )}
                      <ul className="space-y-3" role="list">
                        {category.menuItems.slice(0, 3).map((item) => (
                          <li key={item.id} className="flex justify-between items-baseline gap-4">
                            <div>
                              <span className="font-medium text-foreground">{item.name}</span>
                              {item.description && (
                                <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">{item.description}</p>
                              )}
                              <div className="flex flex-wrap gap-2 mt-1">
                                {item.isVegan && (
                                  <span className="tag tag-vegan">
                                    Vegano
                                  </span>
                                )}
                                {item.isChildFriendly && (
                                  <span className="tag tag-child">
                                    Infantil
                                  </span>
                                )}
                              </div>
                            </div>
                            <span className="font-medium text-primary whitespace-nowrap">
                              R$ {item.formattedPrice}
                            </span>
                          </li>
                        ))}
                        {category.menuItems.length > 3 && (
                          <li className="text-center pt-2 border-t border-border">
                            <Link
                              href={`/cardapio#${category.slug}`}
                              className="text-sm text-primary hover:text-primary-hover font-medium link-underline"
                            >
                              + {category.menuItems.length - 3} itens
                            </Link>
                          </li>
                        )}
                      </ul>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </AnimatedSection>
        )}

        {/* Gallery Preview */}
        <AnimatedSection
          className="py-20 md:py-28 bg-surface"
          aria-labelledby="gallery-preview-title"
        >
          <div className="container">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-sm font-medium text-primary uppercase tracking-wider mb-3 block">
                Galeria
              </span>
              <h2 id="gallery-preview-title" className="font-heading text-3xl md:text-4xl font-medium tracking-tight">
                Momentos LOMA
              </h2>
            </div>
            {galleryImages.length > 0 ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {galleryImages.map((asset) => (
                    <Link
                      key={asset.id}
                      href="/galeria"
                      className="aspect-square relative overflow-hidden rounded-lg group cursor-pointer img-shimmer"
                    >
                      <Image
                        src={`/uploads/${asset.fileName}`}
                        alt={asset.altText || `Imagem da galeria LOMA`}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 25vw, 25vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                    </Link>
                  ))}
                </div>
                <div className="text-center mt-10">
                  <Link href="/galeria" className="btn btn-outline group link-underline">
                    Ver Galeria Completa
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                  </Link>
                </div>
              </>
            ) : (
              /* Fallback gradient grid when no images are available */
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="aspect-square relative overflow-hidden rounded-lg bg-muted group cursor-pointer img-shimmer"
                  >
                    <div className="absolute inset-0 panel-gradient transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-xs font-medium">
                      Foto {idx + 1}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </AnimatedSection>

        {/* Visit CTA */}
        <AnimatedSection
          className="py-20 md:py-28 bg-cta-band text-cta-band-foreground"
          aria-labelledby="visit-title"
        >
          <div className="container">
            <div className="max-w-3xl mx-auto text-center">
              <h2 id="visit-title" className="font-heading text-3xl md:text-4xl font-medium tracking-tight mb-6">
                Venha nos visitar
              </h2>
              <p className="text-cta-band-soft text-lg mb-10">
                Estamos de portas abertas todos os dias, das 7h30 às 22h.
                Venha tomar um café, experimentar nossos pães ou almoçar conosco.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/visite-nos" className="btn btn-primary btn-lg group link-underline">
                  <MapPin className="h-5 w-5" aria-hidden="true" />
                  Ver Endereço e Rotas
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </Link>
                <a
                  href={`tel:${phone.replace(/\s/g, '')}`}
                  className="btn btn-band btn-lg"
                >
                  <Phone className="h-5 w-5" aria-hidden="true" />
                  Ligar: {phone}
                </a>
              </div>
            </div>
          </div>
        </AnimatedSection>
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
