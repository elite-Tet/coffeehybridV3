# Stitch prompts: PHONE (customer app)

**Setup:** In Stitch, create a new project and choose **Mobile**.
Copy each block (everything inside the grey box) and paste it as one message, in order. Wait for each screen to finish before pasting the next.

---

## Block 1: Design system + Landing

```
Design a mobile app called "CoffeeHybrid", a coffee shop app for ordering ahead. Customers order on their phone, get a QR code, show it at the counter and pick up their drink with no queue.

RULES THE DESIGN MUST EXPLAIN CLEARLY:
- Orders are held for 30 minutes. If not picked up, they expire.
- An expired order = 1 strike. 3 strikes = ordering paused for 24 hours (browsing still works).
- Order status: Received → Brewing → Ready → Picked up (also Expired, Cancelled).

STYLE (use for every screen in this project):
- Warm modern specialty café. Calm, crafted, friendly. NOT techy, NOT neon, NO glassmorphism, NO glowing blobs, NO heavy gradients.
- Light theme: cream paper background (#F7F1E8), espresso text (#3B2A20), roasted brown primary (#7A4A2A), small crema-gold accent (#E2B65C) used sparingly, warm thin borders (#E5DACB).
- Fonts: serif headings (Fraunces), clean sans for everything else (Inter). Sentence case. No ALL CAPS, no italic shouting.
- Rounded cards (16px), pill-shaped buttons and chips, very soft shadows.
- Real coffee photography on warm neutral backgrounds.
- Status colors always come with an icon and a text label: Received = grey, Brewing = amber, Ready = green, Picked up = brown, Expired = muted red.
- Touch targets at least 44px. Body text at least 16px.
- Bottom tab bar on app screens: Menu, Orders, Account.
- Friendly short copy, like a barista talking.

SCREEN: Landing page (for signed-out visitors).
- Hero: serif headline "Skip the line, not the coffee.", one short supporting line, primary button "Start an order", text link "Sign in", latte photo.
- "How it works": 3 numbered steps with line icons: Order on your phone → Show your QR at the counter → Grab your drink.
- "Fair pickup" card: "We hold your order for 30 minutes. Miss 3 pickups and ordering pauses for 24 hours." Friendly, not scary.
- "Popular today": horizontal scrolling row of drink cards (photo, name, price).
- Small footer: opening hours, address, links.
```

---

## Block 2: Menu

```
Keep the exact same style, colors, fonts and components as the previous screen.

SCREEN: Menu (signed-in customer).
- Header: greeting "Good morning, Dara" and a search field.
- Category chips in one horizontal scrolling row (All, Coffee, Tea, Frappé, Pastry), sticky under the header.
- "Your usuals" row: small cards with the drink name and an "Add again" button.
- Product grid, 2 columns. Each card: 4:5 photo, name, 1-line description, price, round "+" quick-add button.
- One card is sold out: greyed photo, "Sold out" label, no + button.
- Floating cart pill above the tab bar: "2 items · $9.50 →".
- Active order card above the cart pill: "Brewing" amber chip, "Pick up within 18 min", "Show QR" button.
- Bottom tab bar: Menu (active), Orders, Account.
```

---

## Block 3: Customize drink

```
Keep the exact same style, colors, fonts and components as the previous screens.

SCREEN: Customize drink bottom sheet, sliding up over the dimmed Menu screen.
- Drag handle and close (X) button.
- Drink photo, name "Iced Caramel Latte", short description.
- Size: segmented control: Small · Medium +$0.50 · Large +$1.00.
- Sugar: chips: 0%, 25%, 50% (selected), 75%, 100%.
- Ice: chips: No ice, Less, Normal (selected), Extra.
- Add-ons: checklist with prices: Extra shot +$0.75, Oat milk +$0.50, Caramel drizzle +$0.50.
- Sticky footer: quantity stepper (− 1 +) and a full-width brown button "Add to order · $5.25".
```

---

## Block 4: Cart

```
Keep the exact same style, colors, fonts and components as the previous screens.

SCREEN: Cart bottom sheet over the Menu.
- Title "Your order".
- 2 item rows: thumbnail, name, small grey customization text ("Large · 50% sugar · Oat milk"), quantity stepper, "Edit" link.
- Subtotal row.
- Full-width button "Checkout · $9.50".
- Under it, a small text link "Keep browsing".
```

---

## Block 5: Checkout

