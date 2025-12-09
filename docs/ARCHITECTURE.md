# Architecture Documentation - Lumbung

## 1. Overview
Dokumen ini menjelaskan arsitektur aplikasi **Lumbung** (Warehouse & Inventory SaaS) secara mendetail, mencakup struktur file, komponen UI, logic (Service/Server Actions), dan pustaka pihak ketiga yang digunakan.

- **Framework**: Next.js 15 (App Router)
- **Database**: PostgreSQL via Prisma ORM
- **State Management**: Server Component State + URL Search Params
- **Auth**: NextAuth.js (v5)
- **Styling**: Tailwind CSS + Shadcn/UI
- **i18n**: `next-intl` (Modular Translations in `src/lang/`)

---

## 2. Route List (High-Level)

### Marketing Module
- `/[locale]` (Home/Landing)
- `/[locale]/pricing`
- `/[locale]/about`

### Auth Module
- `/[locale]/login`
- `/[locale]/register`

### Dashboard Module (Core)
- `/[locale]/dashboard`
- `/[locale]/inventory` (Includes: Stock, Warehouses, Suppliers)
- `/[locale]/sales-orders` (Includes: Orders, Customers)
- `/[locale]/purchase-orders`
- `/[locale]/settings`

---

## 3. Detailed Route Architecture (Full Stack)

### A. Marketing Module

#### `/[locale]` (Landing Page)
**Purpose**
- Halaman depan untuk pengunjung umum. Menampilkan fitur utama dan call-to-action.

**Physical File**
- `app/[locale]/(marketing)/page.tsx`

**Full Stack Tree**
```
[Route] / (LandingPage)
 ├── [Lang] Namespace: 'Landing', 'Common' (src/lang/{locale}/landing.json)
 ├── [Layout] MarketingLayout (app/[locale]/(marketing)/layout.tsx)
 │    ├── MarketingNavbar (components/marketing/navbar.tsx)
 │    │    └── Uses: lucide-react (Icons), next-intl (Link)
 │    └── MarketingFooter (components/marketing/footer.tsx)
 │
 ├── [Component] HeroSection (components/marketing/hero-section.tsx)
 │    └── Uses: framer-motion (Animation), shadcn/button
 │
 ├── [Component] BentoGrid (components/marketing/bento-grid.tsx)
 │    └── Uses: lucide-react
 │
 ├── [Component] PricingCard (internal)
 │    └── Uses: lucide-react (CheckCircle2)
 │
 └── [Component] ScrollAnimation (components/ui/scroll-animation.tsx)
      └── Uses: framer-motion (InView)
```

---

### B. Auth Module

#### `/[locale]/login`
**Purpose**
- Masuk ke aplikasi.

**Physical File**
- `app/[locale]/(auth)/login/page.tsx`

**Full Stack Tree**
```
[Route] /login (LoginPage)
 ├── [Lang] Namespace: 'Auth' (src/lang/{locale}/auth.json)
 ├── [Layout] AuthLayout (app/[locale]/(auth)/layout.tsx)
 │    └── Background Elements
 │
 ├── [Component] LoginForm (components/auth/login-form.tsx)
 │    ├── [Lib] useForm (react-hook-form)
 │    ├── [Lib] zodResolver (@hookform/resolvers/zod)
 │    ├── [Validation] loginSchema (lib/validations/auth.ts)
 │    │    └── Uses: zod (Schema Definition)
 │    │
 │    ├── [Action] login (lib/actions/auth.ts)
 │    │    └── [Auth] signIn (next-auth/react)
 │    │
 │    └── [UI] Form, Input, Button (shadcn/ui)
```

---

### C. Dashboard Module (Main App)

#### `/[locale]/dashboard`
**Purpose**
- Ringkasan metrik (Stok rendah, Penjualan, Valuasi).

**Physical File**
- `app/[locale]/(dashboard)/dashboard/page.tsx`

**Full Stack Tree**
```
[Route] /dashboard (DashboardPage)
 ├── [Lang] Namespace: 'Dashboard', 'Common' (src/lang/{locale}/dashboard.json)
 ├── [Layout] DashboardLayout (app/[locale]/(dashboard)/layout.tsx)
 │    ├── Sidebar (components/layout/sidebar.tsx)
 │    │    ├── Uses: lucide-react, clsx
 │    │    └── [Lang] Namespace: 'Sidebar' (src/lang/{locale}/sidebar.json)
 │    └── Topbar (components/layout/topbar.tsx)
 │         └── UserNav (components/layout/user-nav.tsx)
 │              └── Uses: next-auth (Session)
 │
 ├── [Service] dashboardService.getStats() (lib/services/dashboardService.ts)
 │    ├── [DB] prisma.product.count()
 │    ├── [DB] prisma.salesOrder.aggregate()
 │    └── [DB] prisma.inventoryItem.findMany(lowStock)
 │
 ├── [UI] FinancialStatsRow (components/domain/dashboard/financial-stats-row.tsx)
 │    ├── SalesOverviewCard (components/domain/dashboard/SalesOverviewCard.tsx)
 │    │    └── Uses: lucide-react (DollarSign)
 │    └── WarehouseOverviewCard
 │
 ├── [UI] OperationalStatsRow (components/domain/dashboard/operational-stats-row.tsx)
 │    ├── LowStockItemsCard
 │    │    └── Uses: shadcn/badge
 │    └── TransferOverviewCard
 │
 └── [UI] DashboardChartsSection (components/domain/dashboard/dashboard-charts-section.tsx)
      ├── SalesChart (components/domain/dashboard/SalesChart.tsx)
      │    └── Uses: recharts (BarChart, ResponsiveContainer)
      └── StockDistributionChart
           └── Uses: recharts (PieChart)
```

---

#### `/[locale]/inventory`
**Purpose**
- Manajemen Stok, Gudang, dan Supplier.
- Menggunakan `view` search param untuk switching tab.

**Physical File**
- `app/[locale]/(dashboard)/inventory/page.tsx`

**Full Stack Tree**
```
[Route] /inventory (InventoryPage)
 ├── [Lang] Namespace: 'Inventory', 'Common' (src/lang/{locale}/inventory.json)
 ├── [Logic] Page Load Data
 │    ├── [Service] inventoryService.getInventory() (lib/services/inventoryService.ts)
 │    │    └── [DB] prisma.product.findMany(include: inventoryItems)
 │    ├── [DB] prisma.category.findMany()
 │    └── [DB] prisma.warehouse.findMany()
 │
 ├── [UI] InventoryHeader (components/domain/inventory/inventory-header.tsx)
 │    └── Uses: lucide-react (Package, Warehouse, Building2)
 │
 ├── [View: Stock] InventoryListSection (components/domain/inventory/sections/inventory-list-section.tsx)
 │    ├── [UI] InventoryModalManager
 │    │    ├── InventoryCreateModal
 │    │    │    ├── [Action] createProduct (features/inventory/actions.ts)
 │    │    │    │    ├── [Validation] productSchema (zod)
 │    │    │    │    └── [DB] prisma.product.create()
 │    │    │    └── Uses: react-hook-form
 │    │    └── InventoryEditModal, InventoryShowModal
 │    │
 │    ├── [UI] ImportModal (components/shared/import-modal.tsx)
 │    │    └── [Action] importStockBatch (features/inventory/import-actions.ts)
 │    │
 │    └── [UI] InventoryTable (components/domain/inventory/tables/inventory-table.tsx)
 │         ├── [UI] DataTable (components/shared/data-table/data-table.tsx)
 │         │    └── Uses: @tanstack/react-table
 │         └── [UI] InventoryActions
 │              └── Uses: shadcn/dropdown-menu
 │
 ├── [View: Warehouses] WarehouseListSection
 │    ├── [Lang] Namespace: 'Warehouses' (src/lang/{locale}/warehouses.json)
 │    ├── [Action] createWarehouse (features/warehouses/actions.ts)
 │    └── [UI] WarehouseTable
 │
 └── [View: Suppliers] SupplierListSection
      ├── [Lang] Namespace: 'Suppliers' (src/lang/{locale}/suppliers.json)
      ├── [Action] createSupplier (features/suppliers/actions.ts)
      └── [UI] SupplierTable
```

