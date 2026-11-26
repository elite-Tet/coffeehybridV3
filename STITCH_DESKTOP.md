# Stitch prompts: DESKTOP (website + staff + admin)

**Setup:** In Stitch, create a new project and choose **Web**.
Copy each block (everything inside the grey box) and paste it as one message, in order. Wait for each screen to finish before pasting the next.

This project covers three things, all in one project:
- **Blocks 1–5:** the customer website on a laptop
- **Blocks 6–8:** the staff screens (tablet in landscape, which also works in Web mode)
- **Blocks 9–13:** the admin panel

---

## Block 1: Design system + Landing

```
Design a desktop website called "CoffeeHybrid", a coffee shop site for ordering ahead. Customers order online, get a QR code, show it at the counter and pick up their drink with no queue. Staff use a tablet order board. The owner uses an admin panel.

RULES THE DESIGN MUST EXPLAIN CLEARLY:
- Orders are held for 30 minutes. If not picked up, they expire.
- An expired order = 1 strike. 3 strikes = ordering paused for 24 hours (browsing still works).
- Order status: Received → Brewing → Ready → Picked up (also Expired, Cancelled).

STYLE (use for every screen in this project):
- Warm modern specialty café. Calm, crafted, friendly. NOT techy, NOT neon, NO glassmorphism, NO glowing blobs, NO heavy gradients.
- Light theme: cream paper background (#F7F1E8), espresso text (#3B2A20), roasted brown primary (#7A4A2A), small crema-gold accent (#E2B65C) used sparingly, warm thin borders (#E5DACB).
- Fonts: serif headings (Fraunces), clean sans for everything else (Inter). Sentence case. No ALL CAPS, no italic shouting.
- Rounded cards (16px), pill-shaped buttons and chips, very soft shadows, generous white space.
- Real coffee photography on warm neutral backgrounds.
- Status colors always come with an icon and a text label: Received = grey, Brewing = amber, Ready = green, Picked up = brown, Expired = muted red.
- Friendly short copy, like a barista talking.

SCREEN: Landing page, desktop 1440px wide.
- Top bar (one row): logo "CoffeeHybrid", links Menu and How it works, "Sign in" link, "Start an order" pill button.
- Hero split in two: left has the serif headline "Skip the line, not the coffee.", a supporting line and buttons "Start an order" + "See the menu"; right has a large latte photo.
- "How it works": 3 columns with numbered steps and line icons: Order online → Show your QR at the counter → Grab your drink.
- "Fair pickup" band: "We hold your order for 30 minutes. Miss 3 pickups and ordering pauses for 24 hours." Friendly, not scary.
- "Popular today": a row of 4 drink cards.
- Footer: hours, address, links.
```

---

## Block 2: Menu

```
Keep the exact same style, colors, fonts and components as the previous screen.

SCREEN: Menu, desktop, signed-in customer.
- Same top bar, with a cart button showing "2" and a user avatar.
- Page title "Menu" and a search field on the right.
- Category chips row: All, Coffee, Tea, Frappé, Pastry.
- "Your usuals" row with small cards and "Add again" buttons.
- Product grid, 4 columns. Each card: photo, name, 1-line description, price, round "+" quick-add button. One card is "Sold out" (greyed photo, no button).
- Bottom-right floating card for the active order: "Brewing" amber chip, "Pick up within 18 min", "Show QR" button.
```

---

## Block 3: Customize drink + cart

```
Keep the exact same style, colors, fonts and components as the previous screens.

SCREEN: Menu with a centered dialog open for customizing a drink (page dimmed behind).
- Left half of the dialog: drink photo. Right half: name "Iced Caramel Latte" and description.
- Size: segmented control: Small · Medium +$0.50 · Large +$1.00.
- Sugar chips: 0%, 25%, 50% (selected), 75%, 100%.
- Ice chips: No ice, Less, Normal (selected), Extra.
- Add-ons checklist: Extra shot +$0.75, Oat milk +$0.50, Caramel drizzle +$0.50.
- Footer: quantity stepper and a brown button "Add to order · $5.25". Close (X) top right.
```

---

## Block 4: Checkout

```
Keep the exact same style, colors, fonts and components as the previous screens.

SCREEN: Checkout, desktop, two columns.
- Left column: "Your items" list (thumbnail, name, customization text, quantity stepper, edit, remove).
- Right column (sticky summary card):
  - Pickup info: "We'll hold your order for 30 minutes after you place it."
  - Strike dots 1 of 3: "1 of 3 missed pickups".
  - Subtotal and total.
  - Full-width button "Place order · $9.50".
```

---

## Block 5: Order status with QR

