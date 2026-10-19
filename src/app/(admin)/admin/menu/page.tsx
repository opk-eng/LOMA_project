'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import {
  createCategoryAction, updateCategoryAction,
  toggleCategoryPublishAction, deleteCategoryAction,
} from '@/actions/categories'
import {
  createMenuItemAction, updateMenuItemAction,
  toggleMenuItemPublishAction, toggleMenuItemAvailableAction, deleteMenuItemAction,
} from '@/actions/menuItems'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import {
  Plus, Trash2, Edit, Eye, EyeOff, X, Loader2,
  Package, Menu, Check,
} from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────────────────────
interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  displayOrder: number
  published: boolean
  createdAt: string
  updatedAt: string
  _count?: { menuItems: number }
}

interface MenuItem {
  id: string
  categoryId: string
  name: string
  slug: string
  description: string | null
  priceInCents: number
  imagePath: string | null
  imageAlt: string | null
  displayOrder: number
  published: boolean
  available: boolean
  isVegan: boolean
  isChildFriendly: boolean
  createdAt: string
  updatedAt: string
  category?: { name: string }
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const formatPrice = (cents: number) =>
  (cents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

function issueMap(result: { issues?: Record<string, string[]> }): Record<string, string> {
  const out: Record<string, string> = {}
  if (result.issues) {
    for (const [k, v] of Object.entries(result.issues)) out[k] = v.join(' ')
  }
  return out
}

/**
 * Serialize a React form-state object to a FormData that the server actions
 * understand. Booleans are encoded like native HTML checkboxes:
 *  - true  → append key with value "on"
 *  - false → key is omitted entirely
 * The server reads `formData.get(key) === 'on'`, so this round-trips correctly.
 * Non-boolean fields (strings, numbers) are appended as-is.
 */
function appendFormFields(formData: FormData, form: Record<string, unknown>) {
  for (const [key, value] of Object.entries(form)) {
    if (typeof value === 'boolean') {
      if (value) formData.append(key, 'on')
    } else {
      formData.append(key, String(value))
    }
  }
}

// ── Category form (key-remounted so local state re-initializes per target) ──
function CategoryForm({
  initial, onSave, onCancel, deleting,
}: {
  initial: Category | null
  onSave: () => void
  onCancel: () => void
  deleting: boolean
}) {
  const [form, setForm] = useState(() =>
    initial
      ? {
          name: initial.name,
          slug: initial.slug,
          description: initial.description ?? '',
          displayOrder: initial.displayOrder,
          published: initial.published,
        }
      : { name: '', slug: '', description: '', displayOrder: 0, published: false },
  )
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFieldErrors({})
    const action = initial ? updateCategoryAction : createCategoryAction
    const formData = new FormData()
    appendFormFields(formData, form)
    if (initial) formData.append('id', initial.id)

    setSubmitting(true)
    const result = await action({ success: false, error: '' }, formData)
    setSubmitting(false)
    if (result.success) {
      onSave()
    } else {
      setFieldErrors(issueMap(result))
    }
  }

  const busy = submitting || deleting

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" role="dialog" aria-modal="true" aria-labelledby="category-form-title">
      <div className="bg-background rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <form onSubmit={submit} className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 id="category-form-title" className="font-heading text-lg font-medium">
              {initial ? 'Editar Categoria' : 'Nova Categoria'}
            </h2>
            <button type="button" onClick={onCancel} className="text-charcoal-400 hover:text-charcoal-600" aria-label="Fechar">
              <X className="h-5 w-5" />
            </button>
          </div>
          <Input label="Nome" name="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="Ex: Padaria Artesanal" disabled={busy} error={fieldErrors.name} />
          <Input label="Slug (URL)" name="slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required placeholder="padaria-artesanal" helperText="Apenas letras minúsculas, números e hífens" disabled={busy} error={fieldErrors.slug} />
          <Textarea label="Descrição" name="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Descrição opcional" rows={3} disabled={busy} error={fieldErrors.description} />
          <Input label="Ordem de exibição" type="number" name="displayOrder" value={String(form.displayOrder)} onChange={(e) => setForm({ ...form, displayOrder: parseInt(e.target.value, 10) || 0 })} disabled={busy} error={fieldErrors.displayOrder} />
          <div className="flex items-center gap-2">
            <input type="checkbox" id="cat-published" name="published" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} disabled={busy} className="w-4 h-4 rounded border-border text-primary focus:ring-focus" />
            <label htmlFor="cat-published" className="text-sm text-charcoal-700">Publicada no site</label>
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1" loading={busy}>
              {initial ? 'Salvar alterações' : 'Criar categoria'}
            </Button>
            <Button type="button" variant="secondary" onClick={onCancel}>
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Item form ─────────────────────────────────────────────────────────────────
function ItemForm({
  initial, categories, onSave, onCancel, deleting,
}: {
  initial: MenuItem | null
  categories: Category[]
  onSave: () => void
  onCancel: () => void
  deleting: boolean
}) {
  const [form, setForm] = useState(() =>
    initial
      ? {
          categoryId: initial.categoryId,
          name: initial.name,
          slug: initial.slug,
          description: initial.description ?? '',
          priceInCents: initial.priceInCents,
          imagePath: initial.imagePath ?? '',
          imageAlt: initial.imageAlt ?? '',
          displayOrder: initial.displayOrder,
          published: initial.published,
          available: initial.available,
          isVegan: initial.isVegan,
          isChildFriendly: initial.isChildFriendly,
        }
      : {
          categoryId: categories[0]?.id ?? '',
          name: '', slug: '', description: '', priceInCents: 0,
          imagePath: '', imageAlt: '', displayOrder: 0, published: false, available: true,
          isVegan: false, isChildFriendly: false,
        },
  )
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const busy = submitting || deleting

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFieldErrors({})
    const action = initial ? updateMenuItemAction : createMenuItemAction
    const formData = new FormData()
    appendFormFields(formData, form)
    if (initial) formData.append('id', initial.id)

    setSubmitting(true)
    const result = await action({ success: false, error: '' }, formData)
    setSubmitting(false)
    if (result.success) {
      onSave()
    } else {
      setFieldErrors(issueMap(result))
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" role="dialog" aria-modal="true" aria-labelledby="item-form-title">
      <div className="bg-background rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={submit} className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 id="item-form-title" className="font-heading text-lg font-medium">
              {initial ? 'Editar Item' : 'Novo Item do Cardápio'}
            </h2>
            <button type="button" onClick={onCancel} className="text-charcoal-400 hover:text-charcoal-600" aria-label="Fechar">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <select
              name="categoryId"
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              className="input"
              disabled={busy}
              required
            >
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <Input label="Ordem" type="number" name="displayOrder" value={String(form.displayOrder)} onChange={(e) => setForm({ ...form, displayOrder: parseInt(e.target.value, 10) || 0 })} disabled={busy} error={fieldErrors.displayOrder} />
          </div>
          <Input label="Nome" name="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="Ex: Pão de Fermentação Natural" disabled={busy} error={fieldErrors.name} />
          <Input label="Slug (URL)" name="slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required placeholder="pao-fermentacao-natural" helperText="Apenas letras minúsculas, números e hífens" disabled={busy} error={fieldErrors.slug} />
          <Textarea label="Descrição" name="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Descrição opcional" rows={3} disabled={busy} error={fieldErrors.description} />
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Preço (centavos)" type="number" name="priceInCents" value={String(form.priceInCents)} onChange={(e) => setForm({ ...form, priceInCents: parseInt(e.target.value, 10) || 0 })} placeholder="1200" helperText="R$ 12,00 = 1200 centavos" disabled={busy} error={fieldErrors.priceInCents} />
            <Input label="Imagem (caminho)" name="imagePath" value={form.imagePath} onChange={(e) => setForm({ ...form, imagePath: e.target.value })} placeholder="/uploads/foto.jpg" disabled={busy} error={fieldErrors.imagePath} />
          </div>
          <Input label="Texto alternativo da imagem" name="imageAlt" value={form.imageAlt} onChange={(e) => setForm({ ...form, imageAlt: e.target.value })} placeholder="Pão artesanal na mesa" disabled={busy} error={fieldErrors.imageAlt} />
          <div className="grid sm:grid-cols-3 gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="published" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} disabled={busy} className="w-4 h-4 rounded border-border text-primary focus:ring-focus" />
              <span className="text-sm">Publicado</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="available" checked={form.available} onChange={(e) => setForm({ ...form, available: e.target.checked })} disabled={busy} className="w-4 h-4 rounded border-border text-primary focus:ring-focus" />
              <span className="text-sm">Disponível</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="isVegan" checked={form.isVegan} onChange={(e) => setForm({ ...form, isVegan: e.target.checked })} disabled={busy} className="w-4 h-4 rounded border-border text-primary focus:ring-focus" />
              <span className="text-sm">Vegano</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="isChildFriendly" checked={form.isChildFriendly} onChange={(e) => setForm({ ...form, isChildFriendly: e.target.checked })} disabled={busy} className="w-4 h-4 rounded border-border text-primary focus:ring-focus" />
              <span className="text-sm">Infantil</span>
            </label>
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1" loading={busy}>
              {initial ? 'Salvar alterações' : 'Criar item'}
            </Button>
            <Button type="button" variant="secondary" onClick={onCancel}>
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function AdminMenuPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const tab = searchParams.get('tab') || 'categories'
  const editId = searchParams.get('edit')
  const newItem = searchParams.get('new')

  const [categories, setCategories] = useState<Category[]>([])
  const [items, setItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'category' | 'item'; id: string; name: string } | null>(null)

  // Derived modal targets from the URL (so dashboard deep-links work).
  const showCategoryForm = tab === 'categories' && (newItem === 'true' || !!editId)
  const activeCategory = categories.find((c) => c.id === editId) ?? null
  const showItemForm = tab === 'items' && (newItem === 'true' || !!editId)
  const activeItem = items.find((i) => i.id === editId) ?? null

  const closeCategoryForm = () => router.push('/admin/menu?tab=categories')
  const closeItemForm = () => router.push('/admin/menu?tab=items')

  // Mount-time fetch: setState only inside promise callbacks so we never
  // update state synchronously in the effect body (avoids cascading renders).
  useEffect(() => {
    let ignore = false
    Promise.all([
      fetch('/api/admin/categories').then((r) => r.json()),
      fetch('/api/admin/items').then((r) => r.json()),
    ])
      .then(([cats, its]) => {
        if (ignore) return
        setCategories(cats)
        setItems(its)
      })
      .catch((error) => {
        if (!ignore) console.error('Failed to fetch data:', error)
      })
      .finally(() => {
        if (!ignore) setLoading(false)
      })
    return () => { ignore = true }
  }, [])

  const handleSaved = (tabName: 'categories' | 'items') => {
    setSaving(null)
    router.push(`/admin/menu?tab=${tabName}`) // clears ?edit=/?new=
    router.refresh() // re-fetch server data so the list reflects the change
  }

  const handleTogglePublish = async (type: 'category' | 'item', id: string, published: boolean) => {
    const action = type === 'category' ? toggleCategoryPublishAction : toggleMenuItemPublishAction
    const result = await action(id, published)
    if (result.success) router.refresh()
  }

  const handleToggleAvailable = async (id: string, available: boolean) => {
    const result = await toggleMenuItemAvailableAction(id, available)
    if (result.success) router.refresh()
  }

  const handleDelete = async () => {
    if (!deleteConfirm) return
    const action = deleteConfirm.type === 'category' ? deleteCategoryAction : deleteMenuItemAction
    setSaving(deleteConfirm.id)
    const result = await action(deleteConfirm.id)
    setSaving(null)
    if (result.success) {
      router.refresh()
    } else {
      alert(result.error)
    }
    setDeleteConfirm(null)
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
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-medium">Gerenciar Cardápio</h1>
          <p className="text-charcoal-600 mt-1">Categorias e itens do cardápio público</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            variant={tab === 'categories' ? 'primary' : 'secondary'}
            onClick={() => router.push('/admin/menu?tab=categories')}
          >
            <Package className="h-4 w-4" aria-hidden="true" />
            Categorias ({categories.length})
          </Button>
          <Button
            variant={tab === 'items' ? 'primary' : 'secondary'}
            onClick={() => router.push('/admin/menu?tab=items')}
          >
            <Menu className="h-4 w-4" aria-hidden="true" />
            Itens ({items.length})
          </Button>
        </div>
      </div>

      {/* Category Form Modal */}
      {showCategoryForm && (
        <CategoryForm
          key={activeCategory?.id ?? 'new'}
          initial={activeCategory}
          deleting={saving !== null}
          onSave={() => handleSaved('categories')}
          onCancel={closeCategoryForm}
        />
      )}

      {/* Item Form Modal */}
      {showItemForm && (
        <ItemForm
          key={activeItem?.id ?? 'new'}
          initial={activeItem}
          categories={categories}
          deleting={saving !== null}
          onSave={() => handleSaved('items')}
          onCancel={closeItemForm}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" role="dialog" aria-modal="true" aria-labelledby="delete-confirm-title">
          <div className="bg-background rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 id="delete-confirm-title" className="font-heading text-lg font-medium mb-2">Confirmar exclusão</h2>
            <p className="text-charcoal-600 mb-6">
              Tem certeza que deseja excluir <strong>{deleteConfirm.name}</strong>?
              {deleteConfirm.type === 'category' && ' Esta ação não pode ser desfeita e só é permitida se a categoria não tiver itens associados.'}
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="secondary" onClick={() => setDeleteConfirm(null)}>Cancelar</Button>
              <Button variant="destructive" onClick={handleDelete} loading={saving === deleteConfirm.id}>
                Excluir
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Categories Tab */}
      {tab === 'categories' && (
        <section className="card" aria-labelledby="categories-list-title">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <h2 id="categories-list-title" className="font-heading text-lg font-medium">Categorias</h2>
            <Button onClick={() => router.push('/admin/menu?tab=categories&new=true')}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              Nova Categoria
            </Button>
          </div>
          <div className="divide-y divide-border">
            {categories.length === 0 ? (
              <div className="p-12 text-center text-charcoal-500">
                <Package className="h-12 w-12 mx-auto text-charcoal-300 mb-3" aria-hidden="true" />
                <p className="mb-2">Nenhuma categoria criada</p>
                <Button onClick={() => router.push('/admin/menu?tab=categories&new=true')}>
                  Criar primeira categoria
                </Button>
              </div>
            ) : (
              categories.map((cat) => (
                <div key={cat.id} className="p-4 hover:bg-cream-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleTogglePublish('category', cat.id, !cat.published)}
                      className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${cat.published ? 'bg-sage-100 text-sage-600' : 'bg-charcoal-100 text-charcoal-400'}`}
                      aria-label={cat.published ? 'Despublicar' : 'Publicar'}
                    >
                      {cat.published ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-charcoal-900 truncate">{cat.name}</p>
                      <p className="text-xs text-charcoal-500">
                        Slug: {cat.slug} • {cat._count?.menuItems || 0} itens • {cat.published ? 'Publicada' : 'Rascunho'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => router.push(`/admin/menu?tab=categories&edit=${cat.id}`)} aria-label="Editar">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setDeleteConfirm({ type: 'category', id: cat.id, name: cat.name })} aria-label="Excluir">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      )}

      {/* Items Tab */}
      {tab === 'items' && (
        <section className="card" aria-labelledby="items-list-title">
          <div className="p-6 border-b border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 id="items-list-title" className="font-heading text-lg font-medium">Itens do Cardápio</h2>
            <Button onClick={() => router.push('/admin/menu?tab=items&new=true')}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              Novo Item
            </Button>
          </div>
          <div className="divide-y divide-border">
            {items.length === 0 ? (
              <div className="p-12 text-center text-charcoal-500">
                <Menu className="h-12 w-12 mx-auto text-charcoal-300 mb-3" aria-hidden="true" />
                <p className="mb-2">Nenhum item criado</p>
                <Button onClick={() => router.push('/admin/menu?tab=items&new=true')}>
                  Criar primeiro item
                </Button>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="p-4 hover:bg-cream-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => handleTogglePublish('item', item.id, !item.published)}
                        className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${item.published ? 'bg-sage-100 text-sage-600' : 'bg-charcoal-100 text-charcoal-400'}`}
                        aria-label={item.published ? 'Despublicar' : 'Publicar'}
                      >
                        {item.published ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => handleToggleAvailable(item.id, !item.available)}
                        className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${item.available ? 'bg-brand-blue-100 text-brand-blue-600' : 'bg-charcoal-100 text-charcoal-400'}`}
                        aria-label={item.available ? 'Marcar indisponível' : 'Marcar disponível'}
                      >
                        {item.available ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </button>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-charcoal-900 truncate">{item.name}</p>
                      <p className="text-xs text-charcoal-500">
                        {item.category?.name} • R$ {formatPrice(item.priceInCents)}
                        {item.isVegan && ' • 🌱 Vegano'}
                        {item.isChildFriendly && ' • 👶 Infantil'}
                        {' • ' + (item.published ? 'Publicado' : 'Rascunho')}
                        {' • ' + (item.available ? 'Disponível' : 'Indisponível')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => router.push(`/admin/menu?tab=items&edit=${item.id}`)} aria-label="Editar">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setDeleteConfirm({ type: 'item', id: item.id, name: item.name })} aria-label="Excluir">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      )}
    </div>
  )
}
