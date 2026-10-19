import { Metadata } from 'next'
import { getBusinessSettings } from '@/lib/public-data'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { Wheat, Leaf, Coffee, Heart, MapPin, Phone, Baby } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Sobre Nós',
  description: 'Conheça a história e filosofia da LOMA — Cozinha e Padaria Artesanal em Asa Norte, Brasília.',
}

export default async function AboutPage() {
  const settings = await getBusinessSettings()

  const businessName = settings?.businessName || 'LOMA — Cozinha e Padaria Artesanal'
  const brandDescription =
    settings?.brandDescription ||
    'Somos aficionados por servir o simples de forma extraordinária. O ingrediente, em sua forma natural e pura, como a natureza nos provê, é criativamente servido de maneira bela e deliciosa.'
  const phone = settings?.phone || '+55 61 3326-9714'
  const instagramUrl = settings?.instagramUrl || 'https://www.instagram.com/lomacozinha/'
  const address = settings?.address || 'CLN 303, Bloco B, Loja 6, Asa Norte, Brasília - DF, CEP 70735-520, Brazil'
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

  const values = [
    {
      icon: Wheat,
      title: 'Fermentação Natural',
      description:
        'Nossos pães passam por longas fermentações, desenvolvendo sabores complexos e textura única, sem aditivos artificiais.',
    },
    {
      icon: Leaf,
      title: 'Ingredientes Puros',
      description:
        'Priorizamos produtos locais, orgânicos quando possível, e sazonais. O sabor verdadeiro vem da qualidade da matéria-prima.',
    },
    {
      icon: Coffee,
      title: 'Café de Especialidade',
      description:
        'Grãos selecionados, torra cuidadosa e preparo preciso para extrair o melhor de cada origem.',
    },
    {
      icon: Heart,
      title: 'Feito à Mão',
      description:
        'Cada croissant, cada pão, cada prato é moldado por mãos que conhecem e respeitam o ofício artesanal.',
    },
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
                <li aria-current="page" className="text-foreground font-medium">Sobre Nós</li>
              </ol>
            </nav>
            <h1 className="font-heading text-4xl md:text-5xl font-medium tracking-tight mb-4">Sobre a LOMA</h1>
            <p className="text-lg text-charcoal-600 max-w-2xl">
              Cozinha e padaria artesanal onde o ingrediente é o protagonista.
            </p>
          </div>
        </section>

        {/* Philosophy */}
        <section className="py-16 md:py-24 bg-background" aria-labelledby="philosophy-title">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <span className="text-sm font-medium text-terracotta-600 uppercase tracking-wider mb-3 block">
                Nossa Filosofia
              </span>
              <h2 id="philosophy-title" className="font-heading text-3xl md:text-4xl font-medium tracking-tight mb-6">
                &ldquo;Somos aficionados por servir o simples de forma extraordinária.&rdquo;
              </h2>
              <p className="text-lg text-charcoal-600 text-pretty">
                {brandDescription}
              </p>
            </div>

            <div className="prose prose-charcoal max-w-3xl mx-auto space-y-8 text-charcoal-600">
              <p>
                A LOMA nasceu do desejo de criar um lugar onde a comida honesta encontra o cuidado artesanal.
                Não buscamos a complexidade pela complexidade — buscamos o ponto exato onde a técnica
                desaparece e sobra apenas o sabor.
              </p>
              <p>
                Nossa padaria trabalha com fermentação natural (levain), respeitando os tempos do
                processo. Cada pão leva horas, às vezes dias, entre mistura, repouso, dobras e forno.
                O resultado é uma casca crocante, miolo aberto e aromático, sabor que permanece na memória.
              </p>
              <p>
                Na cozinha, a mesma filosofia: ingredientes tratados com respeito, preparos que realçam
                e não mascaram. Saladas com folhas colhidas na manhã, legumes grelhados no ponto,
                molhos feitos na casa. O menu muda com as estações, acompanhando o que a terra oferece
                de melhor.
              </p>
              <p>
                Acreditamos que comer bem não é luxo — é direito. Por isso mantemos preços justos,
                porções generosas e um ambiente onde todos se sintam bem-vindos: famílias com crianças,
                quem busca opções veganas, quem quer apenas um bom café e um pão quente.
              </p>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-16 md:py-24 bg-cream-50" aria-labelledby="values-title">
          <div className="container">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-sm font-medium text-terracotta-600 uppercase tracking-wider mb-3 block">
                O que nos guia
              </span>
              <h2 id="values-title" className="font-heading text-3xl md:text-4xl font-medium tracking-tight">
                Nossos valores
              </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value) => (
                <article key={value.title} className="card p-8 text-center">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary-light text-primary mb-6">
                    <value.icon className="h-7 w-7" aria-hidden="true" />
                  </div>
                  <h3 className="font-heading text-lg font-medium mb-3">{value.title}</h3>
                  <p className="text-charcoal-600 text-sm">{value.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Services / Features */}
        <section className="py-16 md:py-24 bg-background" aria-labelledby="services-title">
          <div className="container">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-sm font-medium text-terracotta-600 uppercase tracking-wider mb-3 block">
                Serviços
              </span>
              <h2 id="services-title" className="font-heading text-3xl md:text-4xl font-medium tracking-tight">
                Pensado para sua experiência
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <article className="card p-8">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-terracotta-100 flex items-center justify-center">
                    <MapPin className="h-6 w-6 text-terracotta-600" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-heading text-lg font-medium mb-2">Área Externa</h3>
                    <p className="text-charcoal-600">
                      Mesas ao ar livre para aproveitar o clima de Brasília, seja no café da manhã
                      ensolarado ou no fim de tarde.
                    </p>
                  </div>
                </div>
              </article>

              <article className="card p-8">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-sage-100 flex items-center justify-center">
                    <Leaf className="h-6 w-6 text-sage-600" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-heading text-lg font-medium mb-2">Opções Veganas</h3>
                    <p className="text-charcoal-600">
                      Pratos 100% vegetais no cardápio fixo, além de alternativas veganas para
                      vários itens. Consulte nossa equipe.
                    </p>
                  </div>
                </div>
              </article>

              <article className="card p-8">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-brand-blue-100 flex items-center justify-center">
                    <Baby className="h-6 w-6 text-brand-blue-600" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-heading text-lg font-medium mb-2">Menu Infantil</h3>
                    <p className="text-charcoal-600">
                      Opções pensadas para os pequenos: porções adequadas, sabores suaves e
                      ingredientes nutritivos.
                    </p>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* Visit CTA */}
        <section className="py-16 md:py-24 bg-charcoal-900 text-cream-50" aria-labelledby="visit-cta-title">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center">
              <h2 id="visit-cta-title" className="font-heading text-3xl md:text-4xl font-medium tracking-tight mb-6">
                Venha nos conhecer
              </h2>
              <p className="text-cream-300 text-lg mb-10">
                Estamos na Asa Norte, de portas abertas todos os dias. Venha tomar um café,
                experimentar nossos pães ou almoçar conosco.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/visite-nos" className="btn btn-primary btn-lg">
                  <MapPin className="h-5 w-5" aria-hidden="true" />
                  Ver Endereço e Rotas
                </Link>
                <a
                  href={`tel:${phone.replace(/\s/g, '')}`}
                  className="btn btn-outline btn-lg bg-transparent border-cream-300 text-cream-50 hover:bg-cream-100 hover:text-charcoal-900"
                >
                  <Phone className="h-5 w-5" aria-hidden="true" />
                  Ligar: {phone}
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
        weekHours={weekHours}
      />
    </>
  )
}