```
Keep the exact same style, colors, fonts and components as the previous screens.

SCREEN: Order status, desktop.
- Top: 4-step progress bar: Received → Brewing → Ready (current, green) → Picked up.
- Green banner: "Your order is ready. Show this at the counter."
- Left: large QR code on a pure white card with "#A27" in big monospace under it, and a countdown ring "12 min left".
- Right: "Your items" list and total, plus "Order again" button.
```

---

## Block 6: Staff order board (tablet landscape)

```
Keep the exact same colors and fonts, but this screen is for STAFF on a tablet in landscape (1180 x 820), read from 1 meter away at a busy counter. Make everything big and simple. Order numbers at least 32px, body text at least 18px.

SCREEN: Staff order board.
- Top bar: "CoffeeHybrid · Staff", live clock "9:42 AM", sound on/off icon, "Sold out" button, and a large brown "Scan QR" button on the right.
- 3 equal columns with count badges: New (3), Brewing (2), Ready (4).
- Order cards: big monospace order number "#A27", customer first name, item list with customization chips ("Large", "50% sugar", "Oat milk"), time label "4 min ago", and ONE full-width action button: "Start brewing" in New, "Mark ready" in Brewing.
- Ready column cards show "Waiting 12 min" in amber, and one card in red "Waiting 26 min · expires soon" with a warning icon.
- No sidebar. Use the full width.
```

---

## Block 7: Staff scan result (success + fail)

```
Keep the exact same style as the staff order board.

SCREEN: Two scan result screens side by side, tablet landscape.
1. SUCCESS: full-screen green panel, huge check icon, "#A27 · Sophea", list of 2 items with customizations, big button "Complete pickup".
2. FAILED: full-screen muted red panel, huge X icon, plain reason "This code was already used at 9:14 AM", big button "Scan again".
Text readable from 1 meter away.
```

---

## Block 8: Staff sold-out panel

```
Keep the exact same style as the staff order board.

SCREEN: Order board with a right-side panel open titled "Mark sold out".
- Search field.
- List of products with a photo, name and a large on/off switch "Available".
- 2 items switched off show a "Sold out" label.
- "Done" button at the bottom.
```

---

## Block 9: Admin dashboard

```
Keep the exact same colors, fonts and components. This is the ADMIN panel for the shop owner, desktop 1440px. Calm, data-first.

SCREEN: Admin "Today" dashboard.
- Left sidebar: logo, nav items Today (active), Orders, Menu, Customers, Settings, and at the bottom "Open staff board" and the user avatar.
- Header: "Today" serif title, date "Thursday, Nov 26", date-range picker.
- Row of 4 KPI cards: Revenue $482 (+12% vs last Thu), Orders 96, Pickup rate 94%, No-shows 6.
- Large bar chart "Orders by hour" in brown and gold.
- "Top drinks" ranked list with small bars.
- Right rail "Live queue": New 3, Brewing 2, Ready 4, with a link "Open staff board".
```

---

## Block 10: Admin menu (products)

```
Keep the exact same admin style and sidebar (Menu active).

SCREEN: Menu management.
- Title "Menu", tabs "Products | Categories" (Products active), "Add product" button.
- Category filter chips and a search field.
- Table: thumbnail, name, category, price, an "Available" on/off switch, and a "..." actions menu. 8 rows, 1 row switched off showing "Sold out".
```

---

## Block 11: Admin edit product

```
Keep the exact same admin style.

SCREEN: Menu page with a wide right-side panel open "Edit product".
- Left part of the panel: form sections with labels above the fields:
  - Basics (name, description, category dropdown)
  - Price & sizes (base price; size rows with + price)
  - Sugar & ice options (chips)
  - Add-ons (rows with price)
  - Image upload
- Right part: "Preview" showing how the product card looks to customers.
- Sticky footer: "Cancel" and "Save changes" buttons.
```

---

## Block 12: Admin orders

```
Keep the exact same admin style and sidebar (Orders active).

SCREEN: All orders.
- Filters: status chips (All, Received, Brewing, Ready, Picked up, Expired), date range, search "Order # or customer".
- Table: order #, customer, items, total, status chip with icon, time.
- One row selected, with a right-side detail panel: item list, status timeline with times, customer name and strike dots.
```

---

## Block 13: Admin customers

```
Keep the exact same admin style and sidebar (Customers active).

SCREEN: Customers.
- Search field.
- Table: name, email, total orders, strikes (3 dots, filled = strikes), status ("Active" green chip or "Paused until 3:40 PM" red chip), and a "Clear strikes" button.
- Show a small confirmation dialog: "Clear strikes for Dara?" with "Cancel" (focused) and "Clear strikes" buttons.
```
