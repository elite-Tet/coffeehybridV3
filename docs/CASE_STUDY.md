# Case study outline: CoffeeHybrid, from "it works" to "it's ready"

_An outline to adapt for a portfolio page. Every number below comes from this repo's audit, tests and commits. Swap in your own voice, trim to taste, and keep the evidence links._

**One-line summary (for the card / hero):**
Redesigned and hardened an order-ahead coffee app: new visual direction chosen from three mockups, rebuilt in 12 reviewable slices, six security holes closed, and every screen brought to zero WCAG 2.2 AA violations.

**Role · Stack · Timeline**
Design + front-end + back-end fixes · Next.js 16, React 19, TypeScript, Tailwind v4, Auth.js, MongoDB, Playwright · _(fill in dates)_

**Hero image:** [`home-desktop.png`](screenshots/compare/home-desktop.png)

---

## 1. Brief

- **The product.** Customers order on their phone, get a QR pickup ticket, and show it at the counter. Orders are held 30 minutes; three missed pickups pause ordering for 24 hours. Staff work a live queue; admins manage the menu.
- **The situation.** A working app I hadn't touched in months, plus a half-finished redesign that was never committed. The original GitHub account was gone, so the work moved to a fork.
- **Goals.**
  1. Understand what's actually there before changing anything.
  2. Pick one visual direction from real alternatives instead of iterating on the first idea.
  3. Rebuild in small, reviewable steps with checks passing after every one.
  4. Leave it in a state another developer (or future me) can pick up.
- **Constraints.** Keep the stack, URLs, data model and business rules. No new runtime dependencies.

> 🖊 _Write 2–3 sentences on why this project, and who it's for: a café owner? hiring managers?_

---

## 2. Audit: what was really there

Method: inspected the repo, ran every check, and captured all 13 routes at desktop and phone width with Playwright, for both the March version and the unfinished redesign ([audit report](audit/AUDIT.md), [before screenshots](screenshots/before/)).

**Findings worth telling:**
- **Security.** Anyone who registered with "admin" in their email became an admin. An unauthenticated GET wrote to the database. _(Later, during the rebuild, I found four more: open product/category creation endpoints, a client-side role escalation via session updates, hard-coded development logins, and an open redirect on login.)_
- **"Green" tooling that wasn't.** `npm run lint` had silently stopped working (removed in Next 16). Running ESLint directly found 27 problems.
- **Visible bugs.** A self-referencing CSS variable rendered every page in Times New Roman. Half the product photos were dead links, and the rest didn't match their drinks.
- **Dead weight.** 11 unused modules, 6 unused npm packages.
- **Journeys.** The core order flow was usable but rough on phones: jargon ("Execute order", "Manifest verification"), an overflowing pickup ticket, and a countdown that looked like an empty circle.

**Image:** [`order-ticket-mobile.png`](screenshots/compare/order-ticket-mobile.png) (March → unfinished redesign → final)

> 🖊 _What surprised you most? The silent lint failure is a good story about not trusting a green checkmark._

---

## 3. Exploration: three directions, one decision

Built three homepage mockups with **identical content and section order**, so the comparison was about design, not copy ([`docs/mockups/`](mockups/)):

| | Direction | Idea | What it signals |
|---|---|---|---|
| A | Editorial minimal | the menu as a typeset price list | typographic discipline |
| B | Warm earthy | the pickup ticket as hero, evolving the unfinished redesign | product thinking, iteration |
| **C** | **Bold motion: "The Board"** | **a live counter board where order codes flip to *Ready*** | **interaction craft with accessibility built in** |

**Why C:** it turns the product's core moment ("is my order ready?") into the visual identity. Every later decision follows from that: one signal colour that means *Ready*, a condensed board typeface, squared "slat" components.

**Guardrails on the bold choice:** the board has a pause control (WCAG 2.2.2), starts paused under reduced motion, and is labelled as an example. Only one scroll-linked animation runs on the whole page.

**Images:** [`docs/mockups/screens/`](mockups/screens/) (a/b/c, desktop and mobile)

> 🖊 _Add one sentence on what you'd have chosen if the brief were different (e.g. A for a specialty roaster)._