```
Keep the exact same style, colors, fonts and components as the previous screens.

SCREEN: Checkout (one page, no steps).
- Title "Review your order".
- Card 1 "Your items": item list with edit links.
- Card 2 "Pickup": "We'll hold your order for 30 minutes after you place it." Strike indicator with 3 dots, 1 filled: "1 of 3 missed pickups". An expandable "How pickups work" link.
- Card 3 "Total": subtotal and total.
- Sticky bottom bar with a full-width button "Place order · $9.50".
```

---

## Block 6: Checkout (ordering paused)

```
Keep the exact same style, colors, fonts and components as the previous screens.

SCREEN: Same Checkout screen, but the account is paused after 3 missed pickups.
- The cart and items are still visible.
- A calm warning card (muted red, with an icon): "Ordering is paused until 3:40 PM. You missed 3 pickups. You can still browse and build your order."
- Strike dots: 3 of 3 filled.
- Bottom button is disabled and reads "Ordering paused until 3:40 PM".
```

---

## Block 7: Order status with QR

```
Keep the exact same style, colors, fonts and components as the previous screens.

SCREEN: Order status.
- Top: horizontal 4-step progress: Received → Brewing (current, amber) → Ready → Picked up.
- Center: large QR code on a pure white card, order number "#A27" under it in big bold monospace.
- Circular countdown ring around a label "18 min left".
- Small tip: "Turn your brightness up at the counter."
- Collapsible "Your items" list and total below.
```

---

## Block 8: Order ready

```
Keep the exact same style, colors, fonts and components as the previous screens.

SCREEN: Same Order status screen, but the order is READY.
- Header area turns green with a check icon: "Your order is ready. Show this at the counter."
- Progress step "Ready" highlighted green.
- QR code and "#A27" are large and centered.
- Countdown "12 min left".
```

---

## Block 9: Order expired

```
Keep the exact same style, colors, fonts and components as the previous screens.

SCREEN: Same Order status screen, but EXPIRED.
- QR code greyed out with a muted red label "Expired".
- Message: "This order wasn't picked up in time. 1 strike added."
- Strike dots: 2 of 3 filled, with the line "3 missed pickups pauses ordering for 24 hours."
- Primary button "Order again", secondary link "Back to menu".
```

---

## Block 10: Picked up

```
Keep the exact same style, colors, fonts and components as the previous screens.

SCREEN: Pickup complete.
- Big friendly illustration or photo of a coffee cup.
- "Enjoy your coffee ☕"
- Small order summary (#A27, 2 items, $9.50).
- Buttons: "Order again" (primary), "Back to menu" (text link).
```

---

## Block 11: Orders tab

```
Keep the exact same style, colors, fonts and components as the previous screens.

SCREEN: Orders tab.
- "Active" section at the top with the live order card (Brewing chip, "18 min left", "Show QR" button).
- "Past orders" list grouped by date (Today, Yesterday, Nov 20). Each row: time, items summary, total, status chip with icon (Picked up / Expired / Cancelled), "Order again" button.
- Bottom tab bar: Orders active.
```

---

## Block 12: Orders tab empty

```
Keep the exact same style, colors, fonts and components as the previous screens.

SCREEN: Orders tab, empty state.
- Simple line illustration of a coffee cup.
- "No orders yet"
- "Your first coffee is a few taps away."
- Button "Browse the menu".
```

---

## Block 13: Account

```
Keep the exact same style, colors, fonts and components as the previous screens.

SCREEN: Account.
- Avatar, name, email.
- Card "Pickup record": strike dots (1 of 3), short explanation of the 30-minute rule and the 3-strike pause.
- Card "Appearance": System / Light / Dark segmented control.
- List rows: Order history, Help, Privacy.
- "Sign out" button at the bottom.
- Bottom tab bar: Account active.
```

---

## Block 14: Sign in

```
Keep the exact same style, colors, fonts and components as the previous screens.

SCREEN: Sign in.
- Small logo and serif title "Welcome back".
- Email field and password field, labels above the fields, show/hide password eye icon.
- One field shows an error under it in muted red: "Enter a valid email".
- Full-width button "Sign in".
- Links: "Create an account", "Just browsing? Continue as guest".
```

---

## Block 15: Create account

```
Keep the exact same style, colors, fonts and components as the previous screens.

SCREEN: Create account.
- Serif title "Create your account".
- Fields: Name, Email, Password (helper text "8 or more characters"), labels above, show/hide password.
- Full-width button "Create account".
- Link "Already have an account? Sign in".
```
