# Lumbung (Inventory Pro)

Aplikasi manajemen gudang dan inventaris modern yang dirancang untuk efisiensi operasional bisnis dengan dukungan multi-gudang dan pelacakan stok real-time.

## Fitur Utama

Berikut adalah fitur-fitur unggulan yang tersedia dalam aplikasi:

*   **Manajemen Inventaris (Inventory)**: Pelacakan stok real-time dengan arsitektur *movement-based*. Mendukung *low stock alerts* dan riwayat harga.
*   **Manajemen Gudang (Warehouses)**: Dukungan *multi-warehouse* untuk mengelola stok di berbagai lokasi fisik.
*   **Transfer Stok (Stock Transfers)**: Fitur untuk memindahkan stok antar gudang dengan status pelacakan (Draft, In Transit, Completed).
*   **Penyesuaian Stok (Stock Adjustments)**: Koreksi stok manual untuk audit, barang rusak, atau selisih stok (Opname).
*   **Penjualan (Sales Orders)**: Manajemen pesanan penjualan, faktur, dan pemenuhan barang dari gudang tertentu.
*   **Pembelian (Purchase Orders)**: Manajemen pesanan pembelian ke pemasok dan penerimaan barang masuk.
*   **Manajemen Kontak**: Database terpusat untuk Pelanggan (Customers) dan Pemasok (Suppliers).
*   **Dashboard Analitik**: Ringkasan visual performa bisnis, nilai stok, dan aktivitas terbaru.
*   **Multi-Bahasa (i18n)**: Dukungan penuh Bahasa Indonesia dan Inggris.
*   **Role-Based Access Control**: Sistem hak akses pengguna (SuperAdmin, Admin, Manager, Staff, Viewer).

## Tech Stack

Aplikasi ini dibangun menggunakan teknologi modern untuk performa dan skalabilitas:

