# CoffeeHybrid V2 — Phase 1 Audit

_Audited 2026-11-26 · Next 16.1.7 / React 19.2.3 / Tailwind v4 / shadcn (radix-nova) / NextAuth v5 β / Mongoose 9 on MongoDB Atlas._

There are two states of the code, and both were audited:

| Label | What it is | How it was run |
|---|---|---|
| **committed** | Last commit `8362a18` (2026-03-20), dark "Order Ahead, Skip the Queue" UI | Separate git worktree, `next build && next start` on :3002 |
| **wip** | Your current working tree: an uncommitted, half-done light/cream redesign (18 modified files, ~1.3k lines changed, 15 new files) | `next build && next start` on :3001 |

Screenshots are in [`docs/screenshots/before/`](../screenshots/before/) (committed) and [`before-unfinished-redesign/`](../screenshots/before-unfinished-redesign/) (WIP), each with `desktop/` and `mobile/<route>.png`. That's 13 routes × 2 viewports × 2 states (desktop is 1440×900 and mobile is 390×844), all full-page. A scripted mobile order journey is in each folder’s `journey/`. Raw console, network and link data is in [`console-and-links.md`](console-and-links.md).

---

## 1. TL;DR

- **Both states build, typecheck and pass their tests.** `npm run lint` itself is broken: `next lint` was removed in Next 16. Running ESLint directly finds 27 problems in committed and 17 in WIP.
- **Two security holes need fixing before this is public portfolio code:**
  - Anyone who registers with "admin" in their email becomes an admin.
  - `GET /api/admin/seed` is unauthenticated and writes to the database.
- **The committed UI renders in Times New Roman.** A self-referencing CSS variable (`--font-sans: var(--font-sans)`) breaks the font stack. Its copy is sci-fi jargon ("Execute order", "Manifest verification", "Abort sequence").
- **4 of the 8 seed product images are dead Unsplash URLs** (404), in both states. Menu and home show empty boxes.
- **The WIP redesign is a big step up** in copy, hierarchy, tap-target sizes, the mobile tab bar and the ticket metaphor. It's a solid base for Phase 2/3, but it has layout bugs on mobile order detail and in the add-on checkboxes.
- **Dead code:** 11 unused modules and 2 unused UI primitives. 3 dependencies are unused (`recharts`, `react-hook-form`/`@hookform/resolvers`, `qrcode`), and `zod` is only used by unused files.

---

## 2. File / folder tree

Excluding `node_modules`, `.next`, `.git`, local tooling folders and `public/` (stock Next SVGs plus `public/images`). `✎` means modified in WIP and `+` means new in WIP.

```
.
├── app/
│   ├── layout.tsx ✎            root layout: fonts, providers, SiteChrome (wip)
│   ├── globals.css ✎           Tailwind v4 @theme tokens
│   ├── (public)/
│   │   ├── page.tsx ✎          /
│   │   ├── menu/page.tsx ✎     /menu
│   │   ├── checkout/page.tsx ✎ /checkout
│   │   ├── history/page.tsx ✎  /history
│   │   └── order/[id]/page.tsx ✎ /order/:id
│   ├── (auth)/login, register
│   ├── staff/  layout.tsx, page.tsx, scan/page.tsx
│   ├── admin/  layout.tsx, page.tsx, products/, categories/, orders/
│   └── api/
│       ├── auth/[...nextauth], auth/register
│       ├── products, products/[id], categories, categories/[id]
│       ├── orders ✎, orders/[id]
│       ├── staff/orders, staff/verify-qr
│       ├── admin/analytics, admin/orders, admin/seed
│       └── cron/expire-orders
├── components/
│   ├── admin/    AnalyticsChart, ProductForm, Sidebar, StrikeTable
│   ├── cart/     CartDrawer ✎, CartItem
│   ├── menu/     CategoryTabs ✎, DrinkCarousel ✎, ProductCard ✎, ProductModal ✎
│   ├── order/    CountdownTimer ✎, QRDisplay, +ActiveOrderBar, +PickupTicket, +StatusChip, +StatusStepper, +StrikeDots
│   ├── providers/NextAuthProvider, +ThemeProvider
│   ├── shared/   ClientOnly, ErrorBoundary, Footer ✎, LoadingSkeleton, Navbar ✎, +AccountSheet, +BottomTabBar, +Logo, +SiteChrome, +ThemeToggle
│   ├── staff/    OrderQueue, QRScanner, Sidebar
│   └── ui/       shadcn: badge button card checkbox dialog input label progress radio-group scroll-area separator sheet sonner
├── lib/          auth, mongodb, mongodb-client, mock-data, qr, routes, strikes, utils, +order-status, validations/{order,product}.schema
├── models/       Category, Order, Product, Strike, User
├── store/        cart.store.ts (zustand)
├── types/        index.ts
├── __tests__/    models/Product.test.ts, models/User.test.ts, setup.ts
├── middleware.ts             auth/role gate for pages (not /api)
├── README.md ✎, README.bak.md +, REDESIGN_CONTEXT.md +, REDESIGN_UXUI_BRIEF.md +, STITCH_DESKTOP.md +, STITCH_PHONE.md +
└── config: next.config.ts, tsconfig.json, tsconfig.tsbuildinfo (should be ignored), eslint.config.mjs, postcss.config.mjs,
            vitest.config.ts, components.json, vercel.json (cron), .env.example
```

