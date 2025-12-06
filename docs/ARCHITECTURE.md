# Lumbung Architecture Documentation

## Overview
Lumbung is a Next.js application for Warehouse Management, built with:
- **Framework**: Next.js 15 (App Router)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js (v5)
- **UI**: Tailwind CSS, Shadcn UI, Radix UI
- **State Management**: React Query (Server Actions), React Hook Form

## Core Patterns

### 1. Server Logic: Service Layer Pattern
To ensure DRY (Don't Repeat Yourself) code and separation of concerns, we follow a strict 3-layer architecture for server-side logic:

**`Server Action` -> `Service` -> `Prisma`**

- **Server Actions (`features/*/actions.ts`)**:
  - Handle request parsing (FormData).
  - Perform input validation using Zod schemas (`lib/validations/*`).
  - Check authentication/authorization.
  - Call the appropriate Service method.
  - Handle revalidation (`revalidatePath`) and redirects.
  - **Do NOT** contain complex business logic or direct database queries (except for simple lookups).

- **Services (`lib/services/*.ts`)**:
  - Contain pure business logic.
  - Accept typed arguments (not FormData).
  - Perform database operations via Prisma.
  - Handle transactions (`prisma.$transaction`).
  - **Must** accept an optional `tx` (TransactionClient) parameter for methods that might be part of a larger transaction.

- **Prisma (`lib/prisma.ts`)**:
  - Direct database access.

### 2. UI Components: Shared Patterns
We prioritize reusability to maintain consistency and reduce maintenance.

- **Modals**: Use `FormDialog` (`components/shared/dialog/form-dialog.tsx`) for all create/edit modals.
- **Forms**: Use `LineItemsForm` (`components/shared/form/line-items-form.tsx`) for any form requiring a list of products (Sales Orders, Purchase Orders, Transfers).
- **Validation**: All forms must use Zod schemas defined in `lib/validations/*`.

### 3. Inventory Architecture
The inventory system is **Movement-Based** (Double-Entry Ledger style).
- **`InventoryItem`**: Represents the *current* state (snapshot) of stock in a warehouse.
- **`InventoryMovement`**: An append-only log of *every* change to stock.
- **Rule**: Never modify `quantityOnHand` directly without creating a corresponding `InventoryMovement`.
- **Service**: All inventory changes must go through `inventoryService.createInventoryMovement`.

## Directory Structure
```
/app                    # Next.js App Router pages
/components
  /domain               # Feature-specific components (e.g., sales-orders, inventory)
  /shared               # Reusable components (dialogs, forms, tables)
  /ui                   # Shadcn UI primitives
/features               # Server Actions grouped by feature
/lib
  /services             # Business logic services
  /validations          # Zod schemas
  /utils                # Helper functions
/prisma                 # Database schema
/types                  # TypeScript definitions
```
