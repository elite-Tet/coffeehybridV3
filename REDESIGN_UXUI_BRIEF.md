# CoffeeHybrid — UX/UI Redesign Brief

> **How to use this file**
> - **Google Stitch / Figma Make / v0 / Lovable:** paste **Part A** (the master prompt) first. Then paste one screen prompt from **Part D** at a time. These tools work best one screen at a time.
> - **Figma (manual design):** use Parts B–C as the spec, and Part E as the component list.
> - **A coding AI building the design:** give it the whole file plus `REDESIGN_CONTEXT.md`. **Part F** has the implementation rules.

---

## PART A — Master prompt (paste this first)

You are designing **CoffeeHybrid**, a mobile-first web app for ordering coffee ahead and picking it up. Customers order on their phone, get a QR code, walk in, staff scan the code, and the customer takes the drink. No queue.

**Three audiences, three devices:**

1. **Customer:** phone (390×844), one-handed, often walking. Goal: reorder their usual drink in under 30 seconds, then show the QR at the counter.
2. **Staff (barista):** tablet in landscape (1180×820) on a busy counter, glanced at from about 1 m away, sometimes with wet hands. Goal: see what to make next and verify a pickup in one tap.
3. **Admin (owner):** laptop (1440×900). Goal: see how today is going, mark items sold out, edit the menu.

**Rules the UI must make obvious, not hide:**

- An order must be picked up **within 30 minutes**, or it expires.
- An expired order = **1 strike**. **3 strikes = ordering paused for 24 hours.** Customers can still browse.
- Order status: **Received → Brewing → Ready → Picked up** (plus **Expired** and **Cancelled**).
- Each QR code works **once**.

**Brand personality:** a warm, modern specialty café. Calm, crafted, friendly, quick. Not techy, not neon, not "futuristic". Think of a well-designed neighbourhood café menu board, not a crypto dashboard.

**Visual direction:**

- **Light theme by default, following the device setting.** Paper/cream background, espresso text, one coffee-brown accent, plus a small "crema" gold highlight. Dark theme = deep espresso background with the same palette inverted. No glassmorphism, glow blobs or heavy gradients.
- **Type:** a characterful serif for display headings (e.g. *Fraunces* or *Young Serif*) paired with a clean sans for UI and body (*Geist* or *Inter*). Sentence case everywhere: no ALL-CAPS headings, no italic shouting.
- **Shape:** soft, generous radius (12–16px on cards, full pill on chips and primary buttons), thin warm borders, very subtle shadows.
- **Imagery:** real drink photography on warm neutral backgrounds, square or 4:5. Never stretch it.
- **Status colours** are always paired with an icon and a text label, never colour alone:
  - Received: neutral grey
  - Brewing: amber
  - Ready: green
  - Picked up: coffee brown
  - Expired / Cancelled: muted red

**Global UX rules:**

- Touch targets ≥ 44×44 px. Body text ≥ 16px. Staff screens: body ≥ 18px, order numbers ≥ 32px.
- WCAG 2.2 AA contrast in both themes. Visible focus rings.
- At most one sticky bar per screen edge, and each one under ~12% of screen height.
- No pop-ups on page load. Only block the user (modal) for consequential actions: placing an order, deleting a product, cancelling an order.
- Every screen designs its **empty**, **loading** (skeletons, not spinners), and **error** states.
- Motion is subtle and purposeful (150–250ms ease-out). Provide a static version for reduced-motion users. Any auto-playing carousel needs a visible pause button.

**Voice & tone:** friendly barista, short sentences, plain words. Say "Your order is ready", not "Order Sequence Initiated". Say "Something went wrong — try again", not "Protocol Error".

Acknowledge this brief. Then design the screens I send, one at a time, as high-fidelity mockups that share a single design system.

---

## PART B — UX decisions (and why)

### B1. Information architecture

