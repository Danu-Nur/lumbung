# Current System Architecture

## 1. Overview
This document outlines the **current** Microservices architecture of the Lumbung application.
- **Frontend**: Next.js 15 (App Router), React Query, Dexie.js (Offline-First).
- **Backend**: Fastify (Node.js), Prisma ORM.
- **Database**: PostgreSQL (Data), Redis (Cache/Queue).

---

## 2. Project Structure

### A. Backend Structure (`/backend`)
The backend is a lightweight API service built with **Fastify**.

```text
backend/
├── prisma/
│   ├── migrations/           # Database Migrations
│   ├── schema.prisma         # SINGLE SOURCE OF TRUTH for Schema
│   └── seed.ts               # Database Seeder
├── src/
│   ├── app.ts                # Application Entry Point & Plugin Registration
│   ├── controllers/          # Request Handlers (Validation -> Service -> Response)
│   │   ├── auth.ts           # Login/Register Logic
│   │   ├── inventory.ts      # Stock Movement Handlers
│   │   ├── product.ts        # Product CRUD
│   │   ├── order.ts          # Sales Order Handlers
│   │   ├── dashboard.ts      # Analytics Data
│   │   └── ... (category, master, supplier, warehouse, subscription)
│   ├── routes/               # API Route Definitions (Fastify Plugins)
│   │   ├── auth.ts           # /api/auth/*
│   │   ├── inventory.ts      # /api/inventory/*
│   │   ├── product.ts        # /api/products/*
│   │   └── ...
│   ├── services/             # Business Logic & Reusable Functions
│   │   └── ...
│   ├── lib/
│   │   └── prisma.ts         # Singleton Prisma Client
│   └── types/                # TypeScript Type Definitions
├── package.json
└── tsconfig.json
```

### B. Frontend Structure (`/frontend`)
The frontend is built with **Next.js 15** and uses a Feature-based architecture.

```text
frontend/
├── src/
│   ├── app/                  # Next.js App Router (Pages & Layouts)
│   │   ├── (auth)/           # Login Pages
│   │   ├── (dashboard)/      # Main App Pages (Protected)
│   │   └── api/              # Local API Routes (if any)
│   │
│   ├── components/           # Shared UI Components (Shadcn/UI)
│   │   ├── ui/               # Base Elements (Button, Input, etc.)
│   │   └── ...
│   │
│   ├── features/             # Feature Modules (Domain Specific)
│   │   ├── adjustments/      # Stock Adjustment Logic & UI
│   │   ├── categories/       # Category Management
│   │   ├── customers/        # Customer Management
│   │   ├── inventory/        # Inventory Table & Actions
│   │   ├── purchase-orders/  # PO Management
│   │   ├── sales-orders/     # SO POS & Management
│   │   ├── suppliers/        # Supplier Management
│   │   ├── transfers/        # Stock Transfer Features
│   │   ├── warehouses/       # Warehouse Management
│   │   └── settings/         # App Configuration
│   │
│   ├── lib/                  # Core Utilities & Services
│   │   ├── api.ts            # Axios Client (The Bridge to Backend)
│   │   ├── db.ts             # Dexie.js Schema (Offline Database)
│   │   ├── sync.ts           # Background Sync Service
│   │   ├── services/         # API Service Layer (See Section 3)
│   │   │   ├── authService.ts
│   │   │   ├── productService.ts
│   │   │   ├── inventoryService.ts
│   │   │   ├── dashboardService.ts
│   │   │   └── ...
│   │   └── ...
│   │
│   ├── providers/            # React Context Providers
│   │   ├── auth-provider.tsx # Session Management
│   │   ├── query-provider.tsx# TanStack Query Config
│   │   └── sync-provider.tsx # Offline Sync Timer
│   │
│   └── types/                # Global TS Types
└── ...
```

---

## 3. Frontend-Backend Connection (`Structure View`)

The connection between Frontend and Backend is established via the **Service Layer** in the Frontend.

### Connection Flow
1.  **UI Component** (e.g., `InventoryPage`) calls a **Hook** (e.g., `useQuery`).
2.  **Hook** calls a **Service Function** (e.g., `productService.getProducts()`).
3.  **Service Function** uses the **Axios Instance** (`lib/api.ts`).
4.  **Axios** sends HTTP Request to **Backend URL** (`NEXT_PUBLIC_API_URL`).
5.  **Backend Controller** processes request and returns JSON.

### Key Components

#### 1. The Bridge: `src/lib/api.ts`
This file configures the Axios instance that authenticates all requests.
```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL, // e.g., http://localhost:4000/api
  withCredentials: true, // IMPORTANT: Sends HTTP-Only Cookies (Auth Token)
});

export default api;
```

#### 2. The Service Layer: `src/lib/services/*.ts`
Each Backend Controller has a corresponding Frontend Service.

| Backend Controller | Frontend Service | Description |
| :--- | :--- | :--- |
| `controllers/auth.ts` | `lib/services/authService.ts` | Login, Logout, Session |
| `controllers/product.ts` | `lib/services/productService.ts` | CRUD Products |
| `controllers/inventory.ts` | `lib/services/inventoryService.ts` | Stock Adjustments, History |
| `controllers/order.ts` | `lib/services/salesOrderService.ts` | Sales Orders, Invoicing |

#### 3. Data Fetching (React Query)
We do not call Services directly in components. We use `TanStack Query` for caching and state management.

```typescript
// Example usage in a component
const { data: products } = useQuery({
  queryKey: ['products'],
  queryFn: () => productService.getProducts(),
});
```

---

## 4. Offline Capabilities (Dexie + Sync)

The architecture supports limited offline functionality:
1.  **Reads**: `useQuery` attempts to fetch from API. If network fails, it falls back to reading from `Dexie.js` (IndexedDB).
2.  **Writes**: Actions (like creating an Order) are saved to `Dexie` with `synced: 0`.
3.  **Sync**: `SyncProvider` detects online status and flushes pending records to the Backend via `sync.ts`.

---

## 5. Deployment & Environment

- **Docker Compose**: Running `docker compose up` spins up:
    -   `backend` (Port 4000) - Runs migrations on startup (`npm run prisma:deploy`)
    -   `frontend` (Port 3000) - Generates client from backend schema
    -   `db` (Postgres 5432)
    -   `redis` (Redis 6379)
- **Environment Variables**:
    -   Backend needs `DATABASE_URL` and `AUTH_SECRET`.
    -   Frontend needs `NEXT_PUBLIC_API_URL` pointing to the Backend.

## 6. Prisma Architecture (Single Source of Truth)

To ensure consistency and avoid schema mismatch, we enforce a **Single Source of Truth** for the database schema.

1.  **Owner**: The **Backend** (`backend/prisma/schema.prisma`) is the sole owner of the database definition and migrations.
2.  **Frontend Usage**:
    -   The frontend **DOES NOT** maintain its own `schema.prisma`.
    -   Ideally, the frontend should consuming the Backend API exclusively.
    -   For legacy Server Actions or Type Safety, the frontend generates its Prisma Client by reading the **Backend Schema** directly (`prisma generate --schema=../backend/prisma/schema.prisma`).
3.  **Deployment**:
    -   Migrations are run ONLY by the Backend service (or a dedicated migration job).
    -   Frontend contains a build step to generate the client but does NOT attempt to migrate the DB.

### Developer Commands
Run these from the **root** directory:

-   `npm run dev:backend` : Start backend dev server
-   `npm run dev:frontend`: Start frontend dev server
-   `npm run prisma:generate` : Generate client for backend
-   `npm run db:migrate` : Run migrations (backend)
-   `npm run db:seed` : Seed database (backend)



