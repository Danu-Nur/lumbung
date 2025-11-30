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