| Area | Device | Navigation pattern | Why |
|---|---|---|---|
| Customer | Phone first | **Bottom tab bar**: Menu · Orders · Account, plus a **floating cart button** that appears only when the cart has items | Thumb reach. The cart is contextual, so it shouldn't take a permanent tab. |
| Customer (desktop) | ≥ 1024px | Compact top bar: logo · Menu · Orders · cart · avatar | One row, not stacked bars |
| Staff | Tablet landscape | **No sidebar.** Top bar with the shop name, a live clock, a **big "Scan QR" button**, a "Sold out" quick menu and the user avatar | The kanban needs the full width. Scanning is the #1 action, so it is always one tap away. |
| Admin | Desktop | **Left sidebar** (collapsible): Today · Orders · Menu (Products + Categories as tabs) · Customers · Settings, plus a "Open staff view" link | Admin is wide-screen. Merging Products and Categories reduces nav items. |

The landing page (`/`) is **only for signed-out visitors**. A signed-in customer goes straight to **Menu**. Returning users don't need marketing.

### B2. The persistent "Active order" card (most important pattern)

Whenever a customer has an order in Received, Brewing or Ready, show a compact card **above the bottom tab bar on every customer screen**. It contains:

- Status chip (e.g. "Brewing")
- Countdown ("Pick up within 18 min")
- A "Show QR" button

When the status turns **Ready**, the card turns green and the browser announces "Your order is ready" (polite live region). Customers never have to dig through history to find their QR.

### B3. Customer flows

**Flow 1 — First-time order (target: ≤ 6 taps after sign-in)**

```
Landing ──"Start an order"──▶ Menu ──tap drink──▶ Customize sheet ──"Add · $4.50"──▶ Menu (cart button appears)
   ──cart──▶ Cart sheet ──"Checkout"──▶ (Sign in if needed, then return here) ──▶ Review & place order
   ──"Place order · $9.50"──▶ Order status (QR + countdown)
```

**Flow 2 — Returning customer reorder (target: ≤ 3 taps)**

```
Menu ── "Your usuals" row at top ──"Add again"──▶ cart button ──▶ Checkout ──"Place order"──▶ Status
```

Orders tab → past order → **"Order again"** does the same thing.

**Flow 3 — Pickup**

```
Active order card ──"Show QR"──▶ Full-screen QR (high contrast, white background, large order number)
   ──staff scans──▶ Screen switches to "Enjoy your coffee ☕" + "Rate / Order again"
```

**Decisions behind these flows:**

- **Browse without an account. Ask for sign-in only at checkout**, then send the user back to checkout with the cart intact.
- **Customization opens as a bottom sheet on phones and a centred dialog on desktop.** The menu stays visible behind it.
  - **Size** (2–5 options): a segmented control built from radio buttons. All options are visible, so there is nothing to open.
  - **Sugar** and **Ice**: radio chips, with the default pre-selected.
  - **Add-ons**: a checkbox list with prices ("+ $0.50").
  - A sticky footer holds a quantity stepper and a primary button with the **live total**: "Add to order · $5.25".
- **Each product card has a quick "+" button** that adds the drink with default options. A toast confirms it and offers "Customize" as an undo-style action. Tapping the card itself opens the full sheet.
- **Checkout is one page, not a wizard.** It has three sections:
  1. Items, each editable
  2. Pickup policy, explained in two plain lines with a small strike indicator ("●○○ 1 of 3 strikes")
  3. Total, with a **"Place order · $X"** button
- **No surprise policy.** The 30-minute rule appears on the landing page ("How it works") and on checkout. The strike system appears on checkout and in the Account tab, never for the first time in an error message.
- **Paused account (3 strikes):** the user can still browse and build a cart. The checkout button becomes "Ordering paused until 3:40 PM" and opens an explanation sheet. It is not a dead-end page.
- **Countdown:** show "18 min left" as text plus a thin progress ring. In the last 5 minutes it turns amber and the text says "Hurry — 4 min left". Don't announce every second to screen readers. Announce only status changes and the 5-minute warning.

### B4. Staff flows

**Flow 4 — Make orders**

```
Kanban: NEW ──"Start"──▶ BREWING ──"Ready"──▶ READY ──(customer scans)──▶ disappears with a confirmation toast
```

