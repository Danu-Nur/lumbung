# Implementation Plan: Corporate-Grade Scaling (Lumbung)

This plan outlines the steps to move the current "Lumbung" implementation from direct DB-only logic to the corporate architecture (Redis, BullMQ, Outbox, and Read Models) as defined in the docs.

## Phase 1: Persistence & Infrastructure
- [ ] Run Prisma migration to apply `OutboxEvent` and `StockSummary` models.
  - Command: `npx prisma db push` or `prisma migrate dev` in the backend.
- [ ] Ensure Redis is accessible from the backend (Check logs of `src/lib/redis.ts`).

## Phase 2: Inventory & The Outbox Pattern
- [ ] **Refactor `InventoryService`**:
  - Update `createAdjustment` and `createMovement` to run inside a Prisma Transaction.
  - Inside the transaction, add a record to `OutboxEvent` with topic `inventory.movement.created`.
- [ ] **Implement Outbox Processor Trigger**:
  - Add a simple "trigger" or a `setInterval` in `app.ts` that calls `outboxService.processEvents()` every 5 seconds (temporary solution until we have a proper cron).

## Phase 3: Background Worker Logic
- [ ] **Complete `src/queue/worker.ts`**:
  - Implement full logic for `recalculate-summary`.
  - The worker should query all movements for a specific `(Product, Warehouse, OrganicId)`.
  - Calculate `totalIn`, `totalOut`, and `currentStock`.
  - Upsert the result into the `StockSummary` table.
- [ ] **Cache Integration**:
  - In the worker, use `cache.invalidate` to clear related Redis keys (Stats, Product lists).

## Phase 4: Dashboard & Performance Optimization
- [ ] **Redesign Dashboard API**:
  - Change `DashboardService` to read from the `StockSummary` table instead of performing raw aggregations on `InventoryMovement`.
  - Wrap the call in `cache.getOrSet` to hit Redis first.
- [ ] **Optimize Inventory List**:
  - Use `cache.getOrSet` for the main product list with a short TTL (e.g., 60s).

## Phase 5: Reliability & Polish
- [ ] **Email Integration**:
  - Move PDF generation/email sending for Purchase/Sales orders into `mailQueue` via `BullMQ`.
- [ ] **Observability**:
  - Log every cache miss and worker retry to monitor system health.

---
**Next Immediate Action**: Run the Prisma migration and refactor the `InventoryService` create/update logic.
