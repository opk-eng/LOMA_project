# LOMA project — handoff prompt for the next session

Copy everything below (inside the block) as the prompt for the next session.

---

## Context

Continue work on `LOMA_project` (an artisanal bakery/restaurant site + admin dashboard per the original LOMA prompt requirements). Repo: Next.js 16.4.2 App Router (Turbopack, **breaking changes vs. known Next — read `AGENTS.md` and `node_modules/next/dist/docs/` before writing Next-specific code**), React 19, Prisma **5.22.0** (pinned — Prisma 7 was in package.json and broke the build; do NOT upgrade Prisma without migrating the config), SQLite dev DB (`dev.db`, via `DATABASE_URL` in `.env`), Tailwind v4, Zod 4, Playwright 1.64, Vitest 1.6. Windows PowerShell environment.

## State already verified green (do not re-do) sk-ce10d2717562055f-def96b-895afad2

- `npm run typecheck` → clean
- `npx eslint src --max-warnings=0` → clean
- `npm test` (32 unit + 25 integration, isolated `integration.db` created by `node scripts/integration-setup.mjs`, auto-run via `pretest`) → 57/57 pass
- `npm run build` → succeeds; all routes dynamic (`export const dynamic = 'force-dynamic'` in root layout; `cacheComponents`/`partialPrefetching` were removed from `next.config.ts` because they conflict with force-dynamic and PPR respectively)
- Public routes all return 200; `/admin` → 307 → `/admin/login` (redirect loop fixed by moving protected pages into the `src/app/(admin)/admin/...` route group so `/admin/login` is outside the auth-gated layout)
- Docs/README partially updated; `.gitignore` covers `*.db`, `public/uploads/`, Playwright outputs

## Current Status: Debugging E2E "Can create a new category" test

