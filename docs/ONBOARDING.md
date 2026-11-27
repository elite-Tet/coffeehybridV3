# Onboarding: CoffeeHybrid after the redesign

_For you, coming back to this code after a break. Read top to bottom once; after that, use the headings._

CoffeeHybrid is an order-ahead coffee app: customers order on their phone, get a pickup code, and show it at the counter. Staff see a live queue and scan (or type) codes. Admins manage the menu and see all orders. Orders are held **30 minutes**; three missed pickups pause ordering for **24 hours**.

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · shadcn/ui · Auth.js (NextAuth v5) · MongoDB Atlas via Mongoose · Vitest · Playwright.

---

## 1. Get it running (≈10 minutes)

**You need:** Node 20.9 or newer (`node -v`), npm, Google Chrome, and access to the MongoDB Atlas project (add your current IP under *Atlas → Network Access*).

```bash
git clone https://github.com/elite-Tet/coffeehybridV3.git
cd coffeehybridV3
npm ci
cp .env.example .env.local   # then fill in the values, see below
npm run dev                  # http://localhost:3000
```

Fill in `.env.local` (every variable is explained in [`.env.example`](../.env.example)):

| Variable | Where it comes from |
|---|---|
| `MONGODB_URI` | Atlas → Connect → Drivers |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | `http://localhost:3000` locally. **Keep the app on port 3000**: sign-in redirects go here. |
| `GOOGLE_CLIENT_ID/SECRET` | Optional. Email + password sign-in works without them. |
| `CRON_SECRET` | Any long random string; protects the order-expiry job. |

**First run with an empty database**
1. Register an account at `/register`. Every sign-up is a customer (by design; see §6).
2. Make yourself an admin: in Atlas, open the `users` collection and set your document's `role` to `"admin"`. Sign out and back in.
3. Load the sample menu: while signed in as admin, open the browser console on the site and run
   `await fetch('/api/admin/seed', { method: 'POST' }).then(r => r.json())`.
   It creates or updates 8 drinks and 2 categories from `server/seed/menu.ts`. It overwrites those 8 products by name, so don't run it after hand-editing them.

---

## 2. Where things live

```
app/            Routes only: pages, layouts, API handlers. Keep these files thin.
  (shop)/         customer pages: / (home), /menu, /checkout, /order/[id], /history
  (auth)/         /login, /register
  staff/          /staff (order queue), /staff/scan (QR + typed-code pickup)
  admin/          /admin (analytics), /admin/products, /admin/categories, /admin/orders
  api/            route handlers; each one checks its own auth (proxy.ts skips /api)
  globals.css     design tokens (Direction C palette, type scale, radius) + a few CSS classes
  layout.tsx      fonts, providers, skip link
components/
  ui/             shadcn primitives (generated; local edits are marked with a comment)
  layout/         site chrome: SiteHeader, SiteFooter, BottomTabBar, AccountSheet, Logo, WorkspaceSidebar (staff/admin), board-styles.ts
features/       one folder per domain: its components and client-side logic
  home/           homepage sections (Hero, PickupBoard, HowItWorks, MenuPreview, PickupPolicy, ClosingCta)
  menu/           ProductCard, ProductModal (customize sheet), CategoryTabs
  cart/           CartDrawer + cart.store.ts (zustand, persisted in localStorage)
  orders/         PickupTicket, CountdownTimer, StatusStepper, StatusChip, StrikeDots, ActiveOrderBar, order-status.ts
  auth/           AuthShell, AuthField, safe-callback.ts
  staff/          QRScanner (camera + typed code) and the staff sidebar
  admin/          admin sidebar, shared admin styles, orders CSV export
server/         server-only code; never import it from a 'use client' file
  auth.ts         Auth.js config (credentials + Google, JWT sessions)
  db.ts           cached Mongoose connection
  require-role.ts guard for API routes: `const c = await requireRole(['admin']); if (!c.ok) return c.response;`
  models/         User, Product, Category, Order, Strike
  seed/menu.ts    sample menu loaded by POST /api/admin/seed
lib/            framework-free helpers usable anywhere: qr, strikes, utils, validations/ (zod)
types/          shared TypeScript types
tests/
  unit/         Vitest unit tests
  e2e/          Playwright browser tests (journey, keyboard, accessibility)
docs/           audit, mockups, before/after screenshots, this guide, case study
proxy.ts        page-level auth and role gate (Next 16's name for middleware)
```

**Rule of thumb for new code:** a route goes in `app/`, anything specific to one domain goes in `features/<domain>/`, anything shared by several domains goes in `components/` or `lib/`, and anything that touches the database or secrets goes in `server/`.

