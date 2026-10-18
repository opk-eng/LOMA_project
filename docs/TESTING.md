# Testes — LOMA

## Estratégia de Testes

### Pirâmide de Testes
```
         E2E (Playwright)          ← Poucos, críticos, lentos
        /          \
   Integração (Vitest)              ← Médios, fluxos completos
      /              \
Unitários (Vitest)                  ← Muitos, rápidos, isolados
```

### Cobertura Alvo
- **Unitários**: ≥ 80% (validações, helpers, utils)
- **Integração**: Fluxos críticos (auth, CRUD, upload)
- **E2E**: Jornadas principais (login, cardápio, admin CRUD)

---

## Testes Unitários (`tests/unit/`)

### O que testar
- `formatPrice`, `parsePriceToCents`, `generateSlug`
- Zod schemas (validação sucesso/falha)
- Regras de negócio: publicação, ordenação, disponibilidade
- Helpers de data/horário (Brasília timezone)

### Exemplo
```typescript
// tests/unit/validations.test.ts
import { describe, it, expect } from 'vitest'
import { formatPrice, parsePriceToCents, generateSlug } from '@/lib/validations'

describe('formatPrice', () => {
  it('formata centavos para real brasileiro', () => {
    expect(formatPrice(1250)).toBe('12,50')
    expect(formatPrice(950)).toBe('9,50')
    expect(formatPrice(0)).toBe('0,00')
  })
})

describe('generateSlug', () => {
  it('normaliza acentos e espaços', () => {
    expect(generateSlug('Pão Artesanal')).toBe('pao-artesanal')
    expect(generateSlug('Café da Manhã')).toBe('cafe-da-manha')
  })
})
```

### Executar
```bash
npm run test          # Watch mode
npm run test:run      # Single run
npm run test:coverage # Com cobertura
```

---

## Testes de Integração (`tests/integration/`)

### O que testar
- Prisma CRUD (criar, ler, atualizar, excluir)
- Relacionamentos e constraints (FK, unique)
- Server Actions com sessão mockada
- Validação Zod em actions
- Revalidação de cache (`revalidatePath`)

### Setup: Banco de Teste Isolado
```typescript
// tests/setup/test-db.ts
import { PrismaClient } from '@prisma/client'

// Usa SQLite em memória para testes
export const testPrisma = new PrismaClient({
  datasources: { db: { url: 'file:./test.db' } },
})

beforeAll(async () => {
  await testPrisma.$connect()
  await testPrisma.$executeRaw`PRAGMA foreign_keys = ON`
})

afterAll(async () => {
  await testPrisma.$disconnect()
  // Limpar arquivo de teste
  await fs.unlink('./test.db').catch(() => {})
})

beforeEach(async () => {
  // Limpar tabelas na ordem correta (FK)
  await testPrisma.auditLog.deleteMany()
  await testPrisma.menuItem.deleteMany()
  await testPrisma.category.deleteMany()
  await testPrisma.mediaAsset.deleteMany()
  await testPrisma.adminUser.deleteMany()
  // BusinessSettings é singleton - resetar
  await testPrisma.businessSettings.update({
    where: { id: 'main' },
    data: { /* defaults */ }
  })
})
```

### Exemplo: Server Action com Mock
```typescript
// tests/integration/categories.test.ts
import { describe, it, expect, vi } from 'vitest'
import { createCategoryAction } from '@/actions/categories'
import { testPrisma } from '../setup/test-db'

vi.mock('@/lib/db', () => ({ default: testPrisma }))
vi.mock('@/lib/auth', () => ({
  requireAuth: vi.fn().mockResolvedValue({ userId: 'test-user', email: 'test@test.com', role: 'admin' })
}))

describe('createCategoryAction', () => {
  it('cria categoria válida', async () => {
    const formData = new FormData()
    formData.append('name', 'Test Category')
    formData.append('slug', 'test-category')
    formData.append('displayOrder', '1')
    formData.append('published', 'on')

    const result = await createCategoryAction({ success: false, error: '' }, formData)

    expect(result.success).toBe(true)
    expect(result.category?.slug).toBe('test-category')
  })

  it('rejeita slug duplicado', async () => {
    // Primeiro cria
    await testPrisma.category.create({ data: { name: 'Existing', slug: 'existing', displayOrder: 0 } })

    const formData = new FormData()
    formData.append('name', 'Duplicate')
    formData.append('slug', 'existing')
    formData.append('displayOrder', '2')
    formData.append('published', 'on')

    const result = await createCategoryAction({ success: false, error: '' }, formData)

    expect(result.success).toBe(false)
    expect(result.error).toContain('slug')
  })
})
```

---

## Testes E2E (Playwright) (`tests/e2e/`)

### Configuração
```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 5'] } },
    { name: 'mobile-safari', use: { ...devices['iPhone 12'] } },
  ],
  webServer: {
    command: 'npm run start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
})
```

### Cenários Obrigatórios

