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

### C. Inventory Domain (Batch-Centric)
**Models**
- `Warehouse`: Physical storage location.
- `InventoryItem`: **Batch record**. Representasi stok per batch per `Product` per `Warehouse`.
  - Fields: `quantityOnHand`, `unitCost`, `batchNumber`, `receivedDate`, `supplierId`.
- `InventoryMovement`: **Source of Truth**. Append-only log untuk setiap perubahan stok (IN/OUT/ADJUST).
  - Link langsung ke `InventoryItem` (Batch) untuk tracking HPP/COGS yang akurat.
- `StockAdjustment`: Penyesuaian stok manual terhadap batch tertentu.
- `StockTransfer`: Memindahkan stok (batch) dari `fromWarehouse` ke `toWarehouse`.
- `StockOpname`: Proses audit fisik per batch.

**Important Relations**
- `InventoryItem`: Kini bukan sekadar summary, tapi record batch individual.
- `InventoryMovement`: Mencatat histori pergerakan stok dengan referensi ke batch asal (`inventoryItemId`).
- `StockTransfer`: Mendukung pemindahan stok antar gudang dengan tetap mempertahankan data batch asli.

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

### D. Inventory Examples (Batch-Aware)
Script seed kini menciptakan **10 produk stok** dengan skenario batch yang realistis:

1.  **Pelacakan Multi-Batch**: Satu produk (seperti *Busi NGK* atau *Oli Yamalube*) memiliki beberapa batch masukan dengan `unitCost` yang berbeda, mensimulasikan fluktuasi harga pasar.
2.  **Detail Batch**: Setiap batch mencatat `batchNumber` (e.g., `LOT-2024-xxx`), `receivedDate` (tanggal masuk), dan `supplierId` asal.
3.  **Distribusi Gudang**: Stok tersebar di `WH-MAIN` dan `WH-BRANCH` untuk menguji fitur transfer stok.
4.  **Histori Lengkap**: Selain stok akhir, script juga men-generate riwayat `InventoryMovement` (IN dari PO, OUT dari Sales Order, Adjustment) sehingga dashboard analytics memiliki data historis yang valid.

*Note: Initial stock quantities are randomized (10-100 units) across multiple batches to support FIFO logic testing.*