---

## 3. Routes

### Pages

| Route | Gate | What it does | Notes |
|---|---|---|---|
| `/` | public | Landing: hero, popular drinks carousel, value props / "how pickup works" | Carousel reads **`lib/mock-data`**, not the DB, so prices can drift. In committed, carousel links go to `/menu?product=<mockId>` and `/menu` ignores that param (a dead deep link). |
| `/menu` | public | Category tabs, search, product grid, customize modal, add to cart | Product images: 4/8 are 404. |
| `/checkout` | signed-in | Cart review, strike status, place order (POST `/api/orders`) | Blocks when suspended (3 strikes). |
| `/order/[id]` | signed-in | Pickup QR ticket, status, 30-min countdown, items | Polls the order. |
| `/history` | public route, but the content is user-specific | Past orders, reorder | Not in middleware's protected list; the page handles the signed-out state itself. |
| `/login`, `/register` | public | Credentials + Google sign-in / sign-up | |
| `/staff` | staff/admin | Live order queue, polls every 15 s, advances status | |
| `/staff/scan` | staff/admin | Camera QR scanner (html5-qrcode) → `/api/staff/verify-qr` | **No manual code-entry fallback** if the camera fails. |
| `/admin` | admin | KPIs + charts | Hand-rolled; `recharts` is not used. |
| `/admin/products`, `/admin/categories`, `/admin/orders` | admin | CRUD tables + dialogs / all orders | `products/page.tsx` is 375 lines and inlines its own form; `components/admin/ProductForm` is unused. |

### API (`middleware` skips `/api`, so each route must check auth itself)

`auth/[...nextauth]`, `auth/register` (POST) · `products` (GET, falls back to and **auto-seeds** mock data when the DB is empty), `products/[id]` · `categories` (falls back to mock data on DB error), `categories/[id]` · `orders` (GET mine / POST create, price computed server-side ✅), `orders/[id]` · `staff/orders`, `staff/verify-qr` · `admin/analytics`, `admin/orders`, **`admin/seed` (no auth)** · `cron/expire-orders` (Bearer `CRON_SECRET` ✅, daily via `vercel.json`).

---

## 4. Components and where they're used (WIP tree)