#### 1. Site Público
```typescript
// tests/e2e/public-site.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Site Público', () => {
  test('Home carrega com hero e navegação', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('h1')).toContainText('simples')
    await expect(page.locator('nav')).toBeVisible()
  })

  test('Cardápio mostra categorias e itens', async ({ page }) => {
    await page.goto('/cardapio')
    await expect(page.locator('h1')).toContainText('Cardápio')
    // Verifica se há pelo menos uma categoria publicada
    await expect(page.locator('[role="listitem"]')).toHaveCount.greaterThan(0)
  })

  test('Filtro de categoria funciona', async ({ page }) => {
    await page.goto('/cardapio')
    await page.click('button:has-text("Padaria Artesanal")')
    // Verifica que apenas itens da categoria são mostrados
  })

  test('Visite-nos mostra endereço e horários', async ({ page }) => {
    await page.goto('/visite-nos')
    await expect(page.locator('text=CLN 303')).toBeVisible()
    await expect(page.locator('text=Segunda-feira')).toBeVisible()
  })

  test('Link telefone é clicável', async ({ page }) => {
    await page.goto('/')
    const phoneLink = page.locator('a[href^="tel:"]')
    await expect(phoneLink).toHaveAttribute('href', /tel:\+556133269714/)
  })

  test('Link Instagram abre em nova aba', async ({ page }) => {
    await page.goto('/')
    const igLink = page.locator('a[href*="instagram.com/lomacozinha"]')
    await expect(igLink).toHaveAttribute('target', '_blank')
    await expect(igLink).toHaveAttribute('rel', 'noopener noreferrer')
  })
})
```

#### 2. Autenticação Admin
```typescript
// tests/e2e/admin-auth.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Autenticação Admin', () => {
  test('Login com credenciais válidas redireciona para dashboard', async ({ page }) => {
    await page.goto('/admin/login')
    await page.fill('input[name="email"]', 'admin@loma.local')
    await page.fill('input[name="password"]', 'admin123')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL('/admin')
    await expect(page.locator('h1')).toContainText('Visão Geral')
  })

  test('Login com credenciais inválidas mostra erro', async ({ page }) => {
    await page.goto('/admin/login')
    await page.fill('input[name="email"]', 'admin@loma.local')
    await page.fill('input[name="password"]', 'wrong')
    await page.click('button[type="submit"]')
    await expect(page.locator('[role="alert"]')).toContainText('inválidos')
  })

  test('Acesso direto a /admin sem login redireciona para login', async ({ page }) => {
    await page.goto('/admin')
    await expect(page).toHaveURL('/admin/login')
  })

  test('Logout funciona', async ({ page }) => {
    await page.goto('/admin/login')
    await page.fill('input[name="email"]', 'admin@loma.local')
    await page.fill('input[name="password"]', 'admin123')
    await page.click('button[type="submit"]')
    await page.click('form button:has-text("Sair")') // No sidebar
    await expect(page).toHaveURL('/admin/login')
  })
})
```

#### 3. CRUD Admin
```typescript
// tests/e2e/admin-crud.spec.ts
import { test, expect } from '@playwright/test'

test.describe('CRUD Cardápio Admin', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/admin/login')
    await page.fill('input[name="email"]', 'admin@loma.local')
    await page.fill('input[name="password"]', 'admin123')
    await page.click('button[type="submit"]')
  })

  test('Criar categoria', async ({ page }) => {
    await page.goto('/admin/menu?tab=categories')
    await page.click('button:has-text("Nova Categoria")')
    await page.fill('input[name="name"]', 'Teste E2E')
    await page.fill('input[name="slug"]', 'teste-e2e')
    await page.click('button[type="submit"]')
    await expect(page.locator('text=Teste E2E')).toBeVisible()
  })

  test('Criar item de cardápio', async ({ page }) => {
    await page.goto('/admin/menu?tab=items')
    await page.click('button:has-text("Novo Item")')
    await page.selectOption('select[name="categoryId"]', { label: 'Padaria Artesanal' })
    await page.fill('input[name="name"]', 'Item E2E')
    await page.fill('input[name="slug"]', 'item-e2e')
    await page.fill('input[name="priceInCents"]', '1500')
    await page.click('button[type="submit"]')
    await expect(page.locator('text=Item E2E')).toBeVisible()
  })

  test('Publicar item e verificar no site público', async ({ page }) => {
    // Criar item publicado
    await page.goto('/admin/menu?tab=items')
    await page.click('button:has-text("Novo Item")')
    await page.selectOption('select[name="categoryId"]', { label: 'Padaria Artesanal' })
    await page.fill('input[name="name"]', 'Item Público E2E')
    await page.fill('input[name="slug"]', 'item-publico-e2e')
    await page.fill('input[name="priceInCents"]', '2000')
    await page.check('input[name="published"]')
    await page.check('input[name="available"]')
    await page.click('button[type="submit"]')

    // Verificar no site público
    await page.goto('/cardapio')
    await expect(page.locator('text=Item Público E2E')).toBeVisible()
    await expect(page.locator('text=R$ 20,00')).toBeVisible()
  })

  test('Excluir item', async ({ page }) => {
    await page.goto('/admin/menu?tab=items')
    // Encontrar item de teste e excluir
    await page.click('button[aria-label="Excluir"]:near(:text("Item E2E"))')
    await page.click('button:has-text("Excluir")') // Confirmação
    await expect(page.locator('text=Item E2E')).not.toBeVisible()
  })
})
```

