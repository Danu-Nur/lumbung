# Inventory Pro - Warehouse Inventory Management System

A production-ready, scalable, multi-warehouse inventory management system built with Next.js, TypeScript, Prisma, and PostgreSQL.

## 🚀 Features

### Core Functionality
- ✅ **Movement-Based Inventory Architecture** - All stock changes tracked through append-only audit log
- ✅ **Price Snapshots** - Historical orders preserve prices at time of creation
- ✅ **Multi-Warehouse Support** - Track inventory across multiple locations
- ✅ **Multi-Tenancy** - Organization-scoped data with complete isolation
- ✅ **Role-Based Access Control (RBAC)** - Granular permissions system
- ✅ **Multi-Admin Support** - Super Admin (cross-tenant) + Organization Admins

### Inventory Management
- Product catalog with SKU, barcode, categories
- Real-time stock tracking per warehouse
- Low stock alerts and thresholds
- Stock adjustments with reasons (damage, lost, audit, etc.)
- Stock transfers between warehouses
- Complete inventory movement history

### Order Management
- Sales orders with workflow (Draft → Confirmed → Fulfilled → Invoiced)
- Purchase orders with receiving workflow
- Customer and supplier management
- Invoice generation

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL (via Laragon, Docker-ready)
- **ORM**: Prisma 7
- **Authentication**: NextAuth.js v5
- **Styling**: Tailwind CSS with glassmorphism theme
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod
- **Email**: Nodemailer

## 📋 Prerequisites

- Node.js 18+ and npm
- PostgreSQL (via Laragon or Docker)
- Git

## 🚀 Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd lumbung
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy `.env.example` to `.env` and update the values:

```bash
# Database (PostgreSQL via Laragon - localhost:5432)
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/inventory_pro?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-change-this-in-production"

# Email (SMTP)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="noreply@inventorypro.com"
```

### 4. Set up the database

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Seed the database
npx prisma db seed
```

### 5. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔐 Default Login Credentials

After seeding, you can log in with:

**Super Admin (Cross-Tenant Access)**
- Email: `superadmin@inventorypro.com`
- Password: `admin123`

**Organization Admin (Demo Warehouse Co.)**
- Email: `admin@demowarehouse.com`
- Password: `admin123`

> ⚠️ **Important**: Change these passwords in production!

## 📁 Project Structure

```
inventory-pro/
├── app/                        # Next.js App Router
│   ├── (auth)/                # Auth pages (login, register)
│   ├── (dashboard)/           # Dashboard pages
│   ├── api/                   # API routes
│   └── globals.css            # Global styles
├── components/                # React components
│   ├── ui/                    # Base UI components
│   ├── layout/                # Layout components
│   └── shared/                # Shared business components
├── features/                  # Feature modules (domain logic)
│   ├── auth/                  # Authentication
│   ├── inventory/             # Inventory management
│   ├── warehouses/            # Warehouse management
│   ├── sales-orders/          # Sales orders
│   ├── purchase-orders/       # Purchase orders
│   └── ...
├── lib/                       # Core utilities
│   ├── prisma.ts             # Prisma client
│   ├── auth.ts               # NextAuth config
│   ├── rbac.ts               # RBAC utilities
│   └── utils.ts              # General utilities
├── prisma/                    # Database
│   ├── schema.prisma         # Database schema
│   ├── migrations/           # Migrations
│   └── seed.ts               # Seed data
└── types/                     # TypeScript types
```



## 🗄️ Database Schema

### Core Entities
- **Organization** - Multi-tenant organizations
- **User** - Users with role-based access
- **Role** - Roles (SuperAdmin, Admin, Manager, Staff, Viewer)
- **Permission** - Granular permissions
- **RolePermission** - Many-to-many relationship

### Product Catalog
- **Category** - Product categories
- **Product** - Products with SKU, barcode, current prices
- **ProductImage** - Product images

### Inventory (Movement-Based)
- **Warehouse** - Warehouses/locations
- **InventoryItem** - Current on-hand stock per product/warehouse
- **InventoryMovement** - Append-only audit log (IN/OUT/ADJUST/TRANSFER)
- **StockAdjustment** - Adjustment documents

### Orders (with Price Snapshots)
- **Customer** - Customer master data
- **SalesOrder** - Sales orders with workflow
- **SalesOrderItem** - Line items with price snapshot
- **Supplier** - Supplier master data
- **PurchaseOrder** - Purchase orders with workflow
- **PurchaseOrderItem** - Line items with cost snapshot
- **PurchaseReceipt** - Receiving records

### Transfers
- **StockTransfer** - Stock transfers between warehouses
- **StockTransferItem** - Transfer line items

## 🔐 RBAC System

### Roles

- **SuperAdmin**: Cross-tenant access, can manage all organizations
- **Admin**: Full access within their organization
- **Manager**: Read/update permissions for inventory and orders
- **Staff**: Create/read permissions for inventory operations
- **Viewer**: Read-only access

### Permission Structure

Permissions follow the pattern: `resource:action`

Examples:
- `inventory:create`
- `sales-orders:fulfill`
- `warehouses:update`
- `users:manage-roles`

## 🏗️ Architecture Principles

### Movement-Based Inventory

Stock is NEVER edited directly. All changes go through `InventoryMovement` records:

1. **IN**: Purchase receipts, transfers in
2. **OUT**: Sales fulfillment, transfers out
3. **ADJUST**: Manual adjustments

The `InventoryItem.quantityOnHand` field is maintained for fast queries but is always derivable from the movement history.

### Price Snapshots

All transactional documents (sales orders, purchase orders) store prices at the time of creation:

- `SalesOrderItem.unitPrice` - Price snapshot
- `PurchaseOrderItem.unitCost` - Cost snapshot

Changing product prices NEVER affects historical documents.

### Multi-Tenancy

- All entities (except SuperAdmin-only tables) are scoped by `organizationId`
- Middleware enforces tenant isolation
- Super Admin can access all organizations
- Organization Admins can only access their own organization

## 🐳 Docker Migration

The system is designed for easy migration to Docker. To switch from Laragon to Docker:

1. Update `DATABASE_URL` in `.env`:

```bash
# Change from:
DATABASE_URL="postgresql://postgres:password@localhost:5432/inventory_pro?schema=public"