**How a page is put together**, using the homepage as the example: `app/(shop)/page.tsx` (server component) calls `features/home/get-menu-preview.ts` (`server-only`, reads Mongo through `server/models`) and renders the `features/home/*` sections. The only client components are the interactive ones: `PickupBoard` and `HeroActions`.

---

## 3. Everyday commands

| Command | What it does |
|---|---|
| `npm run dev` | Dev server on :3000. ⚠️ Its `predev` step kills whatever is already on port 3000. |
| `npm run lint` | ESLint (zero warnings at the time of writing) |
| `npm run type-check` | TypeScript, no emit |
| `npm test` | Vitest unit tests (18) |
| `npm run build` | Production build |
| `npm run test:e2e` | Playwright against a production build on :3000 (run `npm run build` first). Needs `E2E_*` test accounts in your shell or `.env.local` for the signed-in tests. Otherwise they're skipped. |

**Before every commit:** `npm run lint && npm run type-check && npm test && npm run build`.

---

## 4. How to preview a change

1. **While editing:** `npm run dev`, open the page, save, and it reloads. For phone layouts open Chrome DevTools → device toolbar → 390 px wide (also check 320 px: that's where overflow shows up).
2. **Customer flows** need a signed-in customer and something in the cart: `/menu` → add a drink → `/checkout` → *Place order* → the ticket at `/order/[id]`.
3. **Staff flows** need an admin or staff account: `/staff` shows the queue. To test pickup without a camera, use *Camera not working?* on `/staff/scan` and type the 4-character code from the customer's ticket.
4. **Before you call it done:** `npm run build && npm run test:e2e`. The accessibility spec runs axe-core (WCAG 2.2 AA) on every route, and any violation fails the test.
5. **Visual comparison:** `docs/before/` (the March version and the unfinished cream redesign) vs `docs/after/` (this version), same file names. `docs/compare/` has side-by-side images.

---

## 5. Order the rebuild happened in (and what's next)

Each step was one reviewable commit with lint, type-check, tests and build passing:

1. Tooling (working lint script, `middleware` → `proxy`) and zero lint errors
2. Re-organise into `app/ · components/ · features/ · server/` (moves only)
3. Remove dead code and 6 unused dependencies
4. Security fixes (role escalation, unauthenticated admin routes, session-update escalation, open redirect)
5. Design tokens + site chrome (Direction C)
6. Homepage → 7. Menu → 8. Checkout, ticket, history → 9. Sign-in / sign-up
10. Staff/admin token pass + typed-code pickup
11. Site-wide responsive and accessibility pass
12. Browser tests, after screenshots, these docs

**Suggested next steps, in this order:**
_Done since the first version of this list: the scanner now pauses and resumes instead of tearing the camera down, size options are editable in the admin product dialog, and the staff/admin screens use the board layout (`docs/after/staff-admin/` has their own before/after)._

1. **Test the scanner on a real phone:** scan → *Next customer* → scan again. Headless tests can't drive a camera.
2. **Move the fork out of the old repo's folder.** Next.js warns that it picked the outer folder as the project root because there are two lockfiles. Or set `outputFileTracingRoot` in `next.config.ts`.
3. **CI:** run lint, type-check, unit tests and build on every push; run `test:e2e` against a preview deployment.
4. **Real photography and a copy review** with an actual café.

---

## 6. Things that will surprise you

- **Roles.** Self-registration always creates a `customer`. Staff and admin are set in the database. This is deliberate: anyone with "admin" in their email used to become an admin.
- **`/api` is not protected by `proxy.ts`.** Every route handler checks its own role (`server/require-role.ts`). When you add an API route, add the check.
- **Session updates re-read the database.** `session.update()` refreshes role and strikes from Mongo and ignores anything the browser sends.
- **Dark only.** `ThemeProvider` forces `dark`; colours live as tokens in `app/globals.css`. Use `bg-panel`, `text-signal`, `text-muted-foreground`, etc., not raw colours. Signal amber means "Ready": use it sparingly.
- **`.display` uses `var(--font-board)`, not `var(--font-display)`.** Tailwind's `@theme inline` doesn't emit `--font-*` as real CSS variables, so plain CSS has to reference the `next/font` variable directly.
- **Stale styles in dev?** Stop the dev server, delete `.next/dev`, start again (Turbopack's cache).
- **Ports.** Auth redirects use `NEXTAUTH_URL`, so on any port other than 3000, signed-out redirects go to :3000 and appear to fail.
- **Test accounts collect strikes.** Orders placed while testing and never picked up expire and count as missed pickups; after three, that account can't order for 24 hours. The journey e2e test registers a fresh customer each run for this reason.
- **Seed data overwrites by name** (§1). The menu itself is managed in `/admin/products`.
