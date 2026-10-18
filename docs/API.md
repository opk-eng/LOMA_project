# API e Contratos — LOMA

## Visão Geral

A API é baseada em **Server Actions** (React Server Functions) para mutações e **Server Components** para leitura. Route Handlers expõem endpoints JSON para o painel admin consumir via fetch.

Todas as operações administrativas requerem autenticação (JWT em cookie HttpOnly).

## Server Actions (Mutações)

### Autenticação

#### `loginAction(formData: FormData): Promise<AuthResult>`
- **Input**: `email` (string, email), `password` (string, min 1)
- **Output**: `{ success: true }` ou `{ success: false, error: string }`
- **Rate limit**: 5 tentativas / 15 min por email
- **Cookies**: Seta `loma_session` (HttpOnly, Secure, SameSite=Lax, 8h)

#### `logoutAction(): Promise<void>`
- **Cookies**: Deleta `loma_session`
- **Redirect**: `/admin/login`

---

### Categorias

#### `createCategoryAction(formData: FormData): Promise<CategoryActionResult>`
- **Input** (CategoryInput):
  - `name`: string (1-100)
  - `slug`: string (1-100, regex `^[a-z0-9-]+$`, único)
  - `description?`: string (max 500)
  - `displayOrder`: number (int, ≥0, default 0)
  - `published`: boolean (default false)
- **Output**: `{ success: true, category: { id, slug } }` ou `{ success: false, error, issues? }`
- **Revalida**: `/admin/menu`, `/admin`, `/cardapio`

#### `updateCategoryAction(formData: FormData): Promise<CategoryActionResult>`
- **Input**: `id` + CategoryInput
- **Validação**: slug único exceto self
- **Revalida**: `/admin/menu`, `/admin`, `/cardapio`

#### `toggleCategoryPublishAction(id: string, published: boolean): Promise<CategoryActionResult>`
- **Revalida**: `/admin/menu`, `/admin`, `/cardapio`

#### `deleteCategoryAction(id: string): Promise<CategoryActionResult>`
- **Bloqueio**: Falha se categoria tem itens (`onDelete: Restrict`)
- **Revalida**: `/admin/menu`, `/admin`

#### `reorderCategoriesAction(updates: { id, displayOrder }[]): Promise<{ success, error? }>`
- **Transação**: Atualiza todas atomicamente
- **Revalida**: `/admin/menu`, `/cardapio`

---

### Itens do Cardápio

#### `createMenuItemAction(formData: FormData): Promise<MenuItemActionResult>`
- **Input** (MenuItemInput):
  - `categoryId`: string (FK existente)
  - `name`: string (1-150)
  - `slug`: string (1-150, regex `^[a-z0-9-]+$`, único)
  - `description?`: string (max 1000)
  - `priceInCents`: number (int, ≥0, default 0)
  - `imagePath?`: string
  - `imageAlt?`: string (max 200)
  - `displayOrder`: number (int, ≥0, default 0)
  - `published`: boolean (default false)
  - `available`: boolean (default true)
  - `isVegan`: boolean (default false)
  - `isChildFriendly`: boolean (default false)
- **Revalida**: `/admin/menu`, `/admin`, `/cardapio`

#### `updateMenuItemAction(formData: FormData): Promise<MenuItemActionResult>`
- **Input**: `id` + MenuItemInput
- **Validação**: categoria existe, slug único exceto self
- **Revalida**: `/admin/menu`, `/admin`, `/cardapio`

#### `toggleMenuItemPublishAction(id: string, published: boolean): Promise<MenuItemActionResult>`
- **Revalida**: `/admin/menu`, `/admin`, `/cardapio`

#### `toggleMenuItemAvailableAction(id: string, available: boolean): Promise<MenuItemActionResult>`
- **Revalida**: `/admin/menu`, `/admin`, `/cardapio`

#### `deleteMenuItemAction(id: string): Promise<MenuItemActionResult>`
- **Revalida**: `/admin/menu`, `/admin`, `/cardapio`

#### `reorderMenuItemsAction(updates: { id, displayOrder }[]): Promise<{ success, error? }>`
- **Transação**: Atualiza todas atomicamente
- **Revalida**: `/admin/menu`, `/cardapio`

---

### Mídia

#### `uploadImageAction(formData: FormData): Promise<UploadResult>`
- **Input**: `image` (File), `altText?`, `attribution?`
- **Validação servidor**:
  - MIME: `image/jpeg`, `image/png`, `image/webp`, `image/avif`
  - Tamanho: ≤ 5MB
  - Nome seguro: timestamp + random + extensão original
- **Armazenamento**: `public/uploads/` (dev) — **configurar S3 para produção**
- **DB**: Cria registro em `MediaAsset`
- **Output**: `{ success: true, path, fileName, size, mimeType }` ou `{ success: false, error }`
- **Revalida**: `/admin/media`

#### `deleteImageAction(id: string): Promise<{ success, error? }>`
- **FS**: Deleta arquivo físico
- **DB**: Deleta registro `MediaAsset`
- **Revalida**: `/admin/media`

#### `getMediaAssets(): Promise<MediaAsset[]>`
- **Ordem**: `createdAt DESC`
- **Select**: id, fileName, mimeType, fileSize, altText, createdAt

