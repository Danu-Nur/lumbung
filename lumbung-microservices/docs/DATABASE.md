# Database Documentation - Lumbung Microservices

## 1. Overview
- **Schema File**: `/backend/schema.prisma`
- **Database Engine**: PostgreSQL
- **ORM**: Prisma Client JS
- **Architecture**: Multi-tenant (Organization-based), Movement-oriented Inventory

---

## 2. Domain Models

### A. Core Auth & Organization
**Models**
- `Organization`
- `User`
- `Role`
- `Permission`
- `RolePermission`

**Important Relations**
- `Organization`: Root entity. Punya banyak `User`, `Warehouse`, `Product` (Multi-tenancy).
- `User`: Milik 1 `Organization` (kecuali SuperAdmin), punya 1 `Role`.
- `Role`: Custom RBAC (e.g. Admin, Staff) via `RolePermission`.

### B. Product Catalog
**Models**
- `Product`
- `Category`
- `ProductImage`
- `ProductPriceHistory`

**Important Relations**
- `Product`:
  - Belongs to `Organization`.
  - Linked to `Category` and `Supplier`.
  - Has many `ProductImage`.
  - `ProductPriceHistory`: Menyimpan riwayat perubahan harga (`SELLING` & `COST`).

### C. Inventory Domain (Movement-Based)
**Models**
- `Warehouse`
- `InventoryItem`
- `InventoryMovement`
- `StockAdjustment`
- `StockTransfer`
- `StockTransferItem`
- `StockOpname`
- `StockOpnameItem`

**Important Relations**
- `InventoryItem`: Aggregate/Cache table. `quantityOnHand` per `Product` per `Warehouse`.
- `InventoryMovement`: **Source of Truth**. Append-only log untuk setiap perubahan stok (IN/OUT/ADJUST).
- `StockTransfer`: Memindahkan stok dari `fromWarehouse` ke `toWarehouse`.
- `StockOpname`: Proses audit fisik. Mencatat `systemQty` vs `actualQty`.

### D. Sales Domain
**Models**
- `SalesOrder`
- `SalesOrderItem`
- `Customer`

**Important Relations**
- `SalesOrder`:
  - Link ke `Customer`.
  - fulfillment via `Warehouse`.
  - Status flow: `DRAFT` -> `CONFIRMED` -> `FULFILLED` -> `INVOICED`.
- `SalesOrderItem`:
  - Snapshots `unitPrice` saat order dibuat (tidak berubah meski master product price berubah).

### E. Purchase Domain
**Models**
- `PurchaseOrder`
- `PurchaseOrderItem`
- `PurchaseReceipt`
- `Supplier`

**Important Relations**
- `PurchaseOrder`:
  - Link ke `Supplier`.
  - Penerimaan barang via `Warehouse`.
- `PurchaseReceipt`: Mencatat penerimaan barang parsial/full dari PO.

### F. Billing & Subscription
**Models**
- `Subscription`
- `Plan`

**Important Relations**
- `Organization` has one `Subscription`.
- `Subscription` link to `Plan` (e.g. Free, Pro).
- Mengatur limitasi fitur/user berdasarkan `Plan.limits`.
