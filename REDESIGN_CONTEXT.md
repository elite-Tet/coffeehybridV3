# CoffeeHybrid V2 — Redesign Context Prompt

> Paste everything below the line into an AI assistant before asking for redesign help.

---

You are helping me redesign the UI of **CoffeeHybrid V2**, an existing, working coffee pre-order web app. Your job is to improve the **visual design, layout, UX and copy** while keeping all existing functionality, data flow and APIs intact. Please read this whole context before answering.

## 1. What the product is

A "order ahead, skip the queue" coffee shop app with three user roles:

- **Customer** – browses the menu, customizes drinks, checks out, gets a **QR code** for pickup, tracks order status, sees order history.
- **Staff** – sees a live order queue (kanban-style) and scans customer QR codes with the device camera to complete pickups.
- **Admin** – analytics dashboard, product CRUD, category CRUD, all-orders view, plus access to the staff portal.

Key business rules the UI must communicate clearly:

- Orders **expire 30 minutes** after creation if not picked up (a countdown timer is shown).
- Each no-show = 1 **strike**. **3 strikes → 24-hour suspension** (checkout is blocked with an "account locked" screen).
- Order status flow: `pending → confirmed → ready → completed`, plus terminal states `expired` and `cancelled`.
- QR code is single-use (`qrUsed`).

## 2. Tech stack (must keep)

- **Next.js 16 (App Router)**, **React 19**, **TypeScript**
- **Tailwind CSS v4** (CSS-first config in `app/globals.css`, no tailwind.config file)
- **shadcn/ui** (style `radix-nova`, Radix primitives, CSS variables, lucide icons)
- **framer-motion** for animation, **sonner** for toasts, **recharts** for admin charts
- **Zustand** cart store (`store/cart.store.ts`), **react-hook-form + zod** forms
- **NextAuth v5** (credentials), **MongoDB/Mongoose**
- Fonts: **Geist / Geist Mono** via `next/font/google`
- Product images: `next/image`, remote host `images.unsplash.com` only (allowed in `next.config.ts`)

Please give code that works with these exact versions (Tailwind v4 syntax, `@theme inline`, oklch colors, shadcn component APIs).

## 3. Routes / pages

| Route                     | File                                 | Purpose                                                                         |
| ------------------------- | ------------------------------------ | ------------------------------------------------------------------------------- |
| `/`                     | `app/(public)/page.tsx`            | Landing: hero ("Order Ahead, Skip the Queue."), drink carousel, 3 feature cards |
| `/menu`                 | `app/(public)/menu/page.tsx`       | Search bar, category tabs, product grid (1/2/3 cols), opens customize modal     |
| `/checkout`             | `app/(public)/checkout/page.tsx`   | Cart review + place order; "Account Locked" and "empty cart" states             |
| `/order/[id]`           | `app/(public)/order/[id]/page.tsx` | Status badge, QR code, countdown timer, item list                               |
| `/history`              | `app/(public)/history/page.tsx`    | Past orders as cards (2-col grid), status badges, empty/error states            |
| `/login`, `/register` | `app/(auth)/…`                    | Card-based auth forms                                                           |
| `/staff`                | `app/staff/page.tsx`               | 3 columns: "Inbound Requests" / "Active Brewing" / "Ready for Pickup"           |
| `/staff/scan`           | `app/staff/scan/page.tsx`          | Camera QR scanner (html5-qrcode)                                                |
| `/admin`                | `app/admin/page.tsx`               | 4 KPI cards, order distribution, category performance chart                     |
| `/admin/products`       | `app/admin/products/page.tsx`      | Product grid (up to 4 cols) + create/edit dialog                                |
| `/admin/categories`     | `app/admin/categories/page.tsx`    | Category CRUD                                                                   |
| `/admin/orders`         | `app/admin/orders/page.tsx`        | All orders table                                                                |

`/staff/*` and `/admin/*` are role-guarded in `middleware.ts` and have their own sidebar layouts (`components/staff/Sidebar.tsx`, `components/admin/Sidebar.tsx`). Public pages share `components/shared/Navbar.tsx` + `Footer.tsx` from `app/layout.tsx`.

## 4. Components

- `components/menu/` – `ProductCard`, `ProductModal` (size / sugar / ice radio groups, add-on checkboxes, live price), `CategoryTabs`, `DrinkCarousel`
- `components/cart/` – `CartDrawer` (shadcn Sheet from the right), `CartItem`
- `components/order/` – `QRDisplay`, `CountdownTimer`
- `components/staff/` – `OrderQueue`, `QRScanner`, `Sidebar`
- `components/admin/` – `AnalyticsChart`, `ProductForm`, `StrikeTable`, `Sidebar`
- `components/shared/` – `Navbar` (sticky, blurred, cart badge, role-based links, mobile menu), `Footer` (4 cols), `LoadingSkeleton`, `ErrorBoundary`
- `components/ui/` – shadcn: badge, button, card, checkbox, dialog, input, label, progress, radio-group, scroll-area, separator, sheet, sonner

