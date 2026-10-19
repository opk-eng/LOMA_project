import { test, expect } from '@playwright/test'

test.describe('Site Público - Smoke Tests', () => {
  test('Home page loads with hero and navigation', async ({ page }) => {
    await page.goto('/')

    // Hero content
    await expect(page.locator('main h1')).toContainText('simples')
    await expect(page.locator('main h1')).toContainText('extraordinária')

    // The header's main navigation container exists on every viewport
    // (desktop nav is hidden on small screens; the mobile menu button is not).
    await expect(page.locator('[aria-label="Navegação principal"]')).toBeAttached()
    // The footer navigation is always present.
    await expect(page.locator('[aria-label="Navegação do rodapé"]')).toBeVisible()
  })

  test('Menu page loads', async ({ page }) => {
    await page.goto('/cardapio')

    await expect(page.locator('main h1')).toContainText('Cardápio')
  })

  test('About page loads', async ({ page }) => {
    await page.goto('/sobre')

    await expect(page.locator('main h1')).toContainText('Sobre a LOMA')
  })

  test('Gallery page loads', async ({ page }) => {
    await page.goto('/galeria')

    await expect(page.locator('main h1')).toContainText('Galeria')
  })

  test('Visit page loads with address and phone', async ({ page }) => {
    await page.goto('/visite-nos')

    await expect(page.locator('main h1')).toContainText('Venha nos visitar')
    // The address appears in both the main <address> block and the footer.
    await expect(page.locator('main address').getByText('CLN 303').first()).toBeVisible()
    await expect(page.locator('a[href^="tel:"]').first()).toBeVisible()
  })

  test('Footer has correct links and copyright', async ({ page }) => {
    await page.goto('/')

    const footer = page.locator('footer')
    await expect(footer).toBeVisible()
    // Two links point to "/" in the footer (logo + "Início"); take the first.
    await expect(footer.locator('a[href="/"]').first()).toBeVisible()
    await expect(footer.locator('a[href*="instagram.com"]').first()).toBeVisible()
    const year = new Date().getFullYear()
    await expect(footer.locator(`text=© ${year}`)).toBeVisible()
  })
})

test.describe('Admin Authentication', () => {
  test('Admin login page accessible', async ({ page }) => {
    await page.goto('/admin/login')

    await expect(page.locator('h1')).toContainText('Entrar no painel')
    await expect(page.locator('input[name="email"]')).toBeVisible()
    await expect(page.locator('input[name="password"]')).toBeVisible()
  })

  test('Login with valid credentials redirects to dashboard', async ({ page }) => {
    await page.goto('/admin/login')

    await page.fill('input[name="email"]', 'admin@loma.local')
    await page.fill('input[name="password"]', 'admin123')
    await page.click('button[type="submit"]')

    await expect(page).toHaveURL('/admin')
    await expect(page.locator('main h1')).toContainText('Visão Geral')
  })

  test('Login with invalid credentials shows error', async ({ page }) => {
    await page.goto('/admin/login')

    await page.fill('input[name="email"]', 'admin@loma.local')
    await page.fill('input[name="password"]', 'wrongpassword')
    await page.click('button[type="submit"]')

    // The login error alert (distinct from Next's route announcer).
    await expect(page.getByText('E-mail ou senha inválidos.')).toBeVisible()
  })

  test('Direct access to /admin without login redirects to login', async ({ page }) => {
    await page.goto('/admin')

    await expect(page).toHaveURL('/admin/login')
  })
})

