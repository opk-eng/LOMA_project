'use client'

import { useState, useEffect } from 'react'
import { updateSettingsAction, updateOgImageAction } from '@/actions/settings'
import { uploadImageAction } from '@/actions/media'
import { getBusinessSettings } from '@/lib/public-data'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Save, Loader2, Upload, CheckCircle, AlertCircle, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import Image from 'next/image'

const days = [
  { key: 'monday', label: 'Segunda-feira' },
  { key: 'tuesday', label: 'Terça-feira' },
  { key: 'wednesday', label: 'Quarta-feira' },
  { key: 'thursday', label: 'Quinta-feira' },
  { key: 'friday', label: 'Sexta-feira' },
  { key: 'saturday', label: 'Sábado' },
  { key: 'sunday', label: 'Domingo' },
]

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<{
    businessName: string
    brandDescription: string
    address: string
    phone: string
    instagramUrl: string
    mondayOpen: string
    mondayClose: string
    tuesdayOpen: string
    tuesdayClose: string
    wednesdayOpen: string
    wednesdayClose: string
    thursdayOpen: string
    thursdayClose: string
    fridayOpen: string
    fridayClose: string
    saturdayOpen: string
    saturdayClose: string
    sundayOpen: string
    sundayClose: string
    hasOutdoorSeating: boolean
    hasVeganOptions: boolean
    hasChildMenu: boolean
    seoTitle: string
    seoDescription: string
    ogImagePath: string
  }>({
    businessName: '',
    brandDescription: '',
    address: '',
    phone: '',
    instagramUrl: '',
    mondayOpen: '07:30', mondayClose: '22:00',
    tuesdayOpen: '07:30', tuesdayClose: '22:00',
    wednesdayOpen: '07:30', wednesdayClose: '22:00',
    thursdayOpen: '07:30', thursdayClose: '22:00',
    fridayOpen: '07:30', fridayClose: '22:00',
    saturdayOpen: '07:30', saturdayClose: '22:00',
    sundayOpen: '07:30', sundayClose: '22:00',
    hasOutdoorSeating: true,
    hasVeganOptions: true,
    hasChildMenu: true,
    seoTitle: '',
    seoDescription: '',
    ogImagePath: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [ogUploading, setOgUploading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Mount-time fetch: setState only inside promise callbacks so we never
  // update state synchronously in the effect body (avoids cascading renders).
  useEffect(() => {
    let ignore = false
    getBusinessSettings()
      .then((data) => {
        if (ignore || !data) return
        setSettings({
          businessName: data.businessName,
          brandDescription: data.brandDescription,
          address: data.address,
          phone: data.phone,
          instagramUrl: data.instagramUrl,
          mondayOpen: data.mondayOpen ?? '07:30',
          mondayClose: data.mondayClose ?? '22:00',
          tuesdayOpen: data.tuesdayOpen ?? '07:30',
          tuesdayClose: data.tuesdayClose ?? '22:00',
          wednesdayOpen: data.wednesdayOpen ?? '07:30',
          wednesdayClose: data.wednesdayClose ?? '22:00',
          thursdayOpen: data.thursdayOpen ?? '07:30',
          thursdayClose: data.thursdayClose ?? '22:00',
          fridayOpen: data.fridayOpen ?? '07:30',
          fridayClose: data.fridayClose ?? '22:00',
          saturdayOpen: data.saturdayOpen ?? '07:30',
          saturdayClose: data.saturdayClose ?? '22:00',
          sundayOpen: data.sundayOpen ?? '07:30',
          sundayClose: data.sundayClose ?? '22:00',
          hasOutdoorSeating: data.hasOutdoorSeating,
          hasVeganOptions: data.hasVeganOptions,
          hasChildMenu: data.hasChildMenu,
          seoTitle: data.seoTitle ?? '',
          seoDescription: data.seoDescription ?? '',
          ogImagePath: data.ogImagePath ?? '',
        })
      })
      .catch((error) => {
        if (!ignore) console.error('Failed to fetch settings:', error)
      })
      .finally(() => {
        if (!ignore) setLoading(false)
      })
    return () => { ignore = true }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    const formData = new FormData()
    Object.entries(settings).forEach(([key, value]) => {
      if (typeof value === 'boolean') {
        formData.append(key, value ? 'on' : '')
      } else {
        formData.append(key, value)
      }
    })

    const result = await updateSettingsAction({ success: false, error: '' }, formData)
    setSaving(false)

    if (result.success) {
      setMessage({ type: 'success', text: 'Configurações salvas com sucesso!' })
    } else {
      setMessage({ type: 'error', text: result.error || 'Erro ao salvar configurações.' })
    }
  }

  const handleOgImageUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fileInput = e.currentTarget.elements.namedItem('ogImage') as HTMLInputElement
    if (!fileInput.files?.[0]) return

    const formData = new FormData()
    formData.append('image', fileInput.files[0])
    formData.append('altText', 'Imagem de compartilhamento social LOMA')
    formData.append('attribution', 'LOMA')

    setOgUploading(true)
    const result = await uploadImageAction({ success: false, error: '' }, formData)
    setOgUploading(false)

    if (result.success) {
      const ogResult = await updateOgImageAction(result.path)
      if (ogResult.success) {
        setSettings(prev => ({ ...prev, ogImagePath: result.path }))
        setMessage({ type: 'success', text: 'Imagem de compartilhamento atualizada!' })
      } else {
        setMessage({ type: 'error', text: 'Erro ao atualizar imagem de compartilhamento.' })
      }
    } else {
      setMessage({ type: 'error', text: result.error })
    }
  }

  const showMessage = () => {
    if (!message) return null
    const Icon = message.type === 'success' ? CheckCircle : AlertCircle
    const bgClass = message.type === 'success' ? 'bg-sage-50 border-sage-200 text-sage-800' : 'bg-terracotta-50 border-terracotta-200 text-terracotta-800'
    return (
      <div className={cn('flex items-center gap-3 p-4 rounded-lg mb-6', bgClass)} role="alert">
        <Icon className="h-5 w-5 flex-shrink-0" />
        <span className="flex-1">{message.text}</span>
        <button onClick={() => setMessage(null)} className="text-current/60 hover:text-current" aria-label="Fechar">
          <X className="h-4 w-4" />
        </button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-medium">Configurações do Site</h1>
          <p className="text-charcoal-600 mt-1">Informações do estabelecimento, horários e SEO</p>
        </div>
      </div>

      {showMessage()}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <section className="card p-6" aria-labelledby="basic-info-title">
          <h2 id="basic-info-title" className="font-heading text-lg font-medium mb-6">Informações Básicas</h2>
          <div className="space-y-4">
            <Input label="Nome do Estabelecimento" name="businessName" value={settings.businessName} onChange={handleChange} required disabled={saving} />
            <Textarea label="Descrição da Marca" name="brandDescription" value={settings.brandDescription} onChange={handleChange} rows={4} placeholder="Texto que aparece no rodapé e na página Sobre" disabled={saving} />
            <Input label="Endereço Completo" name="address" value={settings.address} onChange={handleChange} required disabled={saving} />
            <div className="grid sm:grid-cols-2 gap-4">
              <Input label="Telefone" name="phone" value={settings.phone} onChange={handleChange} type="tel" placeholder="+55 61 3326-9714" disabled={saving} />
              <Input label="Instagram URL" name="instagramUrl" value={settings.instagramUrl} onChange={handleChange} type="url" placeholder="https://www.instagram.com/lomacozinha/" disabled={saving} />
            </div>
          </div>
        </section>

        {/* Opening Hours */}
        <section className="card p-6" aria-labelledby="hours-title">
          <h2 id="hours-title" className="font-heading text-lg font-medium mb-6">Horário de Funcionamento</h2>
          <div className="space-y-4">
            <div className="grid sm:grid-cols-3 gap-4 p-4 bg-cream-50 rounded-lg">
              <span className="font-medium text-charcoal-900">Dia</span>
              <span className="font-medium text-charcoal-900 text-center">Abertura</span>
              <span className="font-medium text-charcoal-900 text-center">Fechamento</span>
            </div>
            {days.map((day) => (
              <div key={day.key} className="grid sm:grid-cols-3 gap-4 items-center p-4 border-b border-border last:border-0">
                <label className="font-medium text-charcoal-900">{day.label}</label>
                <Input
                  name={`${day.key}Open`}
                  value={settings[`${day.key}Open` as keyof typeof settings] as string}
                  onChange={handleChange}
                  type="time"
                  className="max-w-xs"
                  disabled={saving}
                />
                <Input
                  name={`${day.key}Close`}
                  value={settings[`${day.key}Close` as keyof typeof settings] as string}
                  onChange={handleChange}
                  type="time"
                  className="max-w-xs"
                  disabled={saving}
                />
              </div>
            ))}
          </div>
        </section>

        {/* Services */}
        <section className="card p-6" aria-labelledby="services-title">
          <h2 id="services-title" className="font-heading text-lg font-medium mb-6">Serviços</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { key: 'hasOutdoorSeating', label: 'Área externa', description: 'Mesas ao ar livre disponíveis' },
              { key: 'hasVeganOptions', label: 'Opções veganas', description: 'Pratos 100% vegetais no cardápio' },
              { key: 'hasChildMenu', label: 'Menu infantil', description: 'Opções pensadas para crianças' },
            ].map((service) => (
              <label key={service.key} className="flex items-start gap-3 cursor-pointer p-4 rounded-lg border border-border hover:bg-cream-50 transition-colors">
                <input
                  type="checkbox"
                  name={service.key}
                  checked={settings[service.key as keyof typeof settings] as boolean}
                  onChange={handleChange}
                  disabled={saving}
                  className="mt-1 w-4 h-4 rounded border-border text-primary focus:ring-focus"
                />
                <div>
                  <p className="font-medium text-charcoal-900">{service.label}</p>
                  <p className="text-sm text-charcoal-500">{service.description}</p>
                </div>
              </label>
            ))}
          </div>
        </section>

        {/* SEO */}
        <section className="card p-6" aria-labelledby="seo-title">
          <h2 id="seo-title" className="font-heading text-lg font-medium mb-6">SEO e Compartilhamento Social</h2>
          <div className="space-y-4">
            <Input label="Título SEO (meta title)" name="seoTitle" value={settings.seoTitle} onChange={handleChange} placeholder="LOMA — Cozinha e Padaria Artesanal | Asa Norte, Brasília" maxLength={200} helperText="Máx. 200 caracteres. Aparece nos resultados de busca." disabled={saving} />
            <Textarea label="Descrição SEO (meta description)" name="seoDescription" value={settings.seoDescription} onChange={handleChange} rows={3} placeholder="Cozinha e padaria artesanal em Asa Norte, Brasília. Ingredientes naturais servidos de forma extraordinária." maxLength={300} helperText="Máx. 300 caracteres. Aparece nos resultados de busca." disabled={saving} />
            <div>
              <label className="label">Imagem Open Graph (compartilhamento social)</label>
              <div className="space-y-2">
                {settings.ogImagePath && (
                  <div className="flex items-center gap-4 p-4 bg-cream-50 rounded-lg">
                    <div className="relative w-24 h-16 rounded overflow-hidden flex-shrink-0">
                      <Image src={settings.ogImagePath} alt="OG Image preview" fill sizes="96x64" className="object-cover" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-charcoal-900">Imagem atual</p>
                      <p className="text-xs text-charcoal-500">{settings.ogImagePath}</p>
                    </div>
                  </div>
                )}
                <form onSubmit={handleOgImageUpload} className="flex flex-col sm:flex-row gap-3">
                  <Input
                    type="file"
                    name="ogImage"
                    accept="image/jpeg,image/png,image/webp"
                    className="flex-1"
                    disabled={ogUploading || saving}
                  />
                  <Button type="submit" variant="secondary" loading={ogUploading} disabled={saving}>
                    <Upload className="h-4 w-4" aria-hidden="true" />
                    Atualizar
                  </Button>
                </form>
                <p className="text-xs text-charcoal-500">
                  Recomendado: 1200×630px, JPEG/PNG/WebP, máx. 5MB. Usada ao compartilhar links no WhatsApp, Facebook, etc.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button type="submit" size="lg" loading={saving}>
            <Save className="h-4 w-4" aria-hidden="true" />
            Salvar Configurações
          </Button>
        </div>
      </form>
    </div>
  )
}