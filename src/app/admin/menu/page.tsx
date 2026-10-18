'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createCategoryAction, updateCategoryAction, toggleCategoryPublishAction, deleteCategoryAction, reorderCategoriesAction } from '@/actions/categories'
import { createMenuItemAction, updateMenuItemAction, toggleMenuItemPublishAction, toggleMenuItemAvailableAction, deleteMenuItemAction, reorderMenuItemsAction } from '@/actions/menuItems'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Plus, Trash2, Edit, Eye, EyeOff, GripVertical, ChevronDown, ChevronUp, Check, X, Loader2, Image, Package, Menu, ArrowUp, ArrowDown } from 'lucide-react'
import { cn } from '@/lib/utils'

// Type definitions
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
  menuItems?: MenuItem[]
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

interface CategoryFormState {
  success: boolean
  error?: string
  issues?: Record<string, string[]>
  category?: { id: string; slug: string }
}

interface MenuItemFormState {
  success: boolean
  error?: string
  issues?: Record<string, string[]>
  item?: { id: string; slug: string }
}

export default function AdminMenuPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialTab = searchParams.get('tab') || 'categories'
  const editId = searchParams.get('edit')
  const newItem = searchParams.get('new')

  const [tab, setTab] = useState(initialTab)
  const [categories, setCategories] = useState<Category[]>([])
  const [items, setItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [showItemForm, setShowItemForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'category' | 'item'; id: string; name: string } | null>(null)

  // Form states
  const [categoryForm, setCategoryForm] = useState({
    name: '', slug: '', description: '', displayOrder: 0, published: false
  })
  const [itemForm, setItemForm] = useState({
    categoryId: '', name: '', slug: '', description: '', priceInCents: 0,
    imagePath: '', imageAlt: '', displayOrder: 0, published: false, available: true,
    isVegan: false, isChildFriendly: false
  })

  // Fetch data
  const fetchData = async () => {
    setLoading(true)
    try {
      const [catsRes, itemsRes] = await Promise.all([
        fetch('/api/admin/categories'),
        fetch('/api/admin/items')
      ])
      const cats = await catsRes.json()
      const its = await itemsRes.json()
      setCategories(cats)
      setItems(its)
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Handle edit/new from URL params
  useEffect(() => {
    if (editId && tab === 'categories') {
      const cat = categories.find(c => c.id === editId)
      if (cat) {
        setEditingCategory(cat)
        setCategoryForm({
          name: cat.name,
          slug: cat.slug,
          description: cat.description || '',
          displayOrder: cat.displayOrder,
          published: cat.published
        })
        setShowCategoryForm(true)
      }
    } else if (editId && tab === 'items') {
      const item = items.find(i => i.id === editId)
      if (item) {
        setEditingItem(item)
        setItemForm({
          categoryId: item.categoryId,
          name: item.name,
          slug: item.slug,
          description: item.description || '',
          priceInCents: item.priceInCents,
          imagePath: item.imagePath || '',
          imageAlt: item.imageAlt || '',
          displayOrder: item.displayOrder,
          published: item.published,
          available: item.available,
          isVegan: item.isVegan,
          isChildFriendly: item.isChildFriendly
        })
        setShowItemForm(true)
      }
    } else if (newItem === 'true' && tab === 'categories') {
      setEditingCategory(null)
      setCategoryForm({ name: '', slug: '', description: '', displayOrder: 0, published: false })
      setShowCategoryForm(true)
    } else if (newItem === 'true' && tab === 'items') {
      setEditingItem(null)
      setItemForm({
        categoryId: categories[0]?.id || '',
        name: '', slug: '', description: '', priceInCents: 0,
        imagePath: '', imageAlt: '', displayOrder: 0, published: false, available: true,
        isVegan: false, isChildFriendly: false
      })
      setShowItemForm(true)
    }
  }, [editId, newItem, tab, categories, items])

  // Generate slug from name
  const generateSlug = (text: string) => {
    return text
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 100)
  }

  // Format price
  const formatPrice = (cents: number) => {
    return (cents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  // Category handlers
  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const id = editingCategory?.id
    const action = id ? updateCategoryAction : createCategoryAction
    const formData = new FormData()
    Object.entries(categoryForm).forEach(([key, value]) => {
      formData.append(key, String(value))
    })
    if (id) formData.append('id', id)

    setSaving(id || 'new-category')
    const result = await action({ success: false, error: '' } as CategoryFormState, formData)
    setSaving(null)

    if (result.success) {
      setShowCategoryForm(false)
      setEditingCategory(null)
      router.refresh()
    } else {
      alert(result.error)
    }
  }

  const handleItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const id = editingItem?.id
    const action = id ? updateMenuItemAction : createMenuItemAction
    const formData = new FormData()
    Object.entries(itemForm).forEach(([key, value]) => {
      formData.append(key, String(value))
    })
    if (id) formData.append('id', id)

    setSaving(id || 'new-item')
    const result = await action({ success: false, error: '' } as MenuItemFormState, formData)
    setSaving(null)

    if (result.success) {
      setShowItemForm(false)
      setEditingItem(null)
      router.refresh()
    } else {
      alert(result.error)
    }
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
    const result = await action(deleteConfirm.id)
    if (result.success) {
      router.refresh()
    } else {
      alert(result.error)
    }
    setDeleteConfirm(null)
  }

  const handleReorder = async (type: 'category' | 'item', updates: { id: string; displayOrder: number }[]) => {
    const action = type === 'category' ? reorderCategoriesAction : reorderMenuItemsAction
    await action(updates)
    router.refresh()
  }

  // Render
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const filteredItems = tab === 'items' ? items : []
  const currentCategories = tab === 'categories' ? categories : []

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
            onClick={() => { setTab('categories'); router.push('/admin/menu?tab=categories') }}
          >
            <Package className="h-4 w-4" aria-hidden="true" />
            Categorias ({categories.length})
          </Button>
          <Button
            variant={tab === 'items' ? 'primary' : 'secondary'}
            onClick={() => { setTab('items'); router.push('/admin/menu?tab=items') }}
          >
            <Menu className="h-4 w-4" aria-hidden="true" />
            Itens ({items.length})
          </Button>
        </div>
      </div>

      {/* Category Form Modal */}
      {showCategoryForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" role="dialog" aria-modal="true" aria-labelledby="category-form-title">
          <div className="bg-background rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleCategorySubmit} className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 id="category-form-title" className="font-heading text-lg font-medium">
                  {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
                </h2>
                <button
                  type="button"
                  onClick={() => { setShowCategoryForm(false); router.push('/admin/menu?tab=categories') }}
                  className="text-charcoal-400 hover:text-charcoal-600"
                  aria-label="Fechar"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <Input label="Nome" name="name" value={categoryForm.name} onChange={e => setCategoryForm({...categoryForm, name: e.target.value})} required placeholder="Ex: Padaria Artesanal" disabled={saving} />
              <Input label="Slug (URL)" name="slug" value={categoryForm.slug} onChange={e => setCategoryForm({...categoryForm, slug: e.target.value})} required placeholder="padaria-artesanal" helperText="Apenas letras minúsculas, números e hífens" disabled={saving} />
              <Textarea label="Descrição" name="description" value={categoryForm.description} onChange={e => setCategoryForm({...categoryForm, description: e.target.value})} placeholder="Descrição opcional" rows={3} disabled={saving} />
              <Input label="Ordem de exibição" type="number" name="displayOrder" value={categoryForm.displayOrder} onChange={e => setCategoryForm({...categoryForm, displayOrder: parseInt(e.target.value) || 0})} disabled={saving} />
              <div className="flex items-center gap-2">
                <input type="checkbox" id="cat-published" checked={categoryForm.published} onChange={e => setCategoryForm({...categoryForm, published: e.target.checked})} disabled={saving} className="w-4 h-4 rounded border-border text-primary focus:ring-focus" />
                <label htmlFor="cat-published" className="text-sm text-charcoal-700">Publicada no site</label>
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1" loading={saving}>
                  {editingCategory ? 'Salvar alterações' : 'Criar categoria'}
                </Button>
                <Button type="button" variant="secondary" onClick={() => { setShowCategoryForm(false); router.push('/admin/menu?tab=categories') }}>
                  Cancelar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Item Form Modal */}
      {showItemForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" role="dialog" aria-modal="true" aria-labelledby="item-form-title">
          <div className="bg-background rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleItemSubmit} className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 id="item-form-title" className="font-heading text-lg font-medium">
                  {editingItem ? 'Editar Item' : 'Novo Item do Cardápio'}
                </h2>
                <button
                  type="button"
                  onClick={() => { setShowItemForm(false); router.push('/admin/menu?tab=items') }}
                  className="text-charcoal-400 hover:text-charcoal-600"
                  aria-label="Fechar"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <select
                  name="categoryId"
                  value={itemForm.categoryId}
                  onChange={e => setItemForm({...itemForm, categoryId: e.target.value})}
                  className="input"
                  disabled={saving}
                  required
                >
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <Input label="Ordem" type="number" name="displayOrder" value={itemForm.displayOrder} onChange={e => setItemForm({...itemForm, displayOrder: parseInt(e.target.value) || 0})} disabled={saving} />
              </div>
              <Input label="Nome" name="name" value={itemForm.name} onChange={e => setItemForm({...itemForm, name: e.target.value})} required placeholder="Ex: Pão de Fermentação Natural" disabled={saving} />
              <Input label="Slug (URL)" name="slug" value={itemForm.slug} onChange={e => setItemForm({...itemForm, slug: e.target.value})} required placeholder="pao-fermentacao-natural" helperText="Apenas letras minúsculas, números e hífens" disabled={saving} />
              <Textarea label="Descrição" name="description" value={itemForm.description} onChange={e => setItemForm({...itemForm, description: e.target.value})} placeholder="Descrição opcional" rows={3} disabled={saving} />
              <div className="grid sm:grid-cols-2 gap-4">
                <Input label="Preço (centavos)" type="number" name="priceInCents" value={itemForm.priceInCents} onChange={e => setItemForm({...itemForm, priceInCents: parseInt(e.target.value) || 0})} placeholder="1200" helperText="R$ 12,00 = 1200 centavos" disabled={saving} />
                <Input label="Imagem (caminho)" name="imagePath" value={itemForm.imagePath} onChange={e => setItemForm({...itemForm, imagePath: e.target.value})} placeholder="/uploads/foto.jpg" disabled={saving} />
              </div>
              <Input label="Texto alternativo da imagem" name="imageAlt" value={itemForm.imageAlt} onChange={e => setItemForm({...itemForm, imageAlt: e.target.value})} placeholder="Pão artesanal na mesa" disabled={saving} />
              <div className="grid sm:grid-cols-3 gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={itemForm.published} onChange={e => setItemForm({...itemForm, published: e.target.checked})} disabled={saving} className="w-4 h-4 rounded border-border text-primary focus:ring-focus" />
                  <span className="text-sm">Publicado</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={itemForm.available} onChange={e => setItemForm({...itemForm, available: e.target.checked})} disabled={saving} className="w-4 h-4 rounded border-border text-primary focus:ring-focus" />
                  <span className="text-sm">Disponível</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={itemForm.isVegan} onChange={e => setItemForm({...itemForm, isVegan: e.target.checked})} disabled={saving} className="w-4 h-4 rounded border-border text-primary focus:ring-focus" />
                  <span className="text-sm">Vegano</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={itemForm.isChildFriendly} onChange={e => setItemForm({...itemForm, isChildFriendly: e.target.checked})} disabled={saving} className="w-4 h-4 rounded border-border text-primary focus:ring-focus" />
                  <span className="text-sm">Infantil</span>
                </label>
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1" loading={saving}>
                  {editingItem ? 'Salvar alterações' : 'Criar item'}
                </Button>
                <Button type="button" variant="secondary" onClick={() => { setShowItemForm(false); router.push('/admin/menu?tab=items') }}>
                  Cancelar
                </Button>
              </div>
            </form>
          </div>
        </div>
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
            <Button onClick={() => { setEditingCategory(null); setCategoryForm({ name: '', slug: '', description: '', displayOrder: 0, published: false }); setShowCategoryForm(true) }}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              Nova Categoria
            </Button>
          </div>
          <div className="divide-y divide-border">
            {categories.length === 0 ? (
              <div className="p-12 text-center text-charcoal-500">
                <Package className="h-12 w-12 mx-auto text-charcoal-300 mb-3" aria-hidden="true" />
                <p className="mb-2">Nenhuma categoria criada</p>
                <Button onClick={() => { setEditingCategory(null); setCategoryForm({ name: '', slug: '', description: '', displayOrder: 0, published: false }); setShowCategoryForm(true) }}>
                  Criar primeira categoria
                </Button>
              </div>
            ) : (
              categories.map((cat, index) => (
                <div key={cat.id} className="p-4 hover:bg-cream-50 transition-colors">
                  <div className="flex items-center gap-4">
                    {/* Drag handle */}
                    <button
                      className="text-charcoal-300 hover:text-charcoal-500 p-1"
                      aria-label="Reordenar"
                    >
                      <GripVertical className="h-5 w-5" />
                    </button>
                    {/* Status */}
                    <button
                      onClick={() => handleTogglePublish('category', cat.id, !cat.published)}
                      className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${cat.published ? 'bg-sage-100 text-sage-600' : 'bg-charcoal-100 text-charcoal-400'}`}
                      aria-label={cat.published ? 'Despublicar' : 'Publicar'}
                    >
                      {cat.published ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                    </button>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-charcoal-900 truncate">{cat.name}</p>
                      <p className="text-xs text-charcoal-500">
                        Slug: {cat.slug} • {cat._count?.menuItems || 0} itens • {cat.published ? 'Publicada' : 'Rascunho'}
                      </p>
                    </div>
                    {/* Actions */}
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
            <Button onClick={() => { setEditingItem(null); setItemForm({ categoryId: categories[0]?.id || '', name: '', slug: '', description: '', priceInCents: 0, imagePath: '', imageAlt: '', displayOrder: 0, published: false, available: true, isVegan: false, isChildFriendly: false }); setShowItemForm(true) }}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              Novo Item
            </Button>
          </div>
          <div className="divide-y divide-border">
            {items.length === 0 ? (
              <div className="p-12 text-center text-charcoal-500">
                <Menu className="h-12 w-12 mx-auto text-charcoal-300 mb-3" aria-hidden="true" />
                <p className="mb-2">Nenhum item criado</p>
                <Button onClick={() => { setEditingItem(null); setItemForm({ categoryId: categories[0]?.id || '', name: '', slug: '', description: '', priceInCents: 0, imagePath: '', imageAlt: '', displayOrder: 0, published: false, available: true, isVegan: false, isChildFriendly: false }); setShowItemForm(true) }}>
                  Criar primeiro item
                </Button>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="p-4 hover:bg-cream-50 transition-colors">
                  <div className="flex items-center gap-4">
                    {/* Drag handle */}
                    <button className="text-charcoal-300 hover:text-charcoal-500 p-1" aria-label="Reordenar">
                      <GripVertical className="h-5 w-5" />
                    </button>
                    {/* Image thumbnail */}
                    {item.imagePath && (
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        <img src={item.imagePath} alt="" className="w-full h-full object-cover" />
                      </div>
                    )}
                    {/* Status badges */}
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
                    {/* Info */}
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
                    {/* Actions */}
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