# To:
DATABASE_URL="postgresql://postgres:password@postgres:5432/inventory_pro?schema=public"
```

2. No code changes required! Prisma handles the connection abstraction.

## 📧 Email Configuration

Configure SMTP settings in `.env` for:
- User invitations
- Password reset
- Low stock alerts

Supported providers:
- Gmail (with app password)
- SendGrid
- AWS SES
- Any SMTP server

## 🧪 Development

### Run migrations

```bash
npx prisma migrate dev
```

### Reset database

```bash
npx prisma migrate reset
```

### View database

```bash
npx prisma studio
```

### Generate Prisma Client

```bash
npx prisma generate
```

## 🚀 Production Deployment

### Build the application

```bash
npm run build
```

### Start production server

```bash
npm start
```

### Environment Variables

Ensure all environment variables are set in your production environment:
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_URL` - Your production URL
- `NEXTAUTH_SECRET` - Strong random secret
- SMTP credentials for email

## 🔧 Extensibility

### Adding New Permissions

1. Add permission to `prisma/seed.ts`
2. Run seed or manually insert into database
3. Assign to roles via `RolePermission`
4. Use in code: `hasPermission(user, 'new-permission')`

### Adding New Product Attributes

Products have a `customAttributes` JSON field for flexible attributes:

```typescript
{
  size: "XL",
  color: "Blue",
  brand: "Nike"
}
```

### Adding New Roles

1. Create role in database
2. Assign permissions via `RolePermission`
3. No code changes needed!

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support

For issues and questions:
- GitHub Issues: [Create an issue]
- Email: support@inventorypro.com

---

