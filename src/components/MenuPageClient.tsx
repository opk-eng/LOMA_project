'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronRight, Leaf, Baby, Loader2 } from 'lucide-react'

interface CategoryWithItems {
  id: string
  name: string
  slug: string
  description: string | null
  menuItems: Array<{
    id: string
    name: string
    slug: string
    description: string | null
    priceInCents: number
    formattedPrice: string
    imagePath: string | null
    imageAlt: string | null
    isVegan: boolean
    isChildFriendly: boolean
    available: boolean
  }>
}

export default function MenuPageClient({
  initialCategories,
  allCategories,
  initialCategory,
}: {
  initialCategories: CategoryWithItems[]
  allCategories: Array<{ id: string; name: string; slug: string }>
  initialCategory?: string
}) {
  const [activeCategory, setActiveCategory] = useState<string>(initialCategory ?? 'all')
  const [loading, setLoading] = useState(false)

  const filteredCategories = activeCategory === 'all'
    ? initialCategories
    : initialCategories.filter((c) => c.slug === activeCategory)

  const handleCategoryChange = useCallback((slug: string) => {
    setLoading(true)
    setActiveCategory(slug)
    document.getElementById('menu-content')?.scrollIntoView({ behavior: 'smooth' })
    history.replaceState(null, '', `/cardapio${slug === 'all' ? '' : `#${slug}`}`)
    setLoading(false)
  }, [])

  return (
    <div>
      {/* Page Header */}
      <section className="bg-cream-100 py-16 md:py-24">
        <div className="container">
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex items-center gap-2 text-sm text-muted-foreground">
              <li>
                <Link href="/" className="hover:text-foreground transition-colors">Início</Link>
              </li>
              <li aria-hidden="true"><ChevronRight className="h-4 w-4" /></li>
              <li aria-current="page" className="text-foreground font-medium">Cardápio</li>
            </ol>
          </nav>
          <h1 className="font-heading text-4xl md:text-5xl font-medium tracking-tight mb-4">Nosso Cardápio</h1>
          <p className="text-lg text-charcoal-600 max-w-2xl">
            Produtos artesanais feitos com ingredientes naturais, selecionados com cuidado.
            Escolha uma categoria abaixo para explorar.
          </p>
        </div>
      </section>

      {/* Category Filters */}
      {allCategories.length > 1 && (
        <section className="py-4 bg-background border-b border-border sticky top-16 z-40" aria-label="Filtros de categoria">
          <div className="container">
            <div className="flex flex-wrap gap-2" role="tablist" aria-label="Categorias do cardápio">
              <button
                role="tab"
                aria-selected={activeCategory === 'all'}
                onClick={() => handleCategoryChange('all')}
                className={`btn btn-sm transition-all ${
                  activeCategory === 'all'
                    ? 'btn-primary'
                    : 'btn-secondary'
                }`}
              >
                Todas
              </button>
              {allCategories.map((cat) => (
                <button
                  key={cat.id}
                  role="tab"
                  aria-selected={activeCategory === cat.slug}
                  onClick={() => handleCategoryChange(cat.slug)}
                  className={`btn btn-sm transition-all ${
                    activeCategory === cat.slug
                      ? 'btn-primary'
                      : 'btn-secondary'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Menu Content */}
      <section id="menu-content" className="py-12 md:py-16 bg-background" aria-labelledby="menu-content-title">
        <div className="container">
          <h2 id="menu-content-title" className="sr-only">Itens do cardápio</h2>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-6">
                <svg className="h-10 w-10 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="font-heading text-2xl font-medium mb-2">Nenhum item nesta categoria</h3>
              <p className="text-charcoal-600">
                Confira outras categorias ou volte em breve para novidades.
              </p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCategory}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="space-y-12"
                role="list"
                aria-label="Categorias do cardápio"
              >
                {filteredCategories.map((category) => (
                  <article
                    key={category.id}
                    id={category.slug}
                    className="category-section"
                    role="listitem"
                    aria-labelledby={`cat-${category.slug}`}
                  >
                    <header className="mb-8 pb-4 border-b border-border">
                      <h3 id={`cat-${category.slug}`} className="font-heading text-2xl md:text-3xl font-medium">
                        {category.name}
                      </h3>
                      {category.description && (
                        <p className="text-charcoal-600 mt-2">{category.description}</p>
                      )}
                    </header>

                    {category.menuItems.length === 0 ? (
                      <p className="text-charcoal-500 text-center py-8">
                        Nenhum item publicado nesta categoria.
                      </p>
                    ) : (
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" role="list">
                        {category.menuItems.map((item) => (
                          <article
                            key={item.id}
                            className="card overflow-hidden group"
                            role="listitem"
                          >
                            {item.imagePath && (
                              <div className="aspect-[4/3] overflow-hidden relative bg-muted">
                                <Image
                                  src={item.imagePath}
                                  alt={item.imageAlt || item.name}
                                  fill
                                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                />
                              </div>
                            )}
                            <div className="p-6">
                              <div className="flex items-start justify-between gap-4 mb-3">
                                <h4 className="font-heading text-lg font-medium flex-1">{item.name}</h4>
                                <span className="font-medium text-primary whitespace-nowrap text-lg">
                                  R$ {item.formattedPrice}
                                </span>
                              </div>
                              {item.description && (
                                <p className="text-charcoal-600 text-sm mb-4 line-clamp-2">{item.description}</p>
                              )}
                              <div className="flex flex-wrap gap-2">
                                {item.isVegan && (
                                  <span className="px-2.5 py-1 text-xs font-medium text-sage-700 bg-sage-100 rounded-full flex items-center gap-1">
                                    <Leaf className="h-3 w-3" aria-hidden="true" />
                                    Vegano
                                  </span>
                                )}
                                {item.isChildFriendly && (
                                  <span className="px-2.5 py-1 text-xs font-medium text-terracotta-700 bg-terracotta-100 rounded-full flex items-center gap-1">
                                    <Baby className="h-3 w-3" aria-hidden="true" />
                                    Infantil
                                  </span>
                                )}
                                {!item.available && (
                                  <span className="px-2.5 py-1 text-xs font-medium text-charcoal-500 bg-charcoal-100 rounded-full">
                                    Indisponível
                                  </span>
                                )}
                              </div>
                            </div>
                          </article>
                        ))}
                      </div>
                    )}
                  </article>
                ))}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </section>
    </div>
  )
}
