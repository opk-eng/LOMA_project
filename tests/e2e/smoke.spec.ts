import { test, expect } from '@playwright/test'

test.describe('Site Público - Smoke Tests', () => {
  test('Home page loads with hero and navigation', async ({ page }) => {
    await page.goto('/')

    // Check hero content
    await expect(page.locator('h1')).toContainText('simples')
    await expect(page.locator('h1')).toContainText('extraordinária')

    // Check navigation
    await expect(page.locator('nav')).toBeVisible()
    await expect(page.locator('a:has-text("Cardápio")')).toBeVisible()
    await expect(page.locator('a:has-text("Sobre")')).toBeVisible()
    await expect(page.locator('a:has-text("Galeria")')).toBeVisible()
    await expect(page.locator('a:has-text("Visite-nos")')).toBeVisible()
  })

  test('Menu page loads', async ({ page }) => {
    await page.goto('/cardapio')

    await expect(page.locator('h1')).toContainText('Cardápio')
  })

  test('About page loads', async ({ page }) => {
    await page.goto('/sobre')

    await expect(page.locator('h1')).toContainText('Sobre')
  })

  test('Gallery page loads', async ({ page }) => {
    await page.goto('/galeria')

    await expect(page.locator('h1')).toContainText('Galeria')
  })

  test('Visit page loads with address and phone', async ({ page }) => {
    await page.goto('/visite-nos')

    await expect(page.locator('h1')).toContainText('Visite-nos')
    await expect(page.locator('text=CLN 303')).toBeVisible()
    await expect(page.locator('a[href^="tel:"]')).toBeVisible()
  })

  test('Footer has correct links and copyright', async ({ page }) => {
    await page.goto('/')

    const footer = page.locator('footer')
    await expect(footer).toBeVisible()
    await expect(footer.locator('text=LOMA')).toBeVisible()
    await expect(footer.locator('a[href*="instagram.com"]')).toBeVisible()
    await expect(footer.locator(`text=© ${new Date().getFullYear()}`)).toBeVisible()
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
    await expect(page.locator('h1')).toContainText('Visão Geral')
  })

  test('Login with invalid credentials shows error', async ({ page }) => {
    await page.goto('/admin/login')

    await page.fill('input[name="email"]', 'admin@loma.local')
    await page.fill('input[name="password"]', 'wrongpassword')
    await page.click('button[type="submit"]')

    await expect(page.locator('[role="alert"]')).toContainText('inválidos')
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

    await expect(page.locator('h1')).toContainText('Gerenciar Cardápio')
    await expect(page.locator('button:has-text("Categorias")')).toBeVisible()
    await expect(page.locator('button:has-text("Itens")')).toBeVisible()
  })

  test('Can create a new category', async ({ page }) => {
    await page.goto('/admin/menu?tab=categories')

    await page.click('button:has-text("Nova Categoria")')
    await expect(page.locator('h2')).toContainText('Nova Categoria')

    await page.fill('input[name="name"]', 'Teste E2E Categoria')
    await page.fill('input[name="slug"]', 'teste-e2e-categoria')
    await page.fill('input[name="displayOrder"]', '10')
    await page.check('input[name="published"]')
    await page.click('button[type="submit"]')

    // Should close modal and show in list
    await expect(page.locator('text=Teste E2E Categoria')).toBeVisible()
  })

  test('Can create a new menu item', async ({ page }) => {
    await page.goto('/admin/menu?tab=items')

    await page.click('button:has-text("Novo Item")')
    await expect(page.locator('h2')).toContainText('Novo Item do Cardápio')

    // Select category (first available)
    await page.selectOption('select[name="categoryId"]', { index: 0 })

    await page.fill('input[name="name"]', 'Teste E2E Item')
    await page.fill('input[name="slug"]', 'teste-e2e-item')
    await page.fill('input[name="priceInCents"]', '1500')
    await page.check('input[name="published"]')
    await page.check('input[name="available"]')
    await page.click('button[type="submit"]')

    await expect(page.locator('text=Teste E2E Item')).toBeVisible()
  })
})

test.describe('Mobile Responsiveness', () => {
  test('Mobile menu works on home page', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    // Mobile menu button should be visible
    await expect(page.locator('button[aria-label="Abrir menu"]')).toBeVisible()

    // Click to open
    await page.click('button[aria-label="Abrir menu"]')

    // Menu items should be visible
    await expect(page.locator('text=Cardápio')).toBeVisible()
    await expect(page.locator('text=Sobre')).toBeVisible()
  })

  test('Menu page is usable on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/cardapio')

    await expect(page.locator('h1')).toContainText('Cardápio')
    // Categories should stack vertically
  })
})