### Executar E2E
```bash
# Terminal 1: Build e start produção
npm run build && npm run start

# Terminal 2: Rodar testes
npm run test:e2e

# Com UI
npm run test:e2e -- --ui

# Apenas Chromium
npm run test:e2e -- --project=chromium
```

---

## Testes de Segurança

### Automatizados (CI)
```bash
# Vulnerabilidades de dependências
npm audit --audit-level=high

# Verificar secrets no código (truffleHog, git-secrets)
# SAST (CodeQL, Semgrep) - configurar no GitHub Actions
```

### Manuais (Checklist)
- [ ] Tentar acessar `/admin` sem login → redirect login
- [ ] Tentar chamar Server Action sem sessão → 401
- [ ] Tentar manipular ID de outro usuário → 403/404
- [ ] Upload arquivo .php/.exe → rejeitado
- [ ] Upload > 5MB → rejeitado
- [ ] XSS em campos de texto → sanitizado (React auto-escape)
- [ ] CSRF em formulários → SameSite=Lax protege
- [ ] Rate limit login → bloqueia após 5 tentativas

---

## Ambiente de Teste

### Banco de Dados
- **Unit/Integration**: SQLite em arquivo temporário (`file:./test.db`)
- **E2E**: Mesma instância do dev (`file:./dev.db`) — **cuidado com dados reais**
  - Recomendado: Seed limpo antes dos testes E2E
  - Ou usar banco separado para E2E

### Variáveis de Ambiente de Teste
```env
# .env.test
DATABASE_URL="file:./test.db"
JWT_SECRET="test-secret-min-32-chars-for-testing-only"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
NODE_ENV="test"
```

### CI/CD (GitHub Actions)
```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  unit-integration:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm run test:run
      - run: npm run test:coverage

  e2e:
    runs-on: ubuntu-latest
    needs: unit-integration
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }
      - run: npm ci
      - run: npx prisma generate
      - run: npx prisma db push
        env: { DATABASE_URL: "file:./test.db" }
      - run: npm run db:seed
        env: { DATABASE_URL: "file:./test.db", NODE_ENV: "development" }
      - run: npm run build
      - run: npm run test:e2e
        env:
          DATABASE_URL: "file:./test.db"
```

---

## Ferramentas e Versões

| Ferramenta | Versão | Uso |
|------------|--------|-----|
| Vitest | ^2.x | Unit + Integration |
| Playwright | ^1.4x | E2E |
| @playwright/test | ^1.4x | Test runner E2E |
| @testing-library/react | ^16.x | Component testing (se necessário) |
| jsdom | ^25.x | Environment Vitest |

---

## Convenções

### Nomenclatura
- `*.test.ts` / `*.test.tsx` — Unit/Integration
- `*.spec.ts` — E2E (Playwright padrão)

### Estrutura AAA
```typescript
it('descrição do comportamento', async () => {
  // Arrange
  const input = ...
  
  // Act
  const result = await functionUnderTest(input)
  
  // Assert
  expect(result).toEqual(expected)
})
```

### Mocks
- `vi.mock()` no topo do arquivo
- Mock mínimo necessário
- `vi.clearAllMocks()` no `beforeEach` se necessário

### Dados de Teste
- Factory functions para criar objetos válidos
- `testPrisma` para integração real com DB
- Limpeza automática no `beforeEach`

---

## Métricas e Qualidade

### Cobertura Mínima
```bash
# vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 60,
        statements: 70,
      },
    },
  },
})
```

### Quality Gates (CI)
- `npm run lint` → 0 errors
- `npm run typecheck` → 0 errors
- `npm run test:run` → 100% pass
- `npm run test:e2e` → 100% pass (chromium mínimo)
- `npm audit --audit-level=high` → 0 vulnerabilities

---

## Troubleshooting

| Problema | Solução |
|----------|---------|
| `PrismaClientKnownRequestError: P2003` | FK violation — limpe ordem correta no `beforeEach` |
| `ReferenceError: requireAuth is not defined` | Mock `@/lib/auth` no teste |
| `revalidatePath` não funciona no teste | Mock `next/cache` ou aceitar que não testa cache |
| Playwright timeout | Aumentar `timeout` no `playwright.config.ts` |
| Port 3000 ocupada no CI | `webServer.reuseExistingServer: true` |
| Flaky tests E2E | `retries: 2`, `test.isolated()`, waits explícitos |