- There are **3 columns: New, Brewing, Ready**, each with a large count.
- Cards are big:
  - Order number (#A27, ≥ 32px)
  - Customer first name
  - Items with customizations as readable chips ("Large · Less sugar · Oat milk")
  - Age, shown as "4 min ago"
  - **Exactly one primary action** filling the card's width ("Start brewing", "Mark ready")
- Card age is colour-coded: normal, amber after 10 min in Ready, red after 25 min (about to expire). Each colour has an icon too.
- New orders slide in at the top with an optional chime (toggle in the top bar).
- Moving a card is a **button tap**, not drag-and-drop. Wet hands and tablets make dragging unreliable. "Undo" appears in a toast for 5 seconds.

**Flow 5 — Verify pickup**

```
"Scan QR" (top bar, always visible) ──▶ full-screen camera with a framing guide
   ──valid──▶ big green "✓ #A27 · Sophea · 2 items" + item list + "Hand over & complete"
   ──invalid / used / expired──▶ big red panel with the reason in plain words + "Scan again"
```

- If the camera fails, offer **"Type order code"** as a fallback.
- Result screens have huge text and fill the full screen, readable from 1 m away.

**Flow 6 — Sold out:** a "Sold out" button in the staff top bar opens a searchable list of products with toggles. When a barista runs out of oat milk, they mark it in about 2 taps without involving the admin.

### B5. Admin flows

**Flow 7 — Morning check (Today dashboard)**

- **4 KPI tiles:** Revenue today, Orders today, Pickup rate % (completed ÷ total), No-shows today. Each shows the change vs. the same day last week.
- **Orders by hour** chart (bars), **Top 5 drinks** (ranked list with mini bars), and a **Live queue** mini-panel linking to the staff view.

**Flow 8 — Edit the menu**

- A Menu page with tabs: **Products | Categories**.
- Products is a **table on desktop**: thumbnail, name, category, price, an **inline Available toggle**, and an overflow ⋯ menu (Edit, Duplicate, Delete). Filters: category chips + search. On narrow screens the table becomes stacked cards.
- **Edit product** opens a **right-side panel**: form on the left, **live preview of the customer product card** on the right.
  - Fields: Basics, Price & sizes, Options (sugar/ice), Add-ons, Image.
  - If there are unsaved changes, closing asks "Discard changes?".
- **Delete** asks for confirmation, with **Cancel** focused by default.
- **Categories:** a simple list with drag handles to reorder, plus an active/inactive toggle.

**Flow 9 — Orders & customers**

- **Orders:** a filterable table (status chips, date range, search by order # or customer). Clicking a row opens a details panel.
- **Customers** *(new screen; needs an API)*: name, total orders, strikes (●●○), and status (Active / Paused until …), with a **"Clear strikes"** action. Uses the existing `StrikeTable` component.

---

## PART C — Design system

### C1. Colour tokens (oklch, keep the names compatible with shadcn)

| Token | Light | Dark | Use |
|---|---|---|---|
| `--background` | `oklch(0.975 0.012 75)` cream paper | `oklch(0.16 0.015 50)` espresso | page |
| `--card` | `oklch(0.995 0.005 75)` | `oklch(0.21 0.018 50)` | surfaces |
| `--foreground` | `oklch(0.24 0.03 45)` espresso ink | `oklch(0.94 0.012 75)` | text |
| `--muted-foreground` | `oklch(0.48 0.025 50)` | `oklch(0.72 0.02 70)` | secondary text (AA) |
| `--primary` | `oklch(0.45 0.09 45)` roasted brown | `oklch(0.78 0.09 70)` latte | buttons, links |
| `--primary-foreground` | `oklch(0.98 0.01 75)` | `oklch(0.2 0.02 50)` | text on primary |
| `--accent` | `oklch(0.80 0.12 80)` crema gold | `oklch(0.75 0.12 80)` | highlights, badges (use sparingly) |
| `--border` | `oklch(0.88 0.015 70)` | `oklch(0.32 0.02 50)` | hairlines |
| `--status-received` | `oklch(0.6 0.01 60)` | same, lighter | neutral |
| `--status-brewing` | `oklch(0.72 0.15 70)` amber | | |
| `--status-ready` | `oklch(0.62 0.14 150)` green | | |
| `--status-done` | `= --primary` | | |
| `--status-expired` | `oklch(0.58 0.15 25)` muted red | | also `--destructive` |

All of these values are a starting point. Check every text/background pair for AA contrast.

### C2. Typography

| Role | Font | Size / line height |
|---|---|---|
| Display (hero, page titles) | Fraunces 600 | 40/44 mobile, 56/60 desktop |
| H2 section | Fraunces 600 | 24/30 |
| H3 card title | Geist 600 | 18/24 |
| Body | Geist 400 | 16/24 |
| Small / meta | Geist 500 | 14/20 (never below 12) |
| Price, numbers | Geist (tabular figures) 600 | |
| Staff order number | Geist Mono 700 | 32–40 |

Rules: sentence case everywhere. Balanced line breaks on headings.

### C3. Spacing, radius, elevation

- 4px base grid. Page gutters 16px (phone), 24px (tablet), 32px (desktop).
- Radius: 8 (inputs), 16 (cards, sheets), full (pills, chips, primary buttons).
- Elevation: flat cards with a border. Only sheets, dialogs and the floating cart get a soft shadow.

### C4. Copy replacements (current → new)

| Current | New |
|---|---|
| Manifest Empty | Your cart is empty — *Browse the menu* |
| Order Sequence Initiated! | Order placed! We're on it. |
| Sequence failure. Check availability. | Couldn't place your order. Something may have sold out — check your cart. |
| Server-side protocol error. | Something went wrong. Please try again. |
| Protocol Error | We couldn't find that order |
| Selection Manifest | Your items |
| Awaiting Confirmation | Received |
| Brewing in Progress | Brewing |
| Pickup Window Lapsed | Expired — not picked up in time |
| Order Terminated | Cancelled |
| Account Locked | Ordering paused until {time} |
| Inbound Requests / Active Brewing | New / Brewing |
| ANALYTICS OVERVIEW | Today |
| Product Inventory | Menu |

---

## PART D — Screen-by-screen prompts (paste one at a time)

> Each prompt assumes Part A was pasted earlier in the same chat.

**D1. Landing (signed-out, phone + desktop)**

> Design the landing page.
> - **Hero:** serif headline "Skip the line, not the coffee.", one sentence of supporting text, a primary "Start an order" button, a secondary "Sign in" text link, and a real latte photo.
> - **"How it works":** 3 numbered steps with simple line icons: Order on your phone → Show your QR at the counter → Grab your drink.
> - **"Fair pickup" panel:** explain that orders are held for 30 minutes and that 3 missed pickups pause ordering for 24 hours. Friendly, not threatening.
> - **"Popular today":** a horizontal scroll row of 6 drink cards.
> - **Footer:** hours, address, small links.
>
> No glowing blobs, no glass effects.

**D2. Menu (phone)**

> Design the Menu screen.
> - **Top:** greeting ("Good morning, Dara") and a search field.
> - **Category chips** in a horizontal scrolling row. Make it sticky under the header while scrolling, as one single compact bar.
> - **"Your usuals" row** (signed-in only): small cards, each with an "Add again" button.
> - **Product grid:** 2 columns. Each card has a 4:5 photo, name, a short description (1 line), the price, and a round "+" quick-add button. Sold-out cards show a desaturated photo and a "Sold out" label, with the button removed.
> - **Bottom:** the tab bar (Menu · Orders · Account) and a floating cart pill above it: "2 items · $9.50 →".
>
> Also show the loading skeleton and the "no results" state.

**D3. Customize drink (bottom sheet)**

> Design the drink customization bottom sheet over the dimmed Menu.
> - A drag handle and a close button.
> - A photo strip, then the name and description.
> - **Size:** a segmented control (Small / Medium +$0.50 / Large +$1.00).
> - **Sugar:** chips (0%, 25%, 50%, 75%, 100%).
> - **Ice:** chips (No ice, Less, Normal, Extra).
> - **Add-ons:** a checklist with prices.
> - **Sticky footer:** a − 1 + stepper and a full-width "Add to order · $5.25" button.
>
> Also show the desktop version as a centred dialog.

**D4. Cart sheet + Checkout**

> **Cart sheet:** item rows with thumbnail, name, customization summary in small text, a quantity stepper and "Edit". Below them the subtotal and a full-width "Checkout · $9.50" button.
>
> **Checkout page** (single page) with three cards:
> 1. Your items
> 2. Pickup — "We'll hold your order for 30 minutes after it's placed", the strike indicator "●○○ 1 of 3 missed pickups", and a "Learn how pickups work" expandable section
> 3. Total
>
> Add a sticky bottom bar with the "Place order · $9.50" button.
>
> Also design the **paused** variant: the button is disabled and reads "Ordering paused until 3:40 PM", with an explanation card. The cart is still visible.

**D5. Order status + QR**

> Design the order status screen.
> - **Top:** a horizontal stepper — Received → Brewing → Ready → Picked up — with the current step highlighted.
> - **Centre:** a large QR code on a pure white card with the order number "#A27" under it in big mono type, plus a circular countdown ring with "18 min left".
> - A "Keep your screen on and brightness up at the counter" tip.
> - **Below:** a collapsible item list and the total.
>
> Show these variants:
> - **Ready:** the whole header turns green — "Your order is ready — show this at the counter".
> - **Last 5 minutes:** the ring and the text turn amber.
> - **Expired:** the QR is greyed out, with "Not picked up in time · 1 strike added" and an "Order again" button.
> - **Picked up:** "Enjoy your coffee ☕" with an "Order again" button.

**D6. Orders tab (history)**

> Design the Orders tab.
> - **Top:** an "Active" section with the live order card.
> - **"Past orders":** a list grouped by date. Each row shows the date/time, an items summary, the total, a status chip with an icon, and an "Order again" button.
> - Design the empty state with an illustration and a "Browse menu" button.

**D7. Account + auth**

> **Account screen:** name, email, a "Pickup record" card (strikes ●●○ with an explanation and the date strikes reset), a theme setting (System / Light / Dark), and sign out.
>
> **Sign in / Create account:** single-column forms with labels above the fields, a show/hide password toggle, inline errors under the fields, and a "Continue as guest to browse" link.

**D8. Staff — Order board (tablet landscape)**

> Design the staff order board for a tablet in landscape.
> - **Top bar:** shop name, live clock, a sound toggle, a "Sold out" button, and a huge primary "Scan QR" button on the right.
> - **3 equal columns** with count badges: New (3) · Brewing (2) · Ready (4).
> - **Cards:** big mono order number "#A27", customer first name, an items list with customization chips, an age label "4 min ago", and one full-width action button ("Start brewing" / "Mark ready"). Cards in Ready show "Waiting 12 min" in amber, or red at 25+ min.
> - Design for glanceability from 1 metre. Show the empty column state "All caught up ✓".

**D9. Staff — Scan & result**

> Design the scan flow:
> 1. Full-screen camera with a rounded framing square and the hint "Point at the customer's QR", plus "Type code instead" and "Close" buttons.
> 2. **Success:** a full-screen green panel with a big ✓, "#A27 · Sophea", the item list and a "Complete pickup" button.
> 3. **Failure:** a full-screen red panel with a big ✕ and a plain reason ("This code was already used at 9:14 AM", "This order expired", "Code not recognised"), plus a "Scan again" button.

**D10. Admin — Today dashboard (desktop)**

> Design the admin dashboard.
> - **Collapsible left sidebar:** Today, Orders, Menu, Customers, Settings, and "Open staff board".
> - **Row of 4 KPI tiles:** Revenue $482 (+12% vs last Tue), Orders 96, Pickup rate 94%, No-shows 6.
> - **Main area:** an "Orders by hour" bar chart and a "Top drinks" ranked list.
> - **Right rail:** a live queue summary.
>
> Calm, data-first, the same warm palette, with charts in the brand browns and gold.

**D11. Admin — Menu management**

> Design the Menu management page with Products | Categories tabs.
> - **Products:** a table with thumbnail, name, category, price, an inline "Available" switch, and a ⋯ menu. Add category filter chips, search, and an "Add product" button. Also show the stacked-card version for narrow screens.
> - **Edit product:** a right-side panel with form sections (Basics, Price & sizes, Sugar & ice, Add-ons, Image upload) and a live customer-card preview, with a sticky footer holding "Cancel" and "Save changes".
> - Also design the "Discard unsaved changes?" confirmation dialog.

**D12. Admin — Orders & Customers**

> **Orders:** a table with filters (status chips, date range, search). Clicking a row opens a side panel with items, timeline and customer info.
>
> **Customers:** a table with name, orders, strikes (dots), and status (Active / Paused until …), with a "Clear strikes" action that asks for confirmation.

---

## PART E — Component inventory

Build these once and reuse them everywhere:

- **Navigation:** BottomTabBar, TopBar, AdminSidebar, StaffTopBar
- **Menu:** ProductCard (default / sold-out / skeleton), QuickAddButton, CategoryChips, SearchField, UsualsRow
- **Customization:** CustomizeSheet, SegmentedControl, ChoiceChips, AddOnChecklist, QuantityStepper, PriceButton ("Label · $X")
- **Cart and checkout:** CartPill (floating), CartSheet, CartLine
- **Orders:** ActiveOrderCard, StatusChip (6 states, icon + label), StatusStepper, CountdownRing, QRCard, StrikeDots
- **Staff:** KanbanColumn, StaffOrderCard, ScanOverlay, ScanResult (success / fail)
- **Admin:** KpiTile, DataTable (+ stacked mobile mode), SidePanel, ConfirmDialog
- **Feedback:** EmptyState, ErrorState, Toast (with action)

---

## PART F — Implementation notes for the coding AI

These come from current web-platform best practice (Chrome's *Modern Web Guidance*). They apply when the designs are turned into code in this repo (Next.js 16, Tailwind v4, shadcn/ui).

**1. Theme**
- Remove the hard-coded `className="dark"`.
- Add `<meta name="color-scheme" content="light dark">` and set `color-scheme: light dark` on `:root`.
- Default to the system theme. Put the manual toggle (via `next-themes`) in Account/Settings, not in the header.
- Set `accent-color` to the brand colour so native checkboxes and radios match.

**2. Touch targets**
- Minimum 24px. Raise it to 44px under `@media (pointer: coarse)`.
- Give small icon buttons an invisible extended hit area.
- Every icon-only button needs an `aria-label`. Decorative icons get `aria-hidden`.

**3. Safe areas and sticky bars**
- Add `viewport-fit=cover`.
- Pad the bottom tab bar, cart pill and checkout bar with `env(safe-area-inset-bottom)`.
- Set `scroll-padding-bottom` to at least the bar's height so focused fields never end up hidden under it.

**4. Dialogs and sheets**
- Use the shadcn Dialog/Sheet (Radix) components consistently.
- Name each one with its heading.
- In delete confirmations, autofocus the safe action (Cancel).
- Product edit uses an unsaved-changes guard on close.
- Stop the page behind from scrolling with `overscroll-behavior: contain`, not `overflow: hidden` on `body`.

**5. Forms (login, register, product editor)**
- Visible `<label>` above every field; placeholders are not labels.
- Use `autocomplete` (`email`, `current-password`, `new-password`, `name`).
- Include a show-password toggle.
- Validate on blur and on submit, not on every keystroke. Clear errors as soon as the value is fixed.
- On a failed submit, move focus to the first invalid field.
- Inputs use at least a 16px font so iOS doesn't zoom.
- Disable the submit button only *after* a valid submit, to prevent double orders.

**6. Selection controls**
- 2–5 exclusive options (size, sugar, ice) → radio groups / segmented control.
- Multi-select (add-ons) → checkboxes. Never auto-submit on change.

**7. Tables (admin)**
- Use a semantic `<table>` with a `<caption>`.
- Wrap it in a scrollable region (`role="region"`, `tabindex="0"`, accessible name) with a sticky header.
- Below about 600px of container width, switch to stacked cards using a container query.

**8. Countdown**
- Compute the time remaining from the server's `expiresAt`.
- Format it with `Intl.DurationFormat` / `toLocaleString` instead of string concatenation.
- Announce only status changes and the 5-minute warning through a polite live region, not every tick.

**9. Motion**
- Animate only `transform` and `opacity`.
- Wrap framer-motion's entrance/hover animations so they run only with `prefers-reduced-motion: no-preference`. Always end in the final visible state.
- The drink carousel needs a visible Pause button if it auto-plays.
- Optional: use the View Transitions API to morph a product card into the customize sheet, as progressive enhancement.

**10. Layout**
- Use container queries for components (ProductCard, KpiTile, DataTable).
- Use media queries only for the input device and user preferences.
- Nothing may overflow at 320px wide.
- Use `text-wrap: balance` on headings and `pretty` on body text.

**11. Keep the logic**
- Keep all routes, API calls, the Zustand store, NextAuth and the data types from `REDESIGN_CONTEXT.md`.
- New screens (Customers, staff Sold-out toggle, "Your usuals", Account) may need small API additions. Flag these rather than inventing endpoints silently.