Built with ❤️ using Next.js, Prisma, and PostgreSQL


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
│     │  └─ register
│     │     ├─ page.tsx
│     │     └─ register-form.tsx
│     ├─ (dashboard)
│     │  ├─ adjustments
│     │  │  ├─ new
│     │  │  │  └─ page.tsx
│     │  │  ├─ page.tsx
│     │  │  └─ [id]
│     │  │     └─ page.tsx
│     │  ├─ categories
│     │  │  └─ page.tsx
│     │  ├─ customers
│     │  │  └─ page.tsx
│     │  ├─ dashboard
│     │  │  └─ page.tsx
│     │  ├─ help
│     │  │  └─ page.tsx
│     │  ├─ inventory
│     │  │  ├─ new
│     │  │  │  └─ page.tsx
│     │  │  ├─ page.tsx
│     │  │  └─ [id]
│     │  │     └─ page.tsx
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
│     │  │  └─ page.tsx
│     │  ├─ suppliers
│     │  │  └─ page.tsx
│     │  ├─ transfers
│     │  │  ├─ new
│     │  │  │  ├─ new-transfer-form.tsx
│     │  │  │  └─ page.tsx
│     │  │  ├─ page.tsx
│     │  │  └─ [id]
│     │  │     └─ page.tsx
│     │  └─ warehouses
│     │     ├─ new
│     │     │  ├─ new-warehouse-form.tsx
│     │     │  └─ page.tsx
│     │     ├─ page.tsx
│     │     └─ [id]
│     │        ├─ edit-warehouse-form.tsx
│     │        └─ page.tsx
│     ├─ layout.tsx
│     └─ page.tsx
├─ components
│  ├─ common
│  │  └─ CrudModal.tsx
│  ├─ dashboard
│  │  ├─ AdjustmentOverviewCard.tsx
│  │  ├─ CustomersOverviewCard.tsx
│  │  ├─ LowStockItemsCard.tsx
│  │  ├─ PurchaseOverviewCard.tsx
│  │  ├─ RecentInventoryChangesCard.tsx
│  │  ├─ SalesChart.tsx
│  │  ├─ SalesOverviewCard.tsx
│  │  ├─ SettingsQuickLinksCard.tsx
│  │  ├─ StockDistributionChart.tsx
│  │  ├─ SuppliersOverviewCard.tsx
│  │  ├─ TransferOverviewCard.tsx
│  │  └─ WarehouseOverviewCard.tsx
│  ├─ domain
│  │  ├─ adjustments
│  │  │  ├─ adjustment-actions.tsx
│  │  │  ├─ adjustment-create-modal.tsx
│  │  │  ├─ adjustment-edit-modal.tsx
│  │  │  ├─ adjustment-modal-manager.tsx
│  │  │  └─ adjustment-show-modal.tsx
│  │  ├─ categories
│  │  │  ├─ category-actions.tsx
│  │  │  ├─ category-create-modal.tsx
│  │  │  ├─ category-edit-modal.tsx
│  │  │  ├─ category-modal-manager.tsx
│  │  │  └─ category-show-modal.tsx
│  │  ├─ customers
│  │  │  ├─ customer-actions.tsx
│  │  │  ├─ customer-create-modal.tsx
│  │  │  ├─ customer-edit-modal.tsx
│  │  │  ├─ customer-modal-manager.tsx
│  │  │  └─ customer-show-modal.tsx
│  │  ├─ inventory
│  │  │  ├─ category-selector.tsx
│  │  │  ├─ delete-product-button.tsx
│  │  │  ├─ inventory-actions.tsx
│  │  │  ├─ inventory-create-modal.tsx
│  │  │  ├─ inventory-dialog.tsx
│  │  │  ├─ inventory-edit-modal.tsx
│  │  │  ├─ inventory-modal-manager.tsx
│  │  │  ├─ inventory-show-modal.tsx
│  │  │  └─ inventory-stock-modal.tsx
│  │  ├─ purchase-orders
│  │  │  ├─ purchase-order-actions.tsx
│  │  │  ├─ purchase-order-create-modal.tsx
│  │  │  ├─ purchase-order-dialog.tsx
│  │  │  ├─ purchase-order-edit-modal.tsx
│  │  │  ├─ purchase-order-modal-manager.tsx
│  │  │  └─ purchase-order-show-modal.tsx
│  │  ├─ sales-orders
│  │  │  ├─ sales-order-actions.tsx
│  │  │  ├─ sales-order-create-modal.tsx
│  │  │  ├─ sales-order-dialog.tsx
│  │  │  ├─ sales-order-edit-modal.tsx
│  │  │  ├─ sales-order-modal-manager.tsx
│  │  │  └─ sales-order-show-modal.tsx
│  │  ├─ settings
│  │  │  ├─ organization-form.tsx
│  │  │  ├─ user-create-modal.tsx
│  │  │  ├─ user-edit-modal.tsx
│  │  │  ├─ user-modal-manager.tsx
│  │  │  ├─ user-show-modal.tsx
│  │  │  └─ users-table.tsx
│  │  ├─ suppliers
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
│  │     ├─ warehouse-actions.tsx
│  │     ├─ warehouse-create-modal.tsx
│  │     ├─ warehouse-edit-modal.tsx
│  │     ├─ warehouse-modal-manager.tsx
│  │     └─ warehouse-show-modal.tsx
│  ├─ layout
│  │  ├─ ambient-background.tsx
│  │  ├─ sidebar.tsx
│  │  ├─ theme-toggle.tsx
│  │  └─ topbar.tsx
│  ├─ shared
│  │  ├─ action-column.tsx
│  │  ├─ delete-confirmation-modal.tsx
│  │  ├─ dialog-form.tsx
│  │  ├─ help-sheet.tsx
│  │  ├─ language-switcher.tsx
│  │  ├─ page-header.tsx
│  │  ├─ page-help.tsx
│  │  ├─ pagination.tsx
│  │  ├─ search-input.tsx
│  │  └─ stats-card.tsx
│  └─ ui
│     ├─ accordion.tsx
│     ├─ alert-dialog.tsx
│     ├─ badge.tsx
│     ├─ button.tsx
│     ├─ card.tsx
│     ├─ checkbox.tsx
│     ├─ dialog.tsx
│     ├─ form.tsx
│     ├─ input.tsx
│     ├─ label.tsx
│     ├─ scroll-area.tsx
│     ├─ select.tsx
│     ├─ sheet.tsx
│     ├─ sonner.tsx
│     ├─ switch.tsx
│     ├─ table.tsx
│     ├─ tabs.tsx
│     ├─ textarea.tsx
│     └─ tooltip.tsx
├─ components.json
├─ docs
│  ├─ REFACTOR_NOTES.md
│  └─ TEST_SCENARIOS.md
├─ emails
├─ eslint.config.mjs
├─ features
│  ├─ adjustments
│  │  └─ actions.ts
│  ├─ auth
│  ├─ categories
│  │  └─ actions.ts
│  ├─ customers
│  │  └─ actions.ts
│  ├─ dashboard
│  ├─ inventory
│  │  └─ actions.ts
│  ├─ purchase-orders
│  │  └─ actions.ts
│  ├─ sales-orders
│  │  └─ actions.ts
│  ├─ settings
│  │  └─ actions.ts
│  ├─ suppliers
│  │  └─ actions.ts
│  ├─ transfers
│  │  └─ actions.ts
│  ├─ users
│  └─ warehouses
│     └─ actions.ts
├─ hooks
│  └─ use-media-query.ts
├─ i18n
│  └─ request.ts
├─ lib
│  ├─ auth.config.ts
│  ├─ auth.ts
│  ├─ email.ts
│  ├─ prisma.ts
│  ├─ rbac.ts
│  ├─ services
│  │  ├─ categoryService.ts
│  │  ├─ customerService.ts
│  │  ├─ dashboardService.ts
│  │  ├─ inventoryService.ts
│  │  ├─ pricingService.ts
│  │  ├─ productService.ts
│  │  ├─ purchaseOrderService.ts
│  │  ├─ salesOrderService.ts
│  │  └─ supplierService.ts
│  └─ utils.ts
├─ lint_report.txt
├─ messages
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
├─ public
│  ├─ file.svg
│  ├─ globe.svg
│  ├─ next.svg
│  ├─ vercel.svg
│  └─ window.svg
├─ README.md
├─ scripts
│  ├─ check-users.ts
│  └─ create-user-test.ts
├─ tailwind.config.ts
├─ tsconfig.json
└─ types
   ├─ domain.ts
   ├─ next-auth.d.ts
   └─ serialized.ts

```