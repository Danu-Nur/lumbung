# Refactor Notes - SaaS & Performance Implementation

## Overview
This phase transformed the application from a single-tenant warehouse system into a multi-tenant SaaS platform with commercial features and an optional high-performance layer.

## Key Changes

### 1. Performance Layer (`lib/performance`)
- **Abstraction**: Created unified interfaces (`CacheStore`, `QueueDriver`) to support swappable backends.
- **Drivers**:
  - `MemoryCache` / `InlineQueue`: Default, zero-dependency implementations for simple deployments.
  - `RedisCache` / `RedisQueue`: High-performance implementations using `ioredis` and `bullmq`.
- **Configuration**: Controlled via environment variables (`FEATURE_PERF_CACHE`, `FEATURE_PERF_QUEUE`, `REDIS_URL`).

### 2. Subscription System (`lib/services/subscriptionService.ts`)
- **Models**: Added `Plan` and `Subscription` models to Prisma schema.
- **Logic**: Implemented service to manage plan limits (users, warehouses), upgrades, and status checks.
- **Guards**: Added middleware-level guards to enforce plan limits before actions.

### 3. Email Notifications (`lib/services/notificationService.ts`)
- **Architecture**: Decoupled email sending from business logic.
- **Queueing**: Emails are offloaded to a background queue (if enabled) to prevent blocking user requests.
- **Preferences**: Added user preferences for opting out of specific alerts (e.g., low stock).

### 4. Superadmin Dashboard (`app/[locale]/superadmin`)
- **Access Control**: Strict `SuperAdmin` role requirement.
- **Features**:
  - Global statistics (organizations, users, orders).
  - Organization management (view details, manage subscriptions).
  - Global user list.

### 5. Marketing Site (`app/[locale]/(marketing)`)
- **Layout**: Dedicated layout separate from the dashboard.
- **Pages**: Landing page, Pricing page, and authentication entry points.

## Database Changes
- Added `Plan` and `Subscription` tables.
- Added `subscription` relation to `Organization`.
- Added `preferences` JSON field to `User`.

## Verification
- **Performance**: Toggle `FEATURE_PERF_CACHE` in `.env` to switch between Memory and Redis.
- **SaaS**: Log in as Superadmin to manage plans. Log in as Org Admin to view billing settings.