---

## 4. Architecture: making it maintainable

**Folder structure** (route → feature → shared, with a hard server boundary):

```
app/         routes only (thin)
features/    one folder per domain: home, menu, cart, orders, auth, staff, admin
components/  shared UI: ui/ (shadcn) and layout/ (site chrome)
server/      server-only: auth, db, models, role guard
lib/         framework-free helpers + zod schemas
```

**Decisions worth explaining:**
- **One validation schema, two places.** The zod schema behind `POST /api/auth/register` also drives the sign-up form's inline errors, so "8+ characters" is defined once.
- **API routes guard themselves.** `proxy.ts` (Next 16's middleware) doesn't cover `/api`, so a small `requireRole()` helper protects every write.
- **Tokens, not colours.** The palette lives in `globals.css` and maps onto shadcn's semantic tokens, so the staff/admin screens were restyled without touching their layouts.
- **Server components by default.** The homepage reads the menu straight from the database and is regenerated every 5 minutes; only the board and the buttons that depend on who's signed in are client components.
- **12 slices, one commit each,** with lint, type-check, tests and build passing after every slice. The history reads as the story: tooling → reorganise → dead code → security → tokens → pages → accessibility → tests.

> 🖊 _Optional diagram: request flow for placing an order (page → API → zod → Mongo → ticket)._

---

## 5. Before / after

**Numbers**

| | Before | After |
|---|---|---|
| ESLint problems | 27 (and the lint script didn't run) | **0** |
| Known security holes | 2 found in audit (+4 more found during the rebuild) | **0 known** |
| axe WCAG 2.2 AA violations | 3 rules failing across 14+ pages | **0 on all 13 routes** |
| Unnamed buttons (admin products page) | up to 19 | **0** |
| Unused npm packages | 6 | **0** |
| Automated tests | 6 unit | **18 unit + 18 browser tests**, each run on desktop and phone |
| Product photos matching their drink | 4 of 8 loaded, none matched | **8 of 8** |

**Fixes that make good one-liners:**
- The "empty" countdown ring wasn't empty: it was a full ring that barely moved in 30 minutes. It's now a ticking `mm:ss` over a draining bar.
- Broken add-on checkboxes came from a global tap-target rule stretching Radix's `<button>` checkboxes. One CSS selector fixed every one of them.
- "No Sugar sugar" and "Hot Ice": a label-building helper, now fixed in one place and covered by unit tests.
- Staff can type the 4-character ticket code when the camera can't scan, using the same code the customer sees.

**Images:** [before](screenshots/before/) vs [after](screenshots/after/) (same file names), [side by side](screenshots/compare/)

> 🖊 _Pick 3 before/after pairs for the page: home (desktop), order ticket (phone), menu (phone)._

---

## 6. Next

What I'd do with more time, and why each matters:
_Follow-ups already shipped after the main rebuild: the scanner restart fix, the staff/admin board layout (with editable size options and a working CSV export), and removing `framer-motion` once nothing used it._

1. **Real-device scanner testing.** The restart fix is in, but a camera can't be verified headless.
2. **A live strike-system story.** During testing, a shared test account really did hit 3 missed pickups and was paused for 24 hours. It's a good real-world proof of the rule, and the reason the e2e journey now uses a fresh account each run.
3. **CI.** Run the checks on every push, and the browser tests against preview deployments.
4. **Real photography and copy review** with an actual café.

**Process & tools.** _(Describe how you worked, and be specific about the tools you used: the audit and mockup tooling, Playwright, axe, and any assistants. Hiring managers value clear, honest process notes.)_

---

### Evidence index
- Audit and before screenshots: [audit report](audit/AUDIT.md), [before](screenshots/before/), [unfinished redesign](screenshots/before-unfinished-redesign/)
- Mockups: [`docs/mockups/index.html`](mockups/index.html)
- After screenshots: [after](screenshots/after/), comparisons in [compare](screenshots/compare/)
- Tests: [`tests/unit/`](../tests/unit/), [`tests/e2e/`](../tests/e2e/)
- Onboarding: [`docs/ONBOARDING.md`](ONBOARDING.md)