| Component | Used by | |
|---|---|---|
| admin/Sidebar | admin/layout | |
| admin/AnalyticsChart, admin/ProductForm, admin/StrikeTable | — | **unused** |
| cart/CartDrawer | Navbar, BottomTabBar | |
| cart/CartItem | — | **unused** (only the type name matches in the store) |
| menu/CategoryTabs, ProductCard, ProductModal | /menu | |
| menu/DrinkCarousel | / | reads mock data |
| order/CountdownTimer, StatusStepper | /order/[id] | |
| order/PickupTicket + | /, /order/[id] | |
| order/StatusChip + | /history, PickupTicket | |
| order/StrikeDots + | /checkout, AccountSheet | |
| order/ActiveOrderBar + | SiteChrome | |
| order/QRDisplay | — | **unused** in both states (superseded by PickupTicket) |
| providers/NextAuthProvider, ThemeProvider + | app/layout | |
| shared/SiteChrome + | app/layout | wraps Navbar/Footer/BottomTabBar/ActiveOrderBar |
| shared/Navbar, Footer, BottomTabBar +, AccountSheet +, Logo +, ThemeToggle + | SiteChrome / Navbar / AccountSheet | |
| shared/ClientOnly, ErrorBoundary, LoadingSkeleton | — | **unused** (ClientOnly also has the only React-compiler lint error) |
| staff/QRScanner, staff/Sidebar | /staff/scan, staff/layout | |
| staff/OrderQueue | — | **unused** (`/staff/page.tsx` defines its own `OrderQueue` function) |
| ui/progress, ui/scroll-area | — | **unused** shadcn primitives |
| ui/* (rest) | many | |
| lib/mongodb-client | — | **unused** (only a commented-out import in `lib/auth.ts`) |
| lib/validations/order.schema, product.schema | — | **unused**: API routes validate by hand |

The committed state has the same unused set, minus the WIP-only components (which are all used).

---

## 5. Dependencies

**Unused (safe to remove later, with your approval):** `recharts` (0 imports), `react-hook-form` + `@hookform/resolvers` (0), `qrcode` + `@types/qrcode` (0; `qrcode.react` is the one in use), `@auth/mongodb-adapter` (commented out). `zod` is only imported by the two unused schema files.

**Used:** next, react, next-auth β30, mongoose, bcryptjs, uuid, zustand, sonner, radix-ui, lucide-react, framer-motion (10 files), next-themes, qrcode.react, html5-qrcode, date-fns (1 file), cva/clsx/tailwind-merge, tw-animate-css, shadcn (CSS import only).

**Outdated (`npm outdated`, notable):**

| Package | Current | Latest | Note |
|---|---|---|---|
| next / eslint-config-next | 16.1.7 | 16.4.6 | minor; worth taking in the rebuild |
| react / react-dom | 19.2.3 | 19.3.1 | minor |
| mongoose | 9.3.1 | 9.13.1 | minor |
| next-auth | 5.0.0-beta.30 | 5.0.0-beta.32 | still beta |
| tailwindcss | 4.2.1 | 4.3.5 | minor |
| framer-motion | 12.38 | 14.14 | major (now `motion`); defer |
| lucide-react | 0.577 | 1.81 | major; icon renames, so defer |
| eslint 9 → 10, typescript 5.9 → 7, @types/node 20 → 26 | | | majors; defer |

---

## 6. Build / lint / typecheck / tests

| Check | committed | wip |
|---|---|---|
| `npm run type-check` | ✅ | ✅ |
| `npm run build` | ✅ (warns: `middleware` → rename to `proxy`) | ✅ (same warning) |
| `npm test` (vitest) | ✅ 6/6 | ✅ 6/6 |
| `npm run lint` | ❌ script broken: `next lint` doesn't exist in Next 16 | ❌ same |
| `npx eslint .` | ❌ 16 errors, 11 warnings | ❌ 11 errors, 6 warnings |

ESLint breakdown for WIP: 10 × `no-explicit-any` (login, register, seed, register API, QRScanner, auth, mongodb), 6 × unused vars, and 1 × React-compiler "setState in effect" (`ClientOnly.tsx`, which is unused anyway).

Test coverage is two model tests only. There are no API, component or e2e tests.

---

## 7. Code smells & issues to fix during the rebuild

### Security (fix first)
1. **Role escalation:** `app/api/auth/register/route.ts:24` grants `admin` when the email contains "admin". I confirmed this live: the audit's `audit-admin-…@example.test` account became an admin.
2. **`GET /api/admin/seed`** has no auth check, `/api` is excluded from middleware, and it upserts products and categories. Anyone can call it.
3. **`GET /api/products` silently seeds the DB** with mock data when it's empty, and `/api/categories` returns mock data on DB errors. Both hide real failures.

### Correctness / UX bugs
4. **Committed font bug:** `globals.css` has `--font-sans: var(--font-sans)` (self-reference). Geist never applies and every page falls back to serif. The WIP fixed it.
5. **Dead product images:** 4 Unsplash URLs in `lib/mock-data.ts` (also seeded into the DB) return 404. In committed, the alt text spills onto the card.
6. **Carousel uses mock data** instead of the DB, and its committed deep links `/menu?product=<mockId>` go nowhere.
7. **Dead footer links:** Privacy / Terms / Contact point at `#privacy` etc. with no targets. Committed also shows "Staff Portal / QR Scanner / Admin" to every visitor, which triggers redirecting prefetches for customers.
8. **WIP mobile `/order/[id]`:** the ticket card overflows the right gutter, and the countdown ring renders as an empty black circle.
9. **WIP ProductModal:** add-on checkboxes render as tall empty boxes on mobile.
10. **Staff scan has no fallback:** no manual entry of the order code when the camera is denied or unavailable.
11. **Tooling:** the `lint` script is dead, `middleware.ts` should become `proxy.ts` (Next 16 deprecation), and `predev` runs `kill -9` on whatever holds :3000.

### Structure
12. **Fat page components:** `admin/products` (375 lines), `admin/categories` (260), `login` (216) and `staff` (206) mix fetching, state and UI. The unused `ProductForm` / `OrderQueue` components show an extraction that was started and abandoned.
13. **Validation is duplicated by hand** in each API route, while unused zod schemas sit in `lib/validations`.
14. **Repo-root clutter:** `README.bak.md`, `REDESIGN_*.md` and `STITCH_*.md` are design notes that belong in `docs/`. `tsconfig.tsbuildinfo` is committed.
15. **Hard-coded design values:** the committed state uses ad-hoc oranges and uppercase tracking classes everywhere. The WIP moved most of these to tokens in `globals.css`, which is the right direction.

### Accessibility (automated counts per page; see [console-and-links.md](console-and-links.md))
- **Small tap targets (<24 px):** committed has 9–13 per page; WIP has 4–6 on customer pages and 0 on admin.
- **Unnamed buttons/links:** admin/products has 17–19 icon-only buttons (edit/delete) with no `aria-label`. The committed navbar/footer adds 2 per page.
- **No horizontal page scroll** at 390 px in either state. On WIP order detail, though, the overflow is clipped rather than fixed.
- **Not yet checked** (to do in the Phase 3 a11y pass): color contrast (WIP muted text on cream looks borderline), focus order, and modal focus trap.

---

## 8. Top 3 user journeys (mobile, 390×844)

| # | Journey | committed | wip |
|---|---|---|---|
| 1 | **Browse → customize → add → checkout → QR ticket** (5 taps, scripted) | **Rough.** Serif fallback font, half the product images broken, centered dialog modal, checkout copy is jargon ("Manifest verification", "Execute order"). The CTA works. | **Good, with bugs.** Bottom sheet with size chips and a sticky "Add to order $4.95", a clear "Review your order" with the 30-min rule and strike dots, and a sticky "Place order". Bugs: add-on checkbox rendering, broken images. |
| 2 | **Track order → countdown → history** | **Rough.** Dense uppercase "ORDER STATUS / VERIFICATION TOKEN" screen with a long footer under it. The countdown works (29:13). | **Mostly good.** Stepper (Received → Brewing → Ready → Picked up), the ticket with order code, and the "hold until 11:01 PM" text are clear. **Mobile bugs:** ticket overflows the right edge, the countdown ring is empty, and the tab bar overlaps content. |
| 3 | **Staff: queue → scan QR → complete pickup** | **Rough on mobile.** Desktop sidebar layout, camera-only scan with no manual fallback, and the queue polls every 15 s. | Unchanged from committed: the WIP did not touch staff/admin. |

---

## 9. WIP assessment: what to keep

**Reusable as-is or nearly:** `lib/order-status.ts` (single source for status labels/colors), `PickupTicket`, `StatusStepper`, `StatusChip`, `StrikeDots`, `BottomTabBar` + `SiteChrome` + `AccountSheet` (good mobile shell), the token-based `globals.css`, the font fix, and the rewritten copy throughout.

**Needs work:** the mobile overflow on order detail, the countdown ring, the modal checkboxes, the still-mock-backed carousel, and the WIP-era `api/orders` change (GET now `populate`s products; that's fine and should be kept).

**Not started in WIP:** staff and admin screens, auth pages, and all the security/structure items above.

**Recommendation for Phase 2:** use the WIP direction ("warm, calm, ticket metaphor") as one of the 2–3 mockup directions rather than throwing it away. It already reads well. Then decide whether to commit the WIP as a `wip/redesign-v1` snapshot before Phase 3, so the history shows the evolution.

---

## Audit side effects (for transparency)

- **Atlas writes:** 2 test users (`audit-customer-*`, `audit-admin-*` @example.test) and 2 test orders (one per state) were written to the Atlas DB in `.env.local`. These orders will expire via the cron job. Credentials are in the session scratchpad, not the repo.
- **New repo files:** `docs/` and `.next/` build output.