---

### Configurações

#### `updateSettingsAction(formData: FormData): Promise<SettingsActionResult>`
- **Input** (BusinessSettingsInput):
  - `businessName`: string (1-200)
  - `brandDescription`: string (max 2000)
  - `address`: string (max 500)
  - `phone`: string (max 30)
  - `instagramUrl?`: string (URL válida)
  - `mondayOpen/Close?`: string (HH:MM)
  - ... (todos os 7 dias)
  - `hasOutdoorSeating`: boolean
  - `hasVeganOptions`: boolean
  - `hasChildMenu`: boolean
  - `seoTitle?`: string (max 200)
  - `seoDescription?`: string (max 300)
- **Revalida**: `/admin/settings`, `/`, `/cardapio`, `/sobre`, `/visite-nos`

#### `updateOgImageAction(ogImagePath: string): Promise<SettingsActionResult>`
- **Revalida**: `/`, `/cardapio`, `/sobre`, `/visite-nos`

---

## Route Handlers (Leitura Admin)

### `GET /api/admin/categories`
- **Auth**: Requerida
- **Response**: `Category[]` com `_count.menuItems`
- **Ordem**: `displayOrder ASC`

### `GET /api/admin/items`
- **Auth**: Requerida
- **Response**: `MenuItem[]` com `category { id, name }`
- **Ordem**: `category.displayOrder ASC`, `displayOrder ASC`

---

## Convenções de Erro

### Formato Padrão (Server Actions)
```typescript
type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; issues?: Record<string, string[]> }
```

### Códigos HTTP (Route Handlers)
| Código | Uso |
|--------|-----|
| 200 | Sucesso |
| 400 | Validação falhou (Zod) |
| 401 | Não autenticado |
| 403 | Não autorizado (role) |
| 404 | Recurso não encontrado |
| 409 | Conflito (slug duplicado, FK) |
| 500 | Erro interno (logado, não exposto) |

### Mensagens de Erro (pt-BR)
- Validação: "Campo obrigatório", "Formato inválido", "Já existe"
- Auth: "E-mail ou senha inválidos", "Sessão expirada"
- Negócio: "Categoria possui itens associados", "Arquivo muito grande"

---

## Validação (Zod Schemas)

### `loginSchema`
```typescript
{ email: z.email(), password: z.string().min(1) }
```

### `categorySchema`
```typescript
{
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
  description: z.string().max(500).optional(),
  displayOrder: z.coerce.number().int().min(0).default(0),
  published: z.boolean().default(false)
}
```

### `menuItemSchema`
```typescript
{
  categoryId: z.string().min(1),
  name: z.string().min(1).max(150),
  slug: z.string().min(1).max(150).regex(/^[a-z0-9-]+$/),
  description: z.string().max(1000).optional(),
  priceInCents: z.coerce.number().int().min(0).default(0),
  imagePath: z.string().optional(),
  imageAlt: z.string().max(200).optional(),
  displayOrder: z.coerce.number().int().min(0).default(0),
  published: z.boolean().default(false),
  available: z.boolean().default(true),
  isVegan: z.boolean().default(false),
  isChildFriendly: z.boolean().default(false)
}
```

### `businessSettingsSchema`
```typescript
{
  businessName: z.string().min(1).max(200),
  brandDescription: z.string().max(2000).default(''),
  address: z.string().max(500).default(''),
  phone: z.string().max(30).default(''),
  instagramUrl: z.url().optional().or(z.literal('')),
  // 7 dias × open/close: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).optional()
  hasOutdoorSeating: z.boolean().default(true),
  hasVeganOptions: z.boolean().default(true),
  hasChildMenu: z.boolean().default(true),
  seoTitle: z.string().max(200).optional(),
  seoDescription: z.string().max(300).optional()
}
```

---

## Helpers Exportados (`src/lib/validations.ts`)

| Função | Descrição |
|--------|-----------|
| `formatPrice(cents: number): string` | 1250 → "12,50" (pt-BR) |
| `parsePriceToCents(value: string): number` | "R$ 12,50" → 1250 |
| `generateSlug(text: string): string` | "Pão Artesanal" → "pao-artesanal" |

---

## Auditoria

Toda mutação administrativa registra em `AuditLog`:
```typescript
{
  actorId: session.userId,
  actorEmail: session.email,
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'PUBLISH' | 'UNPUBLISH' | 'LOGIN' | 'LOGOUT' | 'REORDER',
  entityType: 'Category' | 'MenuItem' | 'MediaAsset' | 'BusinessSettings' | 'AdminUser',
  entityId: string | 'multiple',
  metadata: JSON.stringify({ /* campos relevantes */ })
}
```

**Nunca** armazena: senhas, tokens, dados sensíveis completos.

---

## Exemplos de Uso (Client Components)

```tsx
// Login
const [state, action, pending] = useActionState(loginAction, { success: false })
<form action={action}>...</form>

// Criar categoria
const result = await createCategoryAction(initialState, formData)
if (result.success) router.refresh()

// Upload imagem
const result = await uploadImageAction(initialState, formData)
if (result.success) setImagePath(result.path)
```