---

#### `/[locale]/sales-orders`
**Purpose**
- Manajemen Penjualan (Orders & Customers).

**Physical File**
- `app/[locale]/(dashboard)/sales-orders/page.tsx`

**Full Stack Tree**
```
[Route] /sales-orders (SalesOrdersPage)
 ├── [Lang] Namespace: 'Sales', 'Common' (src/lang/{locale}/sales.json)
 ├── [Logic] Page Load Data
 │    ├── [DB] prisma.salesOrder.findMany()
 │    ├── [DB] prisma.customer.findMany()
 │    └── [DB] prisma.product.findMany() (for Create selection)
 │
 ├── [UI] SalesHeader (components/domain/sales-orders/sales-header.tsx)
 │
 ├── [View: Orders] SalesOrderListSection (components/domain/sales-orders/sections/sales-order-list-section.tsx)
 │    ├── [UI] SalesOrderModalManager
 │    │    ├── SalesOrderCreateModal
 │    │    │    ├── [UI] SalesOrderForm
 │    │    │    │    ├── [Action] createSalesOrder (features/sales-orders/actions.ts)
 │    │    │    │    │    ├── [Validation] salesOrderSchema (zod)
 │    │    │    │    │    └── [DB] prisma.salesOrder.create()
 │    │    │    │    └── Uses: useFieldArray (react-hook-form - dynamic items)
 │    │    │    └── Uses: shadcn/command (Product Search)
 │    │    ├── SalesOrderEditModal
 │    │    └── SalesOrderShowModal
 │    │
 │    └── [UI] SalesOrderTable (Inline Table in Section)
 │         ├── [UI] Badge (Status Color Logic)
 │         └── [UI] SalesOrderActions (components/domain/sales-orders/sales-order-actions.tsx)
 │              └── [Action] cancelSalesOrder (features/sales-orders/actions.ts)
 │
 └── [View: Customers] CustomerListSection
      ├── [Lang] Namespace: 'Customers' (src/lang/{locale}/customers.json)
      ├── [DB] prisma.customer.findMany()
      ├── [UI] CustomerModalManager
      │    └── [Action] createCustomer (features/customers/actions.ts)
      └── [UI] CustomerTable
```

---

#### `/[locale]/settings`
**Purpose**
- Konfigurasi Organisasi dan User Management.

**Physical File**
- `app/[locale]/(dashboard)/settings/page.tsx`

**Full Stack Tree**
```
[Route] /settings (SettingsPage)
 ├── [Lang] Namespace: 'Settings', 'Common' (src/lang/{locale}/settings.json)
 ├── [Logic] Page Load Data
 │    ├── [DB] prisma.organization.findUnique()
 │    └── [DB] prisma.user.findMany(include: role)
 │
 ├── [UI] OrganizationForm (components/domain/settings/organization-form.tsx)
 │    ├── [Action] updateOrganization (features/settings/actions.ts)
 │    ├── [Lib] useForm, zodResolver
 │    └── [UI] Card, Input, Button
 │
 ├── [UI] UsersTable (components/domain/settings/users-table.tsx)
 │    └── [UI] DataTable
 │         └── [Action] deleteUser (features/users/actions.ts - implied)
 │
 └── [UI] UserModalManager (components/domain/settings/user-modal-manager.tsx)
      ├── UserCreateModal
      │    ├── [Action] createUser (features/users/actions.ts)
      │    └── [Role] RBAC Check (lib/rbac.ts)
      └── UserEditModal
```

---

## 4. Key Libraries Summary

| Category | Libraries / Files |
| :--- | :--- |
| **Logic & Data** | `prisma` (ORM), `next-intl` (i18n), `zod` (Validation) |
| **Forms** | `react-hook-form`, `@hookform/resolvers` |
| **UI Components** | `shadcn/ui` (Radix Primitives), `lucide-react` (Icons) |
| **Visualization** | `recharts` (Charts), `framer-motion` (Animations) |
| **Tables** | `@tanstack/react-table` |
| **Auth** | `next-auth` (Auth.js) |
| **Date Time** | `date-fns` |
