# Database Documentation - Lumbung Microservices

## 1. Overview
- **Schema File**: `prisma/schema.prisma`
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

---

## 3. Seed Data (Dummy Data)

The database is pre-populated with the following dummy data for development and testing purposes (`npx prisma db seed`).

### A. Credentials (Users)
| Role  | Name | Email | Password | Organization |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** | Budi Santoso | `admin@majumotor.com` | `admin123` | Bengkel Maju Motor |
| **Admin** | Siti Aminah | `admin@otojaya.com` | `admin123` | CV Otomotif Jaya |

### B. Organizations
1.  **Bengkel Maju Motor** (Slug: `maju-motor`) - _Core testing org_
    -   Plan: **Free** (Limits: 2 users, 1 Warehouse)
2.  **CV Otomotif Jaya** (Slug: `otomotif-jaya`)
    -   Plan: **Pro** (Limits: 10 users, 5 Warehouses)

### C. Master Data
-   **Warehouses**:
    -   `WH-MAIN`: Gudang Utama (Maju Motor)
    -   `WH-BRANCH`: Gudang Cabang (Maju Motor)
    -   `WH-SHOW`: Showroom (Otomotif Jaya)
-   **Suppliers**:
    -   PT Astra Otoparts
    -   CV Sumber Makmur
-   **Categories**: 9 Automotive categories (e.g., *Mesin*, *Oli*, *Ban*, *Kelistrikan*).

### D. Inventory Examples
The seed script creates **10 stock products** with random initial details:

1.  **Busi NGK CPR8EA-9** (Kelistrikan) - Supplier: Astra
2.  **Oli Yamalube Sport 1L** (Oli) - Supplier: Astra
3.  **Kampas Rem Depan Mio** (Rem) - Supplier: Sumber Makmur
4.  **Aki GS Astra GTZ5S** (Kelistrikan) - Supplier: Astra
5.  **Ban IRC 80/90-14** (Ban) - Supplier: *None*
6.  **Shockbreaker Vario** (Suspensi) - Supplier: Sumber Makmur
7.  **Filter Udara Beat** (Mesin) - Supplier: *None*
8.  **Lampu Depan LED H4** (Kelistrikan) - Supplier: Sumber Makmur
9.  **Spion Tomok CNC** (Aksesoris) - Supplier: *None*
10. **Rantai Keteng Satria** (Mesin) - Supplier: Astra

*Note: Initial stock quantities are randomized (10-60 units) in `WH-MAIN`.*
