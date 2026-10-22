import { Metadata } from 'next'
import { getBusinessSettings, getPublishedCategoriesWithItems, getPublishedCategories } from '@/lib/public-data'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import MenuPageClient from '@/components/MenuPageClient'

export const metadata: Metadata = {
  title: 'Cardápio',
  description: 'Conheça nosso cardápio completo: padaria artesanal, café da manhã, almoço e bebidas.',
}

export default async function MenuPage() {
  const settings = await getBusinessSettings()
  const categories = await getPublishedCategoriesWithItems()
  const allCategories = await getPublishedCategories()

  const businessName = settings?.businessName || 'LOMA'
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
      <MenuPageClient initialCategories={categories} allCategories={allCategories} />
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
