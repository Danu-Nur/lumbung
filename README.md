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