*   **Frontend**: [Next.js 16](https://nextjs.org/) (App Router), React 19
*   **Styling**: [Tailwind CSS v4](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/)
*   **Backend**: Next.js Server Components & Server Actions
*   **Database**: PostgreSQL dengan [Prisma ORM](https://www.prisma.io/)
*   **Authentication**: [NextAuth.js v5](https://authjs.dev/) (Credentials Provider)
*   **Internationalization**: [next-intl](https://next-intl-docs.vercel.app/)
*   **Queue & Caching**: [BullMQ](https://docs.bullmq.io/) & [Redis](https://redis.io/) (via `ioredis`)
*   **Validation**: Zod & React Hook Form

## Arsitektur Aplikasi

Aplikasi ini menggunakan arsitektur **Next.js App Router** yang mengutamakan performa dan keamanan:

1.  **Server Components**: Sebagian besar halaman dirender di server untuk kecepatan awal dan SEO yang optimal.
2.  **Server Actions**: Mutasi data (Create, Update, Delete) ditangani langsung oleh Server Actions, menghilangkan kebutuhan akan API layer terpisah untuk operasi internal.
3.  **Service Layer**: Logika bisnis dipisahkan ke dalam *services* (misalnya `inventoryService`) yang dipanggil oleh Server Components atau Server Actions.
4.  **Database Layer**: Prisma ORM menangani interaksi database dengan *type-safety* penuh.
5.  **Background Jobs**: Tugas berat ditangani secara asinkron menggunakan BullMQ dan Redis (opsional, dapat dikonfigurasi).

### Alur Data Inventory
Perubahan stok menggunakan pendekatan *double-entry bookkeeping* (Inventory Movements). Stok saat ini (`InventoryItem`) adalah hasil kalkulasi atau snapshot dari semua pergerakan (`InventoryMovement`), memastikan akurasi data historis.

## Struktur Project

```bash
lumbung
├─ app
│  ├─ [locale]              # Route utama dengan i18n
│  │  ├─ (auth)             # Login & Register
│  │  ├─ (dashboard)        # Modul aplikasi (Inventory, Sales, dll)
│  │  ├─ (marketing)        # Modul aplikasi (Landing, Pricing, dll)
│  │  └─ api                # Public API endpoints
│  └─ api                   # Global API (Auth)
├─ components
│  ├─ ui                    # Komponen shadcn/ui reusable
│  ├─ domain                # Komponen spesifik fitur
│  └─ shared                # Komponen umum (Layout, Search, dll)
├─ lib
│  ├─ services              # Logika bisnis (InventoryService, etc)
│  ├─ performance           # Driver Redis & Queue
│  └─ prisma.ts             # DB Connection
├─ prisma                   # Schema & Migrations
├─ messages                 # File translasi (en.json, id.json)
└─ public                   # Aset statis
```

## Skema Database

Database dirancang untuk skalabilitas multi-organisasi. Berikut adalah entitas utamanya:

*   **Organization**: Entitas induk untuk multi-tenancy.
*   **User & Role**: Manajemen pengguna dan hak akses (RBAC).
*   **Product**: Katalog produk master dengan atribut harga dan kategori.
*   **Warehouse**: Lokasi fisik penyimpanan barang.
*   **InventoryItem**: Stok saat ini per produk per gudang.
*   **InventoryMovement**: Log pergerakan stok (Masuk, Keluar, Transfer, Adjustment).
*   **SalesOrder & PurchaseOrder**: Transaksi bisnis yang memicu pergerakan stok.
*   **StockTransfer**: Dokumen perpindahan antar gudang.

## Routes & URL Endpoints

### Halaman Aplikasi (UI)

Semua route di bawah ini mendukung prefix bahasa (misal: `/id/dashboard` atau `/en/dashboard`).

| URL Path | Deskripsi | Akses |
| :--- | :--- | :--- |
| `/login` | Halaman Masuk | Public |
| `/register` | Halaman Pendaftaran | Public |
| `/dashboard` | Ringkasan performa & aktivitas | Login Required |
| `/inventory` | Daftar & manajemen stok produk | Login Required |
| `/warehouses` | Manajemen lokasi gudang | Login Required |
| `/sales-orders` | Daftar pesanan penjualan | Login Required |
| `/purchase-orders` | Daftar pesanan pembelian | Login Required |
| `/transfers` | Transfer stok antar gudang | Login Required |
| `/adjustments` | Penyesuaian stok manual | Login Required |
| `/customers` | Database pelanggan | Login Required |
| `/suppliers` | Database pemasok | Login Required |
| `/settings` | Pengaturan organisasi & user | Login Required |

### API Endpoints

| Method | URL Path | Deskripsi |
| :--- | :--- | :--- |
| POST | `/api/auth/callback/credentials` | Login (NextAuth) |
| POST | `/api/auth/signout` | Logout |
| GET | `/api/auth/session` | Cek sesi aktif |

*Catatan: Sebagian besar interaksi data menggunakan **Server Actions**, sehingga tidak terekspos sebagai public API endpoints.*

## Konfigurasi & Environment Variables

Salin file `.env.example` ke `.env` dan sesuaikan konfigurasi berikut:

*   `DATABASE_URL`: Connection string PostgreSQL.
*   `AUTH_SECRET`: Secret key untuk enkripsi sesi NextAuth.
*   `NEXTAUTH_URL`: URL aplikasi (misal: `http://localhost:3001`).
*   `REDIS_URL`: URL koneksi Redis (opsional, untuk queue/cache).

## Getting Started

Ikuti langkah ini untuk menjalankan proyek di lokal:

**Prasyarat**:
*   Node.js (v20+)
*   npm (atau pnpm/yarn)
*   PostgreSQL Database
*   Redis (Opsional)

**Langkah Instalasi**:

1.  **Clone repository**
    ```bash
    git clone https://github.com/username/lumbung.git
    cd lumbung
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Setup Environment**
    Buat file `.env` dan isi variabel yang diperlukan (lihat bagian Konfigurasi).

4.  **Setup Database**
    Jalankan migrasi untuk membuat tabel:
    ```bash
    npx prisma migrate dev
    ```
    *(Opsional) Seed database dengan data awal:*
    ```bash
    npm run prisma:seed
    ```

5.  **Jalankan Aplikasi**
    ```bash
    npm run dev
    ```
    Akses aplikasi di `http://localhost:3001`.

## Auth & Keamanan

*   **Autentikasi**: Menggunakan NextAuth.js dengan strategi Credentials (Email/Password).
*   **Password**: Dihashing menggunakan `bcryptjs`.
*   **Proteksi Route**: Middleware memastikan hanya user yang login yang bisa mengakses halaman dashboard.
*   **Role-Based**: User memiliki role (SuperAdmin, Admin, dll) yang menentukan hak akses fitur (diimplementasikan via `RolePermission`).

## Internationalization (i18n)
****
Aplikasi mendukung multi-bahasa menggunakan `next-intl`.
*   File translasi ada di folder `/messages` (`id.json`, `en.json`).
*   Bahasa default adalah **Indonesia (id)**.
*   Ganti bahasa secara otomatis berdasarkan preferensi browser atau via URL prefix.

## Lisensi

[MIT License](LICENSE)****




```
lumbung
├─ app
│  ├─ api
│  │  └─ auth
│  │     ├─ register
│  │     │  └─ route.ts
│  │     └─ [...nextauth]
│  │        └─ route.ts
│  ├─ favicon.ico
│  ├─ globals.css
│  └─ [locale]
│     ├─ (auth)
│     │  ├─ layout.tsx
│     │  ├─ login
│     │  │  ├─ login-form.tsx
│     │  │  └─ page.tsx
│     │  ├─ register
│     │  │  ├─ page.tsx
│     │  │  └─ register-form.tsx
│     │  └─ template.tsx
│     ├─ (dashboard)
│     │  ├─ customers
│     │  │  └─ page.tsx
│     │  ├─ dashboard
│     │  │  └─ page.tsx
│     │  ├─ help
│     │  │  └─ page.tsx
│     │  ├─ inventory
│     │  │  └─ page.tsx
│     │  ├─ layout.tsx
│     │  ├─ purchase-orders
│     │  │  ├─ new
│     │  │  │  ├─ new-purchase-order-form.tsx
│     │  │  │  └─ page.tsx
│     │  │  ├─ page.tsx
│     │  │  └─ [id]
│     │  │     └─ page.tsx
│     │  ├─ sales-orders
│     │  │  ├─ new
│     │  │  │  ├─ new-sales-order-form.tsx
│     │  │  │  └─ page.tsx
│     │  │  ├─ page.tsx
│     │  │  └─ [id]
│     │  │     ├─ invoice
│     │  │     │  ├─ invoice-content.tsx
│     │  │     │  └─ page.tsx
│     │  │     └─ page.tsx
│     │  ├─ settings
│     │  │  ├─ billing
│     │  │  │  └─ page.tsx
│     │  │  └─ page.tsx
│     │  ├─ suppliers
│     │  │  └─ page.tsx
│     │  └─ template.tsx
│     ├─ (marketing)
│     │  ├─ about
│     │  │  └─ page.tsx
│     │  ├─ layout.tsx
│     │  ├─ page.tsx
│     │  └─ pricing
│     │     └─ page.tsx
│     ├─ layout.tsx
│     ├─ superadmin
│     │  ├─ layout.tsx
│     │  ├─ organizations
│     │  │  ├─ page.tsx
│     │  │  └─ [id]
│     │  │     └─ page.tsx
│     │  ├─ page.tsx
│     │  └─ users
│     │     └─ page.tsx
│     └─ test-import
│        └─ page.tsx
├─ auth-debug.log
├─ components
│  ├─ common
│  │  └─ CrudModal.tsx
│  ├─ domain
│  │  ├─ adjustments
│  │  │  ├─ adjustment-actions.tsx
│  │  │  ├─ adjustment-create-modal.tsx
│  │  │  ├─ adjustment-edit-modal.tsx
│  │  │  ├─ adjustment-modal-manager.tsx
│  │  │  ├─ adjustment-row-modal.tsx
│  │  │  └─ adjustment-show-modal.tsx
│  │  ├─ categories
│  │  │  ├─ category-actions.tsx
│  │  │  ├─ category-create-modal.tsx
│  │  │  ├─ category-edit-modal.tsx
│  │  │  ├─ category-modal-manager.tsx
│  │  │  ├─ category-show-modal.tsx
│  │  │  ├─ sections
│  │  │  │  └─ categories-list-section.tsx
│  │  │  └─ tables
│  │  │     └─ categories-table.tsx
│  │  ├─ customers
│  │  │  ├─ customer-actions.tsx
│  │  │  ├─ customer-create-modal.tsx
│  │  │  ├─ customer-edit-modal.tsx
│  │  │  ├─ customer-modal-manager.tsx
│  │  │  ├─ customer-show-modal.tsx
│  │  │  └─ sections
│  │  │     └─ customer-list-section.tsx
│  │  ├─ dashboard
│  │  │  ├─ AdjustmentOverviewCard.tsx
│  │  │  ├─ CustomersOverviewCard.tsx
│  │  │  ├─ dashboard-activity-section.tsx
│  │  │  ├─ dashboard-charts-section.tsx
│  │  │  ├─ financial-stats-row.tsx
│  │  │  ├─ LowStockItemsCard.tsx
│  │  │  ├─ operational-stats-row.tsx
│  │  │  ├─ PurchaseOverviewCard.tsx
│  │  │  ├─ RecentInventoryChangesCard.tsx
│  │  │  ├─ SalesChart.tsx
│  │  │  ├─ SalesOverviewCard.tsx
│  │  │  ├─ SettingsQuickLinksCard.tsx
│  │  │  ├─ StockDistributionChart.tsx
│  │  │  ├─ SuppliersOverviewCard.tsx
│  │  │  ├─ TransferOverviewCard.tsx
│  │  │  └─ WarehouseOverviewCard.tsx
│  │  ├─ inventory
│  │  │  ├─ category-selector.tsx
│  │  │  ├─ delete-product-button.tsx
│  │  │  ├─ inventory-actions.tsx
│  │  │  ├─ inventory-content-wrapper.tsx
│  │  │  ├─ inventory-create-modal.tsx
│  │  │  ├─ inventory-dialog.tsx
│  │  │  ├─ inventory-edit-modal.tsx
│  │  │  ├─ inventory-header.tsx
│  │  │  ├─ inventory-modal-manager.tsx
│  │  │  ├─ inventory-show-modal.tsx
│  │  │  ├─ inventory-stock-modal.tsx
│  │  │  ├─ modals
│  │  │  │  └─ create-opname-dialog.tsx
│  │  │  ├─ sections
│  │  │  │  ├─ inventory-adjustment-section.tsx
│  │  │  │  ├─ inventory-list-section.tsx
│  │  │  │  ├─ inventory-opname-section.tsx
│  │  │  │  └─ inventory-transfer-section.tsx
│  │  │  └─ tables
│  │  │     ├─ adjustment-table.tsx
│  │  │     ├─ inventory-table.tsx
│  │  │     ├─ opname-execution-table.tsx
│  │  │     ├─ opname-table.tsx
│  │  │     └─ transfer-table.tsx
│  │  ├─ purchase-orders
│  │  │  ├─ purchase-order-actions.tsx
│  │  │  ├─ purchase-order-create-modal.tsx
│  │  │  ├─ purchase-order-dialog.tsx
│  │  │  ├─ purchase-order-edit-modal.tsx
│  │  │  ├─ purchase-order-modal-manager.tsx
│  │  │  └─ purchase-order-show-modal.tsx
│  │  ├─ sales-orders
│  │  │  ├─ sales-header.tsx
│  │  │  ├─ sales-order-actions.tsx
│  │  │  ├─ sales-order-create-modal.tsx
│  │  │  ├─ sales-order-dialog.tsx
│  │  │  ├─ sales-order-edit-modal.tsx
│  │  │  ├─ sales-order-modal-manager.tsx
│  │  │  ├─ sales-order-show-modal.tsx
│  │  │  └─ sections
│  │  │     └─ sales-order-list-section.tsx
│  │  ├─ settings
│  │  │  ├─ organization-form.tsx
│  │  │  ├─ user-create-modal.tsx
│  │  │  ├─ user-edit-modal.tsx
│  │  │  ├─ user-modal-manager.tsx
│  │  │  ├─ user-show-modal.tsx
│  │  │  └─ users-table.tsx
│  │  ├─ suppliers
│  │  │  ├─ sections
│  │  │  │  └─ supplier-list-section.tsx
│  │  │  ├─ supplier-actions.tsx
│  │  │  ├─ supplier-create-modal.tsx
│  │  │  ├─ supplier-edit-modal.tsx
│  │  │  ├─ supplier-modal-manager.tsx
│  │  │  └─ supplier-show-modal.tsx
│  │  ├─ transfers
│  │  │  ├─ transfer-actions.tsx
│  │  │  ├─ transfer-create-modal.tsx
│  │  │  ├─ transfer-edit-modal.tsx
│  │  │  ├─ transfer-modal-manager.tsx
│  │  │  └─ transfer-show-modal.tsx
│  │  └─ warehouses
│  │     ├─ sections
│  │     │  └─ warehouse-list-section.tsx
│  │     ├─ tables
│  │     │  └─ warehouse-table.tsx
│  │     ├─ warehouse-actions.tsx
│  │     ├─ warehouse-create-modal.tsx
│  │     ├─ warehouse-edit-modal.tsx
│  │     ├─ warehouse-import-button.tsx
│  │     ├─ warehouse-modal-manager.tsx
│  │     └─ warehouse-show-modal.tsx
│  ├─ layout
│  │  ├─ ambient-background.tsx
│  │  ├─ sidebar.tsx
│  │  ├─ theme-toggle.tsx
│  │  └─ topbar.tsx
│  ├─ marketing
│  │  ├─ bento-grid.tsx
│  │  └─ hero-section.tsx
│  ├─ shared
│  │  ├─ action-column.tsx
│  │  ├─ data-table
│  │  │  ├─ data-table-column-header.tsx
│  │  │  ├─ data-table-toolbar.tsx
│  │  │  └─ data-table.tsx
│  │  ├─ delete-confirmation-modal.tsx
│  │  ├─ dialog
│  │  │  └─ form-dialog.tsx
│  │  ├─ dialog-form.tsx
│  │  ├─ form
│  │  │  └─ line-items-form.tsx
│  │  ├─ help-sheet.tsx
│  │  ├─ import-modal.tsx
│  │  ├─ language-switcher.tsx
│  │  ├─ page-header.tsx
│  │  ├─ page-help.tsx
│  │  ├─ page-transition.tsx
│  │  ├─ pagination.tsx
│  │  ├─ search-input.tsx
│  │  └─ stats-card.tsx
│  └─ ui
│     ├─ accordion.tsx
│     ├─ alert-dialog.tsx
│     ├─ alert.tsx
│     ├─ avatar.tsx
│     ├─ badge.tsx
│     ├─ button.tsx
│     ├─ card.tsx
│     ├─ checkbox.tsx
│     ├─ dialog.tsx
│     ├─ dropdown-menu.tsx
│     ├─ form.tsx
│     ├─ input.tsx
│     ├─ label.tsx
│     ├─ progress.tsx
│     ├─ scroll-animation.tsx
│     ├─ scroll-area.tsx
│     ├─ select.tsx
│     ├─ separator.tsx
│     ├─ sheet.tsx
│     ├─ sonner.tsx
│     ├─ switch.tsx
│     ├─ table.tsx
│     ├─ tabs.tsx
│     ├─ textarea.tsx
│     └─ tooltip.tsx
├─ components.json
├─ docs
│  ├─ ARCHITECTURE.md
│  └─ TEST_SCENARIOS.md
├─ emails
├─ eslint.config.mjs
├─ features
│  ├─ adjustments
│  │  ├─ actions.ts
│  │  └─ import-actions.ts
│  ├─ auth
│  ├─ categories
│  │  ├─ actions.ts
│  │  └─ import-actions.ts
│  ├─ customers
│  │  └─ actions.ts
│  ├─ dashboard
│  ├─ inventory
│  │  ├─ actions.ts
│  │  ├─ components
│  │  └─ import-actions.ts
│  ├─ opnames
│  │  └─ import-actions.ts
│  ├─ purchase-orders
│  │  └─ actions.ts
│  ├─ sales-orders
│  │  └─ actions.ts
│  ├─ settings
│  │  └─ actions.ts
│  ├─ suppliers
│  │  └─ actions.ts
│  ├─ transfers
│  │  ├─ actions.ts
│  │  └─ import-actions.ts
│  ├─ users
│  └─ warehouses
│     ├─ actions.ts
│     └─ import-actions.ts
├─ generate_test_excel.js
├─ hooks
│  └─ use-media-query.ts
├─ i18n
│  ├─ request.ts
│  └─ routing.ts
├─ lib
│  ├─ actions
│  │  └─ opname.ts
│  ├─ auth.config.ts
│  ├─ auth.ts
│  ├─ email.ts
│  ├─ guards
│  │  └─ subscription.ts
│  ├─ performance
│  │  ├─ cache.ts
│  │  ├─ drivers
│  │  │  ├─ memory.ts
│  │  │  └─ redis.ts
│  │  ├─ queue.ts
│  │  └─ types.ts
│  ├─ prisma.ts
│  ├─ rbac.ts
│  ├─ services
│  │  ├─ categoryService.ts
│  │  ├─ customerService.ts
│  │  ├─ dashboardService.ts
│  │  ├─ inventoryService.ts
│  │  ├─ notificationService.ts
│  │  ├─ pricingService.ts
│  │  ├─ productService.ts
│  │  ├─ purchaseOrderService.ts
│  │  ├─ salesOrderService.ts
│  │  ├─ subscriptionService.ts
│  │  ├─ supplierService.ts
│  │  └─ transferService.ts
│  ├─ utils.ts
│  ├─ validations
│  │  ├─ adjustment.ts
│  │  ├─ purchase-order.ts
│  │  ├─ sales-order.ts
│  │  └─ transfer.ts
│  └─ workers
│     └─ emailWorker.ts
├─ messages_backup
│  ├─ en.json
│  └─ id.json
├─ next.config.ts
├─ package-lock.json
├─ package.json
├─ postcss.config.mjs
├─ prisma
│  ├─ migrations
│  │  ├─ 20251129050733_init
│  │  │  └─ migration.sql
│  │  ├─ 20251201031558_init_inventory_price_history
│  │  │  └─ migration.sql
│  │  ├─ 20251201033403_init_inventory_price_history_and_supplier_link
│  │  │  └─ migration.sql
│  │  ├─ 20251201065449_make_customer_optional
│  │  │  └─ migration.sql
│  │  └─ migration_lock.toml
│  ├─ schema.prisma
│  └─ seed.ts
├─ prisma.config.ts
├─ proxy.ts
├─ proxy.ts.bak
├─ public
│  ├─ file.svg
│  ├─ globe.svg
│  ├─ next.svg
│  ├─ vercel.svg
│  └─ window.svg
├─ README.md
├─ scripts
│  ├─ check-roles.ts
│  ├─ check-users-debug.ts
│  ├─ check-users.ts
│  ├─ create-test-user.ts
│  ├─ create-user-test.ts
│  ├─ fix-seed-data.ts
│  ├─ test-smtp.ts
│  └─ verify-auth.ts
├─ smtp-debug.log
├─ src
│  └─ lang
│     ├─ en
│     │  ├─ auth.json
│     │  ├─ common.json
│     │  ├─ dashboard.json
│     │  ├─ inventory.json
│     │  ├─ marketing.json
│     │  ├─ partners.json
│     │  ├─ purchases.json
│     │  └─ sales.json
│     └─ id
│        ├─ auth.json
│        ├─ common.json
│        ├─ dashboard.json
│        ├─ inventory.json
│        ├─ marketing.json
│        ├─ partners.json
│        ├─ purchases.json
│        └─ sales.json
├─ tailwind.config.ts
├─ test_inventory_import.xlsx
├─ tsconfig.json
└─ types
   ├─ domain.ts
   ├─ next-auth.d.ts
   └─ serialized.ts

```