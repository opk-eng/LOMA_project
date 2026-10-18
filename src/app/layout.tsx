import type { Metadata, Viewport } from 'next'
import { getBusinessSettings } from '@/lib/public-data'

export const metadata: Metadata = {
  title: {
    default: 'LOMA — Cozinha e Padaria Artesanal | Asa Norte, Brasília',
    template: '%s | LOMA',
  },
  description:
    'Cozinha e padaria artesanal em Asa Norte, Brasília. Ingredientes naturais servidos de forma extraordinária.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: '/',
    siteName: 'LOMA — Cozinha e Padaria Artesanal',
    title: 'LOMA — Cozinha e Padaria Artesanal',
    description:
      'Cozinha e padaria artesanal em Asa Norte, Brasília. Ingredientes naturais servidos de forma extraordinária.',
    images: [
      {
        url: '/og-default.jpg',
        width: 1200,
        height: 630,
        alt: 'LOMA — Cozinha e Padaria Artesanal',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LOMA — Cozinha e Padaria Artesanal',
    description:
      'Cozinha e padaria artesanal em Asa Norte, Brasília. Ingredientes naturais servidos de forma extraordinária.',
    images: ['/og-default.jpg'],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fefcf8' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const settings = await getBusinessSettings()

  const structuredData = settings
    ? {
        '@context': 'https://schema.org',
        '@type': 'Restaurant',
        name: settings.businessName,
        description: settings.brandDescription,
        address: {
          '@type': 'PostalAddress',
          streetAddress: settings.address,
        },
        telephone: settings.phone,
        url: process.env.NEXT_PUBLIC_SITE_URL,
        sameAs: settings.instagramUrl ? [settings.instagramUrl] : undefined,
        openingHoursSpecification: [
          { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Monday', opens: settings.mondayOpen, closes: settings.mondayClose },
          { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Tuesday', opens: settings.tuesdayOpen, closes: settings.tuesdayClose },
          { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Wednesday', opens: settings.wednesdayOpen, closes: settings.wednesdayClose },
          { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Thursday', opens: settings.thursdayOpen, closes: settings.thursdayClose },
          { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Friday', opens: settings.fridayOpen, closes: settings.fridayClose },
          { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Saturday', opens: settings.saturdayOpen, closes: settings.saturdayClose },
          { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Sunday', opens: settings.sundayOpen, closes: settings.sundayClose },
        ].filter((h) => h.opens && h.closes),
        servesCuisine: 'Bakery, Brazilian',
        priceRange: '$$',
      }
    : null

  return (
    <html lang="pt-BR" className="h-full antialiased">
      <head>
        {structuredData && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
          />
        )}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <a href="#main-content" className="skip-link">
          Pular para o conteúdo principal
        </a>
        {children}
      </body>
    </html>
  )
}