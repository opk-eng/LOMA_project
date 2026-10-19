'use client'

import { useState, useEffect } from 'react'
import { uploadImageAction, deleteImageAction, getMediaAssets } from '@/actions/media'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import Image from 'next/image'
import { ImageIcon, Trash2, Upload, Loader2, X } from 'lucide-react'

export default function AdminMediaPage() {
  const [assets, setAssets] = useState<Array<{
    id: string
    fileName: string
    originalName: string | null
    mimeType: string
    fileSize: number
    altText: string | null
    createdAt: string
  }>>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [showUpload, setShowUpload] = useState(false)
  const [altText, setAltText] = useState('')
  const [attribution, setAttribution] = useState('')

  // Mount-time fetch: setState only inside promise callbacks so we never
  // update state synchronously in the effect body (avoids cascading renders).
  useEffect(() => {
    let ignore = false
    getMediaAssets()
      .then((data) => {
        if (ignore) return
        setAssets(
          data.map((a) => ({ ...a, createdAt: a.createdAt.toISOString() }))
        )
      })
      .catch((error) => {
        if (!ignore) console.error('Failed to fetch assets:', error)
      })
      .finally(() => {
        if (!ignore) setLoading(false)
      })
    return () => { ignore = true }
  }, [])

  // Refresh the asset list after a mutation (called from event handlers).
  const refreshAssets = async () => {
    const data = await getMediaAssets()
    setAssets(data.map((a) => ({ ...a, createdAt: a.createdAt.toISOString() })))
  }

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData()
    const fileInput = e.currentTarget.elements.namedItem('image') as HTMLInputElement
    if (fileInput.files?.[0]) {
      formData.append('image', fileInput.files[0])
    }
    formData.append('altText', altText)
    formData.append('attribution', attribution)

    setUploading(true)
    const result = await uploadImageAction({ success: false, error: '' }, formData)
    setUploading(false)

    if (result.success) {
      setShowUpload(false)
      setAltText('')
      setAttribution('')
      refreshAssets()
    } else {
      alert(result.error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta imagem?')) return
    setDeleting(id)
    const result = await deleteImageAction(id)
    setDeleting(null)
    if (result.success) {
      refreshAssets()
    } else {
      alert(result.error)
    }
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-medium">Gerenciar Mídia</h1>
          <p className="text-charcoal-600 mt-1">Imagens para o cardápio e galeria</p>
        </div>
        <Button onClick={() => setShowUpload(true)}>
          <Upload className="h-4 w-4" aria-hidden="true" />
          Upload de Imagem
        </Button>
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" role="dialog" aria-modal="true" aria-labelledby="upload-title">
          <div className="bg-background rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 id="upload-title" className="font-heading text-lg font-medium">Upload de Imagem</h2>
              <button onClick={() => setShowUpload(false)} className="text-charcoal-400 hover:text-charcoal-600" aria-label="Fechar">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleUpload} className="space-y-4">
              <Input label="Arquivo de imagem" type="file" name="image" accept="image/jpeg,image/png,image/webp,image/avif" required disabled={uploading} />
              <Input label="Texto alternativo (acessibilidade)" name="altText" value={altText} onChange={e => setAltText(e.target.value)} placeholder="Descrição da imagem para leitores de tela" disabled={uploading} />
              <Input label="Atribuição/Licença (opcional)" name="attribution" value={attribution} onChange={e => setAttribution(e.target.value)} placeholder="Ex: Foto por João Silva / LOMA" disabled={uploading} />
              <div className="flex gap-3 pt-2">
                <Button type="submit" className="flex-1" loading={uploading}>
                  Enviar
                </Button>
                <Button type="button" variant="secondary" onClick={() => setShowUpload(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assets Grid */}
      <section className="card" aria-labelledby="assets-title">
        <h2 id="assets-title" className="sr-only">Imagens cadastradas</h2>
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          </div>
        ) : assets.length === 0 ? (
          <div className="p-12 text-center text-charcoal-500">
            <ImageIcon className="h-12 w-12 mx-auto text-charcoal-300 mb-3" aria-hidden="true" />
            <p className="mb-2">Nenhuma imagem enviada</p>
            <Button onClick={() => setShowUpload(true)}>Enviar primeira imagem</Button>
          </div>
        ) : (
          <div className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4" role="list">
              {assets.map((asset) => (
                <article key={asset.id} className="relative group" role="listitem">
                  <div className="aspect-[4/3] rounded-lg overflow-hidden bg-muted relative">
                    <Image
                      src={`/uploads/${asset.fileName}`}
                      alt={asset.altText || 'Imagem do acervo'}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end p-3">
                      <div className="w-full flex justify-between text-white text-xs">
                        <span className="truncate max-w-[70%]">{asset.altText || asset.originalName || asset.fileName}</span>
                        <button
                          onClick={() => handleDelete(asset.id)}
                          disabled={deleting === asset.id}
                          className="p-1.5 bg-white/20 backdrop-blur rounded-full hover:bg-white/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                          aria-label={`Excluir ${asset.altText || asset.originalName || asset.fileName}`}
                        >
                          {deleting === asset.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-charcoal-500">
                    <p className="truncate font-medium">{asset.originalName || asset.fileName}</p>
                    <p>{formatSize(asset.fileSize)} • {asset.mimeType}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Usage Guidelines */}
      <section className="card p-6 bg-terracotta-50 border-terracotta-200" aria-labelledby="guidelines-title">
        <h2 id="guidelines-title" className="font-heading text-lg font-medium text-terracotta-800 mb-4 flex items-center gap-2">
          <ImageIcon className="h-5 w-5" aria-hidden="true" />
          Diretrizes de uso de imagens
        </h2>
        <ul className="text-sm text-terracotta-700 space-y-2" role="list">
          <li>• Use apenas fotografias autorizadas da LOMA (Instagram oficial com permissão ou arquivos próprios)</li>
          <li>• Não use imagens de outros estabelecimentos como se fossem da LOMA</li>
          <li>• Preencha sempre o texto alternativo para acessibilidade</li>
          <li>• Formatos aceitos: JPEG, PNG, WebP, AVIF — máx. 5MB</li>
          <li>• Para produção, configure armazenamento persistente (S3, Cloudinary, etc.)</li>
        </ul>
      </section>
    </div>
  )
}