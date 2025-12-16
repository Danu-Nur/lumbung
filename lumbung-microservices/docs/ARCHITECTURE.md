# Architecture Documentation - Lumbung Microservices

## 1. Overview
This document describes the refactored **Lumbung** architecture, which has been migrated from a monolithic Next.js application to a Microservices architecture separating the Frontend and Backend.

- **Frontend**: Next.js 15 (App Router) + React Query + Dexie.js (Offline)
- **Backend**: Node.js + Fastify + Prisma ORM
- **Database**: PostgreSQL (Primary), Dexie.js (Offline Cache), Redis (Queue/Cache - Optional)
- **Infrastructure**: Dockerized services orchestrated via Docker Compose.

---

## 2. System Architecture

```mermaid
graph TD
    User[User Browser]
    
    subgraph "Frontend Container (Next.js)"
        UI[React UI (Shadcn)]
        RQ[React Query]
        Dexie[Dexie.js (IndexedDB)]
        Sync[Sync Service]
    end
    
    subgraph "Backend Container (Fastify)"
        API[Fastify API]
        Auth[Auth Module]
        Inv[Inventory Module]
        Ord[Order Module]
        Prisma[Prisma ORM]
    end
    
    DB[(PostgreSQL)]
    
    User -->|HTTP/Page Load| UI
    UI -->|Data Fetch| RQ
    RQ -->|1. Check Cache| Dexie
    RQ -->|2. Fetch (if online)| API
    Dexie <-->|Sync| Sync
    Sync -->|Background Push| API
    
    API --> Prisma
    Prisma --> DB
```

---

## 3. Component Details

### A. Frontend (`/frontend`)
The frontend is a **Next.js 15 Client-First** application. Unlike the previous version which relied heavily on Server Actions, this version moves data fetching to the client to support **Offline-First** capabilities.

- **Stack**: Next.js, TypeScript, Tailwind, Shadcn/UI, Axios, TanStack Query, Dexie.js.
- **Key Directories**:
    - `src/app`: App Router pages.
    - `src/components`: Reusable UI components.
    - `src/lib/api.ts`: Axios instance configured with `withCredentials` for cookie auth.
    - `src/lib/db.ts`: Dexie database schema for offline storage (`products`, `orders`).
    - `src/lib/sync.ts`: Background service that pushes offline `orders` to the backend when online.
    - `src/providers`: Global providers (`AuthProvider`, `SyncProvider`, `QueryProvider`).

**Offline Strategy**:
1.  **Read**: `useQuery` fetches from API. On success, it updates Dexie. On failure (offline), it falls back to reading from Dexie.
2.  **Write**: Critical actions (like `createOrder`) save to Dexie first with a `synced: false` flag.
3.  **Sync**: `SyncProvider` runs a persistent background interval (e.g., every 30s) calling `SyncService.syncOrders()`, which pushes unsynced items to the Backend.

### B. Backend (`/backend`)
The backend is a lightweight **Fastify** server handling business logic, authentication, and database transactions.

- **Stack**: Node.js, Fastify, Zod, Prisma, JSON Web Tokens (JWT).
- **Key Directories**:
    - `src/app.ts`: Entry point, plugin registration, and route prefixes.
    - `src/controllers`: Request handlers (Input validation -> Service call -> Response).
    - `src/services`: Business logic (Transactions, Calculations).
    - `src/routes`: Route definitions.
    - `src/lib/prisma.ts`: Singleton database client.

**Modules**:
- **Auth**: JWT-based login. Sets `token` in an `HttpOnly` cookie.
- **Inventory**: Manages Stock Adjustments and Inventory Lists.
- **Product**: CRUD for Products.
- **Order**: Handles Sales Orders. Contains logic to **automatically deduct stock** (`InventoryMovement`) upon order creation.

---

## 4. Infrastructure

The system is containerized for easy deployment.

- **Docker Compose**: Orchestrates `frontend`, `backend`, `postgres`, and `redis`.
- **Environment Variables**:
    - Frontend requires `NEXT_PUBLIC_API_URL`.
    - Backend requires `DATABASE_URL`, `AUTH_SECRET`, `FRONTEND_URL` (for CORS).

## 5. Development Workflow

1.  **Start Services**: `docker-compose up --build`
2.  **Database Migration**:
    -   Go to `backend/`
    -   Run `npx prisma db push` to sync schema with local Postgres.
3.  **Access**:
    -   Frontend: http://localhost:3000
    -   Backend: http://localhost:3001
