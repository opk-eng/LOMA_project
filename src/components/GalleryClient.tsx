'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, Camera, X, ChevronLeft } from 'lucide-react'

interface MediaAsset {
  id: string
  fileName: string
  originalName?: string | null
  altText: string | null
  createdAt?: Date
  mimeType?: string
  fileSize?: number
}

export default function GalleryClient({ initialAssets }: { initialAssets: MediaAsset[] }) {
  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  const selectedIndex = selectedAsset
    ? initialAssets.findIndex((a) => a.id === selectedAsset.id)
    : -1

  const closeLightbox = useCallback(() => {
    setSelectedAsset(null)
    document.body.style.overflow = ''
  }, [])

  const openLightbox = useCallback(
    (asset: MediaAsset) => {
      setSelectedAsset(asset)
      document.body.style.overflow = 'hidden'
    },
    [],
  )

  const step = useCallback(
    (dir: 1 | -1) => {
      if (initialAssets.length === 0) return
      const nextIndex = (selectedIndex + dir + initialAssets.length) % initialAssets.length
      setSelectedAsset(initialAssets[nextIndex])
    },
    [initialAssets, selectedIndex],
  )

  // Keyboard: Escape closes, arrows navigate
  useEffect(() => {
    if (!selectedAsset) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox()
      else if (e.key === 'ArrowRight' && initialAssets.length > 1) step(1)
      else if (e.key === 'ArrowLeft' && initialAssets.length > 1) step(-1)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedAsset, closeLightbox, step, initialAssets.length])

  // Move focus into the dialog when it opens
  useEffect(() => {
    if (selectedAsset) {
      closeRef.current?.focus()
    }
  }, [selectedAsset])

  // Restore scroll if the component unmounts with the lightbox open
  useEffect(() => {
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  return (
    <>
      {/* Gallery Grid */}
      <section className="py-12 md:py-16" aria-labelledby="gallery-content-title">
        <div className="container">
          <h2 id="gallery-content-title" className="sr-only">Imagens da galeria</h2>

          {initialAssets.length === 0 ? (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-6">
                <svg className="h-10 w-10 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-heading text-2xl font-medium mb-2">Galeria vazia</h3>
              <p className="text-muted-foreground mb-6">
                Ainda não há imagens publicadas. Administradores podem fazer upload no painel.
              </p>
              <div className="bg-primary-light/60 border border-primary/20 rounded-lg p-6 max-w-md mx-auto text-left">
                <p className="text-sm text-notice mb-2">
                  <strong>Nota sobre direitos de imagem:</strong> Priorizamos fotografias oficiais da LOMA
                  do Instagram (com autorização) ou fornecidas diretamente pelo estabelecimento.
                </p>
                <p className="text-sm text-notice/80">
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
                {initialAssets.map((asset, idx) => (
                  <button
                    key={asset.id}
                    className="relative aspect-[4/3] overflow-hidden rounded-lg bg-muted group cursor-zoom-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 img-shimmer"
                    onClick={() => openLightbox(asset)}
                    aria-label={`Ampliar ${asset.altText || asset.originalName || asset.fileName}`}
                  >
                    <Image
                      src={`/uploads/${asset.fileName}`}
                      alt={asset.altText || `Imagem da galeria LOMA ${idx + 1}`}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      priority={idx < 4}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </button>
                ))}
              </div>

              {/* Camera link */}
              <div className="text-center mt-12 pt-8 border-t border-border">
                <p className="text-muted-foreground mb-4">
                  Acompanhe mais no nosso Instagram:
                </p>
                <a
                  href="https://www.instagram.com/lomacozinha/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline inline-flex items-center gap-2 link-underline"
                  aria-label="Instagram do LOMA"
                >
                  <Camera className="h-5 w-5" aria-hidden="true" />
                  @lomacozinha
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </a>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedAsset && (
          <motion.div
            key="lightbox"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeLightbox}
            role="dialog"
            aria-modal="true"
            aria-label="Visualização ampliada da imagem"
          >
            <button
              ref={closeRef}
              onClick={closeLightbox}
              className="absolute top-4 right-4 p-2 text-white/70 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded-full bg-black/50"
              aria-label="Fechar"
            >
              <X className="h-6 w-6" aria-hidden="true" />
            </button>

            {initialAssets.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    step(-1)
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 text-white/70 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded-full bg-black/50"
                  aria-label="Imagem anterior"
                >
                  <ChevronLeft className="h-6 w-6" aria-hidden="true" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    step(1)
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-white/70 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded-full bg-black/50"
                  aria-label="Próxima imagem"
                >
                  <ChevronRight className="h-6 w-6" aria-hidden="true" />
                </button>
              </>
            )}

            <motion.div
              key={selectedAsset.id}
              className="relative max-w-5xl max-h-[85vh] w-full"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={`/uploads/${selectedAsset.fileName}`}
                alt={selectedAsset.altText || selectedAsset.originalName || 'Imagem da galeria LOMA'}
                width={1200}
                height={800}
                className="w-full h-auto max-h-[75vh] object-contain rounded-lg"
                priority
              />
              {(selectedAsset.altText || selectedAsset.originalName) && (
                <p className="text-white/70 text-sm text-center mt-3 max-w-xl mx-auto">
                  {selectedAsset.altText || selectedAsset.originalName}
                </p>
              )}
              {initialAssets.length > 1 && (
                <p className="text-white/40 text-xs text-center mt-2 font-mono">
                  {selectedIndex + 1} de {initialAssets.length}
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
