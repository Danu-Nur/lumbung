import { PrismaClient, MovementType, PriceType, SalesOrderStatus, PurchaseOrderStatus, AdjustmentReason, StockTransferStatus, StockOpnameStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting full database seed...');

    // 0. Cleanup existing data (Optional, but makes it easier to re-run)
    console.log('Cleaning up existing data...');
    await prisma.inventoryMovement.deleteMany();
    await prisma.inventoryItem.deleteMany();
    await prisma.stockOpnameItem.deleteMany();
    await prisma.stockOpname.deleteMany();
    await prisma.stockTransferItem.deleteMany();
    await prisma.stockTransfer.deleteMany();
    await prisma.stockAdjustment.deleteMany();
    await prisma.purchaseOrderItem.deleteMany();
    await prisma.purchaseReceipt.deleteMany();
    await prisma.purchaseOrder.deleteMany();
    await prisma.salesOrderItem.deleteMany();
    await prisma.salesOrder.deleteMany();
    await prisma.productPriceHistory.deleteMany();
    await prisma.productImage.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
    await prisma.supplier.deleteMany();
    await prisma.customer.deleteMany();
    // Keep Roles, Permissions, Orgs, and Users for login consistency

    // 1. Create Roles & Permissions
    console.log('Creating roles & permissions...');
    const permissions = [
        'inventory:read', 'inventory:create', 'inventory:update', 'inventory:delete',
        'sales:read', 'sales:create', 'sales:update', 'sales:delete',
        'purchase:read', 'purchase:create', 'purchase:update', 'purchase:delete',
        'users:read', 'users:create', 'users:update', 'users:delete',
        'settings:read', 'settings:update',
    ];

    for (const perm of permissions) {
        const [resource, action] = perm.split(':');
        await prisma.permission.upsert({
            where: { name: perm },
            update: {},
            create: { name: perm, resource, action },
        });
    }

    const adminRole = await prisma.role.upsert({
        where: { name: 'Admin' },
        update: {},
        create: { name: 'Admin', description: 'Administrator with full access' },
    });

    // Assign all permissions to Admin
    const allPermissions = await prisma.permission.findMany();
    for (const perm of allPermissions) {
        await prisma.rolePermission.upsert({
            where: { roleId_permissionId: { roleId: adminRole.id, permissionId: perm.id } },
            update: {},
            create: { roleId: adminRole.id, permissionId: perm.id },
        });
    }

    // 2. Create Plans
    console.log('Creating plans...');
    const plans = [
        {
            name: 'Free',
            slug: 'free',
            priceMonthly: 0,
            priceYearly: 0,
            limits: { maxUsers: 1, maxWarehouses: 1, maxItems: 50 },
            features: ["Up to 50 Items", "1 Warehouse"]
        },
        {
            name: 'Pro',
            slug: 'pro',
            priceMonthly: 79000,
            priceYearly: 790000,
            limits: { maxUsers: 10, maxWarehouses: 5, maxItems: 100000 },
            features: ["Unlimited Items", "Up to 5 Warehouses", "Advanced Analytics"]
        }
    ];

    for (const p of plans) {
        await prisma.plan.upsert({
            where: { slug: p.slug },
            update: p,
            create: p
        });
    }

    const proPlan = await prisma.plan.findUnique({ where: { slug: 'pro' } });

    // 3. Create Organizations
    console.log('Creating organizations...');
    const org1 = await prisma.organization.upsert({
        where: { slug: 'maju-motor' },
        update: {},
        create: {
            name: 'Bengkel Maju Motor',
            slug: 'maju-motor',
            address: 'Jl. Raya Bogor KM 30, Depok',
            phone: '021-87654321',
            email: 'info@majumotor.com',
        },
    });

    // 4. Create Subscription
    console.log('Creating subscription...');
    if (proPlan) {
        await prisma.subscription.upsert({
            where: { organizationId: org1.id },
            update: { planId: proPlan.id },
            create: {
                organizationId: org1.id,
                planId: proPlan.id,
                status: 'ACTIVE',
            }
        });
    }

    // 5. Create Users
    console.log('Creating users...');
    const hashedPassword = await bcrypt.hash('admin123', 10);

    const user1 = await prisma.user.upsert({
        where: { email: 'admin@majumotor.com' },
        update: {},
        create: {
            name: 'Budi Santoso',
            email: 'admin@majumotor.com',
            password: hashedPassword,
            roleId: adminRole.id,
            organizationId: org1.id,
        },
    });

    // 6. Create Warehouses (Upsert to avoid duplicates)
    console.log('Creating warehouses...');
    const wh1 = await prisma.warehouse.upsert({
        where: { organizationId_code: { organizationId: org1.id, code: 'WH-MAIN' } },
        update: {},
        create: {
            name: 'Gudang Utama',
            code: 'WH-MAIN',
            organizationId: org1.id,
            address: 'Jl. Raya Bogor KM 30',
            city: 'Depok',
        },
    });

    const wh2 = await prisma.warehouse.upsert({
        where: { organizationId_code: { organizationId: org1.id, code: 'WH-BRANCH' } },
        update: {},
        create: {
            name: 'Gudang Cabang',
            code: 'WH-BRANCH',
            organizationId: org1.id,
            address: 'Jl. Margonda Raya',
            city: 'Depok',
        },
    });

    // 7. Create Suppliers & Customers
    console.log('Creating suppliers & customers...');
    const supplier1 = await prisma.supplier.create({
        data: {
            name: 'PT Astra Otoparts',
            email: 'sales@astra.co.id',
            phone: '021-5551234',
            organizationId: org1.id,
        },
    });

    const supplier2 = await prisma.supplier.create({
        data: {
            name: 'CV Sumber Makmur',
            email: 'sales@sumbermakmur.com',
            phone: '021-5555678',
            organizationId: org1.id,
        },
    });

    const customer1 = await prisma.customer.create({
        data: {
            name: 'Slamet Raharjo',
            email: 'slamet@mail.com',
            phone: '08123456789',
            address: 'Jl. Melati No. 5',
            organizationId: org1.id,
        },
    });

    // 8. Create Categories
    console.log('Creating categories...');
    const catOli = await prisma.category.create({
        data: { name: 'Oli & Fluida', organizationId: org1.id }
    });
    const catKelistrikan = await prisma.category.create({
        data: { name: 'Kelistrikan', organizationId: org1.id }
    });

    // 9. Create Products & Batches
    console.log('Creating products & inventory batches...');

    // Product 1: Busi NGK
    const product1 = await prisma.product.create({
        data: {
            name: 'Busi NGK CPR8EA-9',
            sku: 'NGK-CPR8EA-9',
            categoryId: catKelistrikan.id,
            unit: 'pcs',
            sellingPrice: 25000,
            costPrice: 15500,
            organizationId: org1.id,
            createdById: user1.id,
            supplierId: supplier1.id,
        }
    });

    // Batch 1 (Old)
    const batch1_1 = await prisma.inventoryItem.create({
        data: {
            productId: product1.id,
            warehouseId: wh1.id,
            supplierId: supplier1.id,
            unitCost: 15000,
            quantityOnHand: 20,
            availableQty: 20,
            batchNumber: 'BATCH-001',
            receivedDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        }
    });

    // Batch 2 (New)
    const batch1_2 = await prisma.inventoryItem.create({
        data: {
            productId: product1.id,
            warehouseId: wh1.id,
            supplierId: supplier1.id,
            unitCost: 15500,
            quantityOnHand: 50,
            availableQty: 50,
            batchNumber: 'BATCH-002',
            receivedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        }
    });

    await prisma.inventoryMovement.createMany({
        data: [
            { productId: product1.id, warehouseId: wh1.id, inventoryItemId: batch1_1.id, movementType: MovementType.IN, quantity: 20, createdById: user1.id },
            { productId: product1.id, warehouseId: wh1.id, inventoryItemId: batch1_2.id, movementType: MovementType.IN, quantity: 50, createdById: user1.id }
        ]
    });

    // Product 2: Oli
    const product2 = await prisma.product.create({
        data: {
            name: 'Oli Yamalube Sport 1L',
            sku: 'OIL-YAM-SPT-1L',
            categoryId: catOli.id,
            unit: 'liter',
            sellingPrice: 65000,
            costPrice: 45000,
            organizationId: org1.id,
            createdById: user1.id,
            supplierId: supplier1.id,
        }
    });

    const batch2_1 = await prisma.inventoryItem.create({
        data: {
            productId: product2.id,
            warehouseId: wh1.id,
            supplierId: supplier1.id,
            unitCost: 45000,
            quantityOnHand: 100,
            availableQty: 100,
            batchNumber: 'BATCH-YML-001',
            receivedDate: new Date(),
        }
    });

    await prisma.inventoryMovement.create({
        data: { productId: product2.id, warehouseId: wh1.id, inventoryItemId: batch2_1.id, movementType: MovementType.IN, quantity: 100, createdById: user1.id }
    });

    // 10. Create Purchase order
    console.log('Creating purchase orders...');
    await prisma.purchaseOrder.create({
        data: {
            organizationId: org1.id,
            poNumber: 'PO-202312001',
            supplierId: supplier1.id,
            warehouseId: wh1.id,
            status: PurchaseOrderStatus.COMPLETED,
            subtotal: 1000000,
            tax: 0,
            total: 1000000,
            createdById: user1.id,
            items: {
                create: [
                    { productId: product1.id, quantity: 40, unitCost: 15500, lineTotal: 620000 }
                ]
            }
        }
    });

    // 11. Create Sales order
    console.log('Creating sales orders...');
    await prisma.salesOrder.create({
        data: {
            organizationId: org1.id,
            orderNumber: 'SO-202312001',
            customerId: customer1.id,
            warehouseId: wh1.id,
            status: SalesOrderStatus.FULFILLED,
            subtotal: 250000,
            tax: 0,
            total: 250000,
            createdById: user1.id,
            items: {
                create: [
                    { productId: product1.id, quantity: 10, unitPrice: 25000, lineTotal: 250000 }
                ]
            }
        }
    });

    // 12. Stock Adjustment
    console.log('Creating adjustments...');
    await prisma.stockAdjustment.create({
        data: {
            organizationId: org1.id,
            productId: product2.id,
            warehouseId: wh1.id,
            adjustmentType: 'decrease',
            quantity: 5,
            reason: AdjustmentReason.DAMAGE,
            createdById: user1.id,
        }
    });

    // 13. Stock Transfer
    console.log('Creating transfers...');
    await prisma.stockTransfer.create({
        data: {
            organizationId: org1.id,
            transferNumber: 'TRF-202312001',
            fromWarehouseId: wh1.id,
            toWarehouseId: wh2.id,
            status: StockTransferStatus.COMPLETED,
            createdById: user1.id,
            items: {
                create: [
                    { productId: product1.id, quantity: 5 }
                ]
            }
        }
    });

    // 14. Stock Opname
    console.log('Creating opnames...');
    await prisma.stockOpname.create({
        data: {
            organizationId: org1.id,
            opnameNumber: 'OPN-202312-01',
            warehouseId: wh1.id,
            status: StockOpnameStatus.COMPLETED,
            createdById: user1.id,
            items: {
                create: [
                    { productId: product1.id, systemQty: 60, actualQty: 58, difference: -2 }
                ]
            }
        }
    });

    console.log('✅ Database seeded successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