test.describe('Admin Menu Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/admin/login')
    await page.fill('input[name="email"]', 'admin@loma.local')
    await page.fill('input[name="password"]', 'admin123')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL('/admin')
  })

  test('Can navigate to menu management', async ({ page }) => {
    await page.goto('/admin/menu')

    // Default tab is categories.
    await expect(page.locator('#categories-list-title')).toBeVisible()
    await expect(page.getByRole('button', { name: /Categorias/ })).toBeVisible()
    await expect(page.getByRole('button', { name: /Itens/ })).toBeVisible()
  })

  test('Can create a new category', async ({ page }) => {
    await page.goto('/admin/menu?tab=categories')

    // Clicking "Nova Categoria" navigates via router.push to ?new=true which
    // opens the CategoryForm modal.
    await page.getByRole('button', { name: 'Nova Categoria' }).click()
    // Wait for the modal heading (unique id on the modal).
    await expect(page.locator('#category-form-title')).toBeVisible()
    await expect(page.locator('#category-form-title')).toContainText('Nova Categoria')

    await page.fill('input[name="name"]', 'Teste E2E Categoria')
    await page.fill('input[name="slug"]', 'teste-e2e-categoria')
    await page.fill('input[name="displayOrder"]', '10')
    await page.check('input[name="published"]')
    await page.click('button:has-text("Criar categoria")')

    // Modal should close and the category should appear in the list.
    await expect(page.locator('#category-form-title')).not.toBeVisible()
    await expect(page.locator('div:has-text("Teste E2E Categoria")')).toBeVisible()
  })

  test('Can create a new menu item', async ({ page }) => {
    await page.goto('/admin/menu?tab=items')

    await page.getByRole('button', { name: 'Novo Item' }).click()
    await expect(page.locator('#item-form-title')).toBeVisible()
    await expect(page.locator('#item-form-title')).toContainText('Novo Item do Cardápio')

    // Select the first category.
    await page.selectOption('select[name="categoryId"]', { index: 0 })

    await page.fill('input[name="name"]', 'Teste E2E Item')
    await page.fill('input[name="slug"]', 'teste-e2e-item')
    await page.fill('input[name="priceInCents"]', '1500')
    await page.check('input[name="published"]')
    await page.check('input[name="available"]')
    await page.click('button:has-text("Criar item")')

    // Modal should close and the item should appear in the list.
    await expect(page.locator('#item-form-title')).not.toBeVisible()
    await expect(page.locator('div:has-text("Teste E2E Item")')).toBeVisible()
  })
})

test.describe('Publish flow: admin changes appear on the public site', () => {
  test('A published new category shows up on /cardapio without rebuilding', async ({ page }) => {
    const slug = `e2e-cat-${Date.now()}`
    const name = `Categoria E2E Cat ${slug}`

    // 1. Login and create + publish the category via the admin UI.
    await page.goto('/admin/login')
    await page.fill('input[name="email"]', 'admin@loma.local')
    await page.fill('input[name="password"]', 'admin123')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL('/admin')

    await page.goto('/admin/menu?tab=categories&new=true')
    await page.fill('input[name="name"]', name)
    await page.fill('input[name="slug"]', slug)
    await page.check('input[name="published"]')
    await page.click('button:has-text("Criar categoria")')

    // The category row should appear in the list (unique name → exact match).
    await expect(page.getByText(name, { exact: true })).toBeVisible()

    // 2. Verify it is visible on the public menu page.
    await page.goto('/cardapio')
    // Category names render as h3 headings; a unique name finds exactly one.
    await expect(page.getByText(name, { exact: true })).toBeVisible()
  })

  test('A draft category is hidden from the public site until published', async ({ page }) => {
    const slug = `e2e-draft-${Date.now()}`
    const name = `Rascunho E2E ${slug}`

    // Login.
    await page.goto('/admin/login')
    await page.fill('input[name="email"]', 'admin@loma.local')
    await page.fill('input[name="password"]', 'admin123')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL('/admin')

    // Create as draft (published unchecked by default).
    await page.goto('/admin/menu?tab=categories&new=true')
    await page.fill('input[name="name"]', name)
    await page.fill('input[name="slug"]', slug)
    await page.click('button:has-text("Criar categoria")')
    await expect(page.getByText(name, { exact: true })).toBeVisible()

    // Draft: not published yet → must NOT be on the public menu.
    await page.goto('/cardapio')
    await expect(page.getByText(name, { exact: true })).toHaveCount(0)

    // Publish it via the admin UI, then confirm it appears publicly.
    await page.goto('/admin/menu?tab=categories')
    // The row contains a button with aria-label="Publicar" next to the name.
    await page.getByRole('button', { name: 'Publicar', exact: true }).first().click()
    // Wait for the server to refresh the list.
    await expect(page.locator('#categories-list-title')).toBeAttached()
    await page.goto('/cardapio')
    await expect(page.getByText(name, { exact: true })).toBeVisible()
  })
})

test.describe('Mobile Responsiveness', () => {
  test('Mobile menu works on home page', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    // Mobile menu button (desktop nav is hidden; only the hamburger is visible).
    await expect(page.locator('button[aria-label="Abrir menu"]')).toBeVisible()

    // Click to open the mobile drawer.
    await page.click('button[aria-label="Abrir menu"]')

    // Links inside the mobile navigation drawer should now be visible.
    await expect(page.locator('#mobile-menu').getByRole('link', { name: 'Cardápio' })).toBeVisible()
    await expect(page.locator('#mobile-menu').getByRole('link', { name: 'Sobre' })).toBeVisible()
  })

  test('Menu page is usable on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/cardapio')

    await expect(page.locator('main h1')).toContainText('Cardápio')
    // Categories should stack vertically (grid-cols-1 at mobile).
  })
})