## 5. Data shapes (don't change these)

```ts
type Role = 'customer' | 'staff' | 'admin';
type OrderStatus = 'pending' | 'confirmed' | 'ready' | 'completed' | 'cancelled' | 'expired';

interface IProduct {
  _id: string; name: string; description: string; basePrice: number;
  category: string | ICategory; imageUrl: string; isAvailable: boolean;
  customizationOptions: {
    sizes: { label: string; priceModifier: number }[];
    sugarLevels: string[]; iceOptions: string[];
    addOns: { label: string; price: number }[];
  };
}
interface ICategory { _id: string; name: string; slug: string; description?: string; sortOrder: number; isActive: boolean; }
interface IOrder {
  _id: string; user: string | IUser; items: IOrderItem[]; subtotal: number; total: number;
  status: OrderStatus; qrCode: string; qrUsed: boolean; expiresAt: Date; createdAt: Date;
}
interface IOrderItem {
  product: string | IProduct; quantity: number; unitPrice: number;
  customizations: { size?: string; sugarLevel?: string; iceOption?: string; addOns?: string[] };
}
interface IUser { _id: string; name: string; email: string; role: Role; strikes: number; suspendedUntil: Date | null; }
```

APIs used by the UI: `GET /api/products`, `GET /api/categories`, `GET|POST /api/orders`, `GET|PATCH /api/orders/[id]`, `GET /api/staff/orders`, `POST /api/staff/verify-qr`, `GET /api/admin/analytics`, `GET /api/admin/orders`, product/category CRUD at `/api/products[/id]` and `/api/categories[/id]`.

## 6. Current design system

Defined in `app/globals.css` as shadcn CSS variables (oklch, warm hue ~45):

- **Light**: off-white background `oklch(0.99 0.005 45)`, deep brown-black text, primary "coffee" brown `oklch(0.48 0.15 45)`.
- **Dark**: espresso background `oklch(0.08 0.02 45)`, primary "golden amber" `oklch(0.65 0.18 55)`.
- Radius base `0.75rem`. Status colors use raw Tailwind `amber-500`, `emerald-500` and `destructive`.
- **The app is hard-coded to dark mode** (`<html className="dark">`); `next-themes` is installed but no toggle exists.

Current visual style: glassmorphism (`bg-card/60 backdrop-blur`), blurred primary-color glow blobs, cards that lift on hover via framer-motion, heavy `font-black uppercase italic tracking-tighter` headings with a two-tone word (e.g. "Order **Checkout**", "ORDER **QUEUE**").

## 7. Known design problems (what I want fixed)

1. **Inconsistent tone of voice** – customer pages mix friendly copy with sci-fi jargon ("Manifest Empty", "Order Sequence Initiated!", "Protocol Error", "Selection Manifest", "Order Terminated", "Server-side protocol error"). It should feel like a warm, premium coffee shop.
2. **Inconsistent heading styles** – some pages use normal bold headings (menu, history, login), others use black/uppercase/italic. Needs one typographic scale.
3. **Generic "AI template" look** – glow blob hero, glass cards, three icon feature cards; doesn't feel like a real café brand.
4. **No light mode / theme toggle** despite tokens existing.
5. Status colors are hard-coded Tailwind colors instead of semantic tokens (`--success`, `--warning`, etc.).
6. Landing page is thin (hero + carousel + 3 features) — no "how it works" (order → QR → pickup), no explanation of the 30-min / strike policy before users hit it.
7. Staff and admin UIs use tiny text (`text-[8px]`, `text-[10px]`) — staff screens are likely used on a tablet at a busy counter and need to be glanceable.
8. Branding is just a lucide `Coffee` icon + "CoffeeHybrid v2" text.

## 8. Constraints

- Keep the same routes, components, props, API calls, Zustand store and data types. Change markup, classes, tokens, copy and layout — not business logic.
- Stay on shadcn/ui + Tailwind v4 tokens; add new tokens in `globals.css` rather than hard-coded colors.
- Mobile-first: customers order on phones. Staff pages: tablet. Admin: desktop.
- Accessibility: WCAG AA contrast, visible focus states, respect `prefers-reduced-motion` for framer-motion animations.
- Product images come from Unsplash URLs; design must handle missing images and "Sold Out" (`isAvailable: false`).

## 9. How I want you to help

When I ask about a page or component:

1. Briefly critique the current version against the problems above.
2. Propose the new design (layout, hierarchy, tokens, copy).
3. Give complete, drop-in TSX/CSS for the file(s), using the exact file paths above.
4. List any new tokens or shared components you introduced so I can reuse them across pages.

Start by proposing an overall design direction (brand personality, color palette in oklch, typography pairing, spacing/radius, motion rules, voice & tone guidelines) that I can apply to every page. Then wait for me to pick a page to redesign.
