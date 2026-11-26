# CoffeeHybrid V2 ☕️🚀

> **Smart Coffee Ordering System** — Order ahead, skip the queue, and reduce waste.

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![NextAuth.js](https://img.shields.io/badge/NextAuth.js-v5-purple?style=for-the-badge&logo=next.js&logoColor=white)

## 📌 Project Overview

**CoffeeHybrid V2** is a production-ready, full-stack coffee ordering application designed to solve queue fatigue and reduce drink waste. It bridges the gap between digital convenience and physical service with a robust ordering flow, real-time tracking, and automated enforcement policies.

### 🌟 Key Features

#### 🛍️ Customer Experience
- **Smart Menu**: Browse categories, search products, and customize orders (size, sugar, ice, add-ons).
- **Cart & Checkout**: Real-time cart management powered by **Zustand**.
- **QR Pickup**: Generate a unique QR code for each order to verify pickup securely.
- **Order Tracking**: Live status updates (Pending → Confirmed → Ready → Completed).
- **Order History**: Review past orders and reorder favorites instantly.

#### 🛡️ Compliance & Enforcement
- **Strike System**: Automated strike accumulation for no-show orders. Users who accumulate **3 strikes** receive an automatic **24-hour suspension**.
- **Auto-Expiration**: Unclaimed orders automatically expire after **30 minutes** via cron jobs to reduce waste and clear the queue.

#### 👨‍💼 Staff & Admin Portal
- **Dashboard Analytics**: Visualize sales, revenue trends, and popular products with **Recharts**.
- **Live Order Queue**: Kanban-style board for managing incoming orders in real-time.
- **QR Scanner**: Built-in camera scanner for staff to verify customer pickups instantly and mark orders as completed.
- **Product Management**: Full CRUD capabilities for menu items, categories, and inventory.
- **User Management**: Manage roles (Customer, Staff, Admin) and handle user suspensions manually if needed.

---

## 🛠️ Tech Stack

| Layer | Technology | Key Libraries |
|---|---|---|
| **Frontend** | **Next.js 16.1** (App Router), **React 19** | `lucide-react`, `framer-motion`, `sonner` |
| **Styling** | **Tailwind CSS v4** | `shadcn/ui`, `class-variance-authority`, `tailwind-merge` |
| **State** | **Zustand** | `zustand` |
| **Forms** | **React Hook Form** | `zod`, `@hookform/resolvers` |
| **Backend** | **Next.js API Routes** (Serverless) | `mongoose` |
| **Database** | **MongoDB Atlas** | `mongoose` |
| **Auth** | **NextAuth.js v5** (Beta) | `next-auth`, `bcryptjs` |
| **Utilities** | **Date-fns**, **QR Code** | `date-fns`, `qrcode`, `html5-qrcode` |
| **Testing** | **Vitest** | `vitest`, `@testing-library/react` |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- MongoDB Atlas Cluster (or local instance)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/coffeehybrid-v2.git
    cd coffeehybrid-v2/coffeehybrid
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Setup:**
    Create a `.env.local` file in the root directory based on `.env.example`:
    ```env
    MONGODB_URI=your_mongodb_connection_string
    NEXTAUTH_SECRET=your_random_secret_32_chars
    NEXTAUTH_URL=http://localhost:3000
    GOOGLE_CLIENT_ID=your_google_client_id
    GOOGLE_CLIENT_SECRET=your_google_client_secret
    CRON_SECRET=your_cron_secret_key
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) to view the app.

### Testing

Run the test suite with Vitest:
```bash
npm test        # Run once
npm run test:watch  # Watch mode
```

---

## 📂 Project Structure

```bash
coffeehybrid/
├── app/                  # Next.js App Router
│   ├── (auth)/           # Authentication routes (login, register)
│   ├── (public)/         # Public customer-facing pages (menu, cart, history)
│   ├── admin/            # Admin dashboard (products, analytics, users)
│   ├── api/              # API routes (auth, orders, cron, products)
│   └── staff/            # Staff dashboard (queue, scan)
├── components/           # React components
│   ├── admin/            # Admin-specific components
│   ├── cart/             # Cart & checkout components
│   ├── menu/             # Menu & product display components
│   ├── ui/               # Reusable UI components (shadcn/ui)
│   └── provider/         # Context providers (NextAuth, etc.)
├── lib/                  # Utility functions
│   ├── mongodb.ts        # Database connection
│   ├── auth.ts           # Authentication logic
│   └── strikes.ts        # Strike system logic
├── models/               # Mongoose schemas (User, Product, Order)
├── public/               # Static assets
└── store/                # Zustand state management
```

## 📜 License

This project is licensed under the MIT License.