Last run: `npm run test:e2e` (2 projects: chromium + mobile-chrome; `globalSetup` in `tests/e2e/global-setup.ts` re-creates and seeds `test.db` on every run; webServer env sets `LOGIN_RATE_LIMIT_MAX_ATTEMPTS=100` so the in-memory login rate limiter in `src/actions/auth.ts` doesn't lock out the suite — the limiter reads `process.env.LOGIN_RATE_LIMIT_MAX_ATTEMPTS` / `LOGIN_RATE_LIMIT_WINDOW_MS`, defaults 5 / 15min).

### A. Fixed but NOT yet re-verified (edit made, no re-run)

`tests/e2e/smoke.spec.ts` strict-mode locator fixes:
- Visit test: `page.locator('main address').getByText('CLN 303').first()` (the `<address>` block exists in both main and footer)
- Footer test: `footer.locator('a[href="/"]').first()` (logo + "Início" both point to `/`)

### B. The real blocker: "Can create a new category" (and the two publish-flow tests)

Repro: `npx playwright test -g "Can create a new category" --project=chromium`
Failure: after filling the modal and clicking "Criar categoria", the test expects `#category-form-title` to disappear — it stays visible for 10s.

Root-cause candidates (not yet determined which — **this is the #1 thing to investigate**):
1. `handleSaved` in `src/app/(admin)/admin/menu/page.tsx` closes the modal via `router.push('/admin/menu?tab=categories')` + `router.refresh()`. In Next 16 this may not update `useSearchParams()` synchronously, so `showCategoryForm` (derived from `new`/`edit` params) stays true. Fix options: keep the modal open-state in local state set synchronously on success (URL params only for deep-linking), or add a `useEffect`-safe derivation; verify with the failing test.
2. The server action may be **failing silently**: `CategoryForm.submit` calls `createCategoryAction({success:false,error:''}, formData)`; on failure it sets `fieldErrors` but the modal just stays open — an E2E test can't tell success from failure. Debug by temporarily asserting the field-error messages are absent, or log `result` in the form.
3. Boolean serialization was already fixed: `appendFormFields()` (top of the menu page) sends checked flags as `"on"` and omits unchecked (server actions read `formData.get('published') === 'on'`). The old code sent `"true"`/`"false"` which the server read as `false` — that bug is fixed in source; verify the fix is actually in effect by creating a PUBLISHED category in the E2E and checking it appears on `/cardapio` (the "A published new category shows up on /cardapio" test).

Also verify `Can create a new menu item` (same modal pattern, `#item-form-title`, `ItemForm`).

### C. After B is fixed: re-run the full suite until 34/34

`Get-NetTCPConnection -LocalPort 3000` → kill any listener first, then `npm run test:e2e`.

## Remaining tasks (in order)

1. **Finish E2E** (section B/C above). Target: 34/34 on both projects.
2. **Update `docs/` and `README.md` to match reality** — they still describe the old architecture. Needed changes:
   - Prisma 5.22 (not 7); schema now has `MediaAsset.originalName` (uploaded files stored under safe names in `public/uploads/`, `fileName` = safe name for URL building, `originalName` = display name); media page uses `next/image`.
   - Admin routes live under `src/app/(admin)/admin/**` (route group); `/admin/login` is outside the auth layout.
   - New scripts: `test`, `pretest` (integration DB setup), `test:integration`, `test:unit`, `test:coverage`, `test:e2e` (+`test:e2e:setup`), `typecheck`; test layout: `tests/unit` (pure), `tests/integration` (real Prisma + isolated `integration.db`), `tests/e2e` (Playwright, `global-setup.ts` re-seeds `test.db`), `tests/setup/unit-mocks.ts` (import in a test file to get Prisma/jose/bcrypt/next mocks).
   - `src/actions/auth.ts` rate limiter is env-configurable: `LOGIN_RATE_LIMIT_MAX_ATTEMPTS` (default 5), `LOGIN_RATE_LIMIT_WINDOW_MS` (default 900000) — add to `.env.example`.
   - Root layout `export const dynamic = 'force-dynamic'`; no `cacheComponents`/`partialPrefetching` in `next.config.ts`.
   - Vitest runs in `node` environment (not jsdom — jsdom realm breaks jose HS256 key checks) with `pool: 'forks'`, `fileParallelism: false` (shared DB file → no parallel files).
   - Remove/adjust anything claiming `Session` DB-backed auth: only JWT cookie sessions exist (`src/lib/auth.ts`, cookie `loma_session`, 8h).
3. **Remove unused `better-auth` dependency** from `package.json` (grep shows zero usages; the project uses hand-rolled jose JWT + bcryptjs). Also drop `supertest` if unused after test passes.
4. **`public/og-default.jpg`** referenced by root-layout metadata doesn't exist — create a clearly-marked placeholder OG image (1200×630, brand wordmark, NOT a fake photo) and list it in `docs/CONTENT_AND_ASSETS.md` as an item to replace with an authorized image.
5. **Final gate**: `npm run typecheck` + `npx eslint src --max-warnings=0` + `npm test` + `npm run build` + `npm run test:e2e` all green, then produce the LOMA prompt's "REQUIRED FINAL REPORT" section (implemented vs. pending: official images, owner confirmation of hours/contact, production Postgres + persistent image storage, first-admin password change, domain/HTTPS).

## Gotchas (learned the hard way in this repo)

- Prisma SQLite `file:./x.db` resolves **relative to process.cwd()** at runtime → all DBs (`dev.db`, `test.db`, `integration.db`) sit at the project root; setup scripts delete+recreate `test.db`/`integration.db` for determinism (E2E tests use fixed slugs like `teste-e2e-categoria`).
- `npm run start` warns `"next start" does not work with "output: standalone"` — functional, just noisy; don't chase it.
- Playwright `webServer` reuses an existing port-3000 listener (`reuseExistingServer` in non-CI) — kill stray servers before runs or the suite tests the wrong process/DB.
- Next.js injects `#__next-route-announcer__` with `role="alert"` — target `[role="alert"]` with `.filter({hasText})` or specific text.
- Admin layout top bar uses `<h2>`; each admin page supplies the `<h1>` (E2E asserts on `main h1`).
- The dev server can be started for manual checking with: `node node_modules/next/dist/bin/next start` (the `node_modules/.bin/next` shim is a sh-script and fails when invoked via `node` on Windows).
