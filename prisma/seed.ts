import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seed...');

    // Create Roles
    console.log('Creating roles...');
    const superAdminRole = await prisma.role.upsert({
        where: { name: 'SuperAdmin' },
        update: {},
        create: {
            name: 'SuperAdmin',
            description: 'Super Administrator with cross-tenant access',
        },
    });

    const adminRole = await prisma.role.upsert({
        where: { name: 'Admin' },
        update: {},
        create: {
            name: 'Admin',
            description: 'Organization Administrator',
        },
    });

    const managerRole = await prisma.role.upsert({
        where: { name: 'Manager' },
        update: {},
        create: {
            name: 'Manager',
            description: 'Manager with limited administrative access',
        },
    });

    const staffRole = await prisma.role.upsert({
        where: { name: 'Staff' },
        update: {},
        create: {
            name: 'Staff',
            description: 'Warehouse Staff',
        },
    });

    const viewerRole = await prisma.role.upsert({
        where: { name: 'Viewer' },
        update: {},
        create: {
            name: 'Viewer',
            description: 'Read-only access',
        },
    });

    // Create Permissions
    console.log('Creating permissions...');
    const permissions = [
        // Inventory
        { name: 'inventory:create', resource: 'inventory', action: 'create' },
        { name: 'inventory:read', resource: 'inventory', action: 'read' },
        { name: 'inventory:update', resource: 'inventory', action: 'update' },
        { name: 'inventory:delete', resource: 'inventory', action: 'delete' },
        // Sales Orders
        { name: 'sales-orders:create', resource: 'sales-orders', action: 'create' },
        { name: 'sales-orders:read', resource: 'sales-orders', action: 'read' },
        { name: 'sales-orders:update', resource: 'sales-orders', action: 'update' },
        { name: 'sales-orders:delete', resource: 'sales-orders', action: 'delete' },
        { name: 'sales-orders:fulfill', resource: 'sales-orders', action: 'fulfill' },
        { name: 'sales-orders:invoice', resource: 'sales-orders', action: 'invoice' },
        // Purchase Orders
        { name: 'purchase-orders:create', resource: 'purchase-orders', action: 'create' },
        { name: 'purchase-orders:read', resource: 'purchase-orders', action: 'read' },
        { name: 'purchase-orders:update', resource: 'purchase-orders', action: 'update' },
        { name: 'purchase-orders:delete', resource: 'purchase-orders', action: 'delete' },
        { name: 'purchase-orders:receive', resource: 'purchase-orders', action: 'receive' },
        // Warehouses
        { name: 'warehouses:create', resource: 'warehouses', action: 'create' },
        { name: 'warehouses:read', resource: 'warehouses', action: 'read' },
        { name: 'warehouses:update', resource: 'warehouses', action: 'update' },
        { name: 'warehouses:delete', resource: 'warehouses', action: 'delete' },
        // Transfers
        { name: 'transfers:create', resource: 'transfers', action: 'create' },
        { name: 'transfers:read', resource: 'transfers', action: 'read' },
        { name: 'transfers:update', resource: 'transfers', action: 'update' },
        { name: 'transfers:delete', resource: 'transfers', action: 'delete' },
        { name: 'transfers:complete', resource: 'transfers', action: 'complete' },
        // Adjustments
        { name: 'adjustments:create', resource: 'adjustments', action: 'create' },
        { name: 'adjustments:read', resource: 'adjustments', action: 'read' },
        // Customers
        { name: 'customers:create', resource: 'customers', action: 'create' },
        { name: 'customers:read', resource: 'customers', action: 'read' },
        { name: 'customers:update', resource: 'customers', action: 'update' },
        { name: 'customers:delete', resource: 'customers', action: 'delete' },
        // Suppliers
        { name: 'suppliers:create', resource: 'suppliers', action: 'create' },
        { name: 'suppliers:read', resource: 'suppliers', action: 'read' },
        { name: 'suppliers:update', resource: 'suppliers', action: 'update' },
        { name: 'suppliers:delete', resource: 'suppliers', action: 'delete' },
        // Users
        { name: 'users:create', resource: 'users', action: 'create' },
        { name: 'users:read', resource: 'users', action: 'read' },
        { name: 'users:update', resource: 'users', action: 'update' },
        { name: 'users:delete', resource: 'users', action: 'delete' },
        { name: 'users:manage-roles', resource: 'users', action: 'manage-roles' },
        // Organizations
        { name: 'organizations:create', resource: 'organizations', action: 'create' },
        { name: 'organizations:read', resource: 'organizations', action: 'read' },
        { name: 'organizations:update', resource: 'organizations', action: 'update' },
        { name: 'organizations:delete', resource: 'organizations', action: 'delete' },
        // Settings
        { name: 'settings:read', resource: 'settings', action: 'read' },
        { name: 'settings:update', resource: 'settings', action: 'update' },
    ];

    for (const perm of permissions) {
        await prisma.permission.upsert({
            where: { name: perm.name },
            update: {},
            create: perm,
        });
    }

    // Assign permissions to roles
    console.log('Assigning permissions to roles...');

    // Admin gets all permissions except organization management
    const adminPermissions = permissions.filter(p => !p.resource.includes('organizations'));
    for (const perm of adminPermissions) {
        const permission = await prisma.permission.findUnique({ where: { name: perm.name } });
        if (permission) {
            await prisma.rolePermission.upsert({
                where: {
                    roleId_permissionId: {
                        roleId: adminRole.id,
                        permissionId: permission.id,
                    },
                },
                update: {},
                create: {
                    roleId: adminRole.id,
                    permissionId: permission.id,
                },
            });
        }
    }

    // Manager gets read/update permissions
    const managerPermissions = permissions.filter(p =>
        p.action === 'read' || p.action === 'update' || p.action === 'create'
    ).filter(p => !p.resource.includes('organizations') && !p.resource.includes('users'));

    for (const perm of managerPermissions) {
        const permission = await prisma.permission.findUnique({ where: { name: perm.name } });
        if (permission) {
            await prisma.rolePermission.upsert({
                where: {
                    roleId_permissionId: {
                        roleId: managerRole.id,
                        permissionId: permission.id,
                    },
                },
                update: {},
                create: {
                    roleId: managerRole.id,
                    permissionId: permission.id,
                },
            });
        }
    }

    // Staff gets create/read permissions for inventory operations
    const staffPermissions = permissions.filter(p =>
        (p.action === 'read' || p.action === 'create') &&
        (p.resource.includes('inventory') || p.resource.includes('adjustments') ||
            p.resource.includes('transfers') || p.resource.includes('warehouses'))
    );

    for (const perm of staffPermissions) {
        const permission = await prisma.permission.findUnique({ where: { name: perm.name } });
        if (permission) {
            await prisma.rolePermission.upsert({
                where: {
                    roleId_permissionId: {
                        roleId: staffRole.id,
                        permissionId: permission.id,
                    },
                },
                update: {},
                create: {
                    roleId: staffRole.id,
                    permissionId: permission.id,
                },
            });
        }
    }

    // Viewer gets only read permissions
    const viewerPermissions = permissions.filter(p => p.action === 'read');
    for (const perm of viewerPermissions) {
        const permission = await prisma.permission.findUnique({ where: { name: perm.name } });
        if (permission) {
            await prisma.rolePermission.upsert({
                where: {
                    roleId_permissionId: {
                        roleId: viewerRole.id,
                        permissionId: permission.id,
                    },
                },
                update: {},
                create: {
                    roleId: viewerRole.id,
                    permissionId: permission.id,
                },
            });
        }
    }

    // Create Super Admin user (no organization)
    console.log('Creating Super Admin user...');
    const hashedPassword = await bcrypt.hash('admin123', 10);

    await prisma.user.upsert({
        where: { email: 'superadmin@inventorypro.com' },
        update: {},
        create: {
            email: 'superadmin@inventorypro.com',
            name: 'Super Administrator',
            password: hashedPassword,
            roleId: superAdminRole.id,
            organizationId: null, // Super Admin has no organization
            isActive: true,
        },
    });

    // Create Demo Organization
    console.log('Creating demo organization...');
    const demoOrg = await prisma.organization.upsert({
        where: { slug: 'demo-warehouse' },
        update: {},
        create: {
            name: 'Demo Warehouse Co.',
            slug: 'demo-warehouse',
            email: 'contact@demowarehouse.com',
            phone: '+62 21 1234 5678',
            address: 'Jl. Raya Industri No. 123, Jakarta',
        },
    });

    // Create Admin user for demo organization
    console.log('Creating organization admin...');
    const orgAdmin = await prisma.user.upsert({
        where: { email: 'admin@demowarehouse.com' },
        update: {},
        create: {
            email: 'admin@demowarehouse.com',
            name: 'Admin User',
            password: hashedPassword,
            roleId: adminRole.id,
            organizationId: demoOrg.id,
            isActive: true,
        },
    });

    // Create Warehouses
    console.log('Creating warehouses...');
    const mainWarehouse = await prisma.warehouse.create({
        data: {
            name: 'Main Warehouse',
            code: 'WH-MAIN',
            address: 'Jl. Raya Industri No. 123, Jakarta',
            city: 'Jakarta',
            phone: '+62 21 1234 5678',
            organizationId: demoOrg.id,
            isActive: true,
        },
    });

    const secondaryWarehouse = await prisma.warehouse.create({
        data: {
            name: 'Secondary Warehouse',
            code: 'WH-SEC',
            address: 'Jl. Industri No. 456, Tangerang',
            city: 'Tangerang',
            phone: '+62 21 8765 4321',
            organizationId: demoOrg.id,
            isActive: true,
        },
    });

    // Create Categories
    console.log('Creating categories...');
    const electronicsCategory = await prisma.category.create({
        data: {
            name: 'Electronics',
            description: 'Electronic devices and accessories',
            organizationId: demoOrg.id,
        },
    });

    const furnitureCategory = await prisma.category.create({
        data: {
            name: 'Furniture',
            description: 'Office and home furniture',
            organizationId: demoOrg.id,
        },
    });

    // Create Products
    console.log('Creating products...');
    const products = [
        {
            name: 'Laptop Dell XPS 13',
            sku: 'ELEC-LAP-001',
            barcode: '1234567890123',
            description: 'High-performance laptop for business',
            categoryId: electronicsCategory.id,
            unit: 'pcs',
            sellingPrice: 15000000,
            costPrice: 12000000,
            lowStockThreshold: 5,
            organizationId: demoOrg.id,
            createdById: orgAdmin.id,
        },
        {
            name: 'Wireless Mouse Logitech',
            sku: 'ELEC-MOU-001',
            barcode: '1234567890124',
            description: 'Ergonomic wireless mouse',
            categoryId: electronicsCategory.id,
            unit: 'pcs',
            sellingPrice: 350000,
            costPrice: 250000,
            lowStockThreshold: 20,
            organizationId: demoOrg.id,
            createdById: orgAdmin.id,
        },
        {
            name: 'Office Chair Executive',
            sku: 'FURN-CHA-001',
            barcode: '1234567890125',
            description: 'Comfortable executive office chair',
            categoryId: furnitureCategory.id,
            unit: 'pcs',
            sellingPrice: 2500000,
            costPrice: 1800000,
            lowStockThreshold: 10,
            organizationId: demoOrg.id,
            createdById: orgAdmin.id,
        },
        {
            name: 'Desk Lamp LED',
            sku: 'ELEC-LAM-001',
            barcode: '1234567890126',
            description: 'Adjustable LED desk lamp',
            categoryId: electronicsCategory.id,
            unit: 'pcs',
            sellingPrice: 450000,
            costPrice: 300000,
            lowStockThreshold: 15,
            organizationId: demoOrg.id,
            createdById: orgAdmin.id,
        },
    ];

    for (const productData of products) {
        const product = await prisma.product.create({
            data: productData,
        });

        // Create initial inventory for main warehouse
        await prisma.inventoryItem.create({
            data: {
                productId: product.id,
                warehouseId: mainWarehouse.id,
                quantityOnHand: 50,
                allocatedQty: 0,
                availableQty: 50,
            },
        });

        // Create initial inventory movement
        await prisma.inventoryMovement.create({
            data: {
                productId: product.id,
                warehouseId: mainWarehouse.id,
                movementType: 'IN',
                quantity: 50,
                referenceType: 'InitialStock',
                referenceId: 'SEED',
                notes: 'Initial stock from seed data',
                createdById: orgAdmin.id,
            },
        });

        // Create inventory for secondary warehouse (lower stock)
        await prisma.inventoryItem.create({
            data: {
                productId: product.id,
                warehouseId: secondaryWarehouse.id,
                quantityOnHand: 20,
                allocatedQty: 0,
                availableQty: 20,
            },
        });

        await prisma.inventoryMovement.create({
            data: {
                productId: product.id,
                warehouseId: secondaryWarehouse.id,
                movementType: 'IN',
                quantity: 20,
                referenceType: 'InitialStock',
                referenceId: 'SEED',
                notes: 'Initial stock from seed data',
                createdById: orgAdmin.id,
            },
        });
    }

    // Create Customers
    console.log('Creating customers...');
    await prisma.customer.create({
        data: {
            name: 'PT. Maju Jaya',
            email: 'purchasing@majujaya.com',
            phone: '+62 21 9876 5432',
            address: 'Jl. Sudirman No. 789, Jakarta',
            city: 'Jakarta',
            taxId: '01.234.567.8-901.000',
            organizationId: demoOrg.id,
        },
    });

    await prisma.customer.create({
        data: {
            name: 'CV. Sejahtera Abadi',
            email: 'admin@sejahtera.com',
            phone: '+62 21 5555 1234',
            address: 'Jl. Gatot Subroto No. 456, Jakarta',
            city: 'Jakarta',
            organizationId: demoOrg.id,
        },
    });

    // Create Suppliers
    console.log('Creating suppliers...');
    await prisma.supplier.create({
        data: {
            name: 'PT. Global Electronics',
            email: 'sales@globalelec.com',
            phone: '+62 21 3333 4444',
            address: 'Jl. Industri Raya No. 100, Bekasi',
            city: 'Bekasi',
            taxId: '02.345.678.9-012.000',
            organizationId: demoOrg.id,
        },
    });

    await prisma.supplier.create({
        data: {
            name: 'CV. Furniture Indonesia',
            email: 'info@furnitureid.com',
            phone: '+62 21 7777 8888',
            address: 'Jl. Kayu Manis No. 50, Tangerang',
            city: 'Tangerang',
            organizationId: demoOrg.id,
        },
    });

    console.log('✅ Database seeded successfully!');
    console.log('\n📝 Login credentials:');
    console.log('Super Admin: superadmin@inventorypro.com / admin123');
    console.log('Org Admin: admin@demowarehouse.com / admin123');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
