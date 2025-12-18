import { PrismaClient, MovementType, PriceType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seed...');

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

    await prisma.role.upsert({
        where: { name: 'Staff' },
        update: {},
        create: { name: 'Staff', description: 'Staff with limited access' },
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

    // 2. Create Organizations
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

    const org2 = await prisma.organization.upsert({
        where: { slug: 'otomotif-jaya' },
        update: {},
        create: {
            name: 'CV Otomotif Jaya',
            slug: 'otomotif-jaya',
            address: 'Jl. Fatmawati No. 10, Jakarta Selatan',
            phone: '021-12345678',
            email: 'info@otojaya.com',
        },
    });

    // 3. Create Users
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

    const user2 = await prisma.user.upsert({
        where: { email: 'admin@otojaya.com' },
        update: {},
        create: {
            name: 'Siti Aminah',
            email: 'admin@otojaya.com',
            password: hashedPassword,
            roleId: adminRole.id,
            organizationId: org2.id,
        },
    });

    // 4. Create Warehouses
    console.log('Creating warehouses...');
    const wh1 = await prisma.warehouse.upsert({
        where: { organizationId_code: { organizationId: org1.id, code: 'WH-MAIN' } },
        update: {},
        create: {
            name: 'Gudang Utama',
            code: 'WH-MAIN',
            organizationId: org1.id,
            address: 'Jl. Raya Bogor KM 30',
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
        },
    });

    const wh3 = await prisma.warehouse.upsert({
        where: { organizationId_code: { organizationId: org2.id, code: 'WH-SHOW' } },
        update: {},
        create: {
            name: 'Showroom',
            code: 'WH-SHOW',
            organizationId: org2.id,
            address: 'Jl. Fatmawati No. 10',
        },
    });

    // 5. Create Suppliers
    console.log('Creating suppliers...');
    let supplier1 = await prisma.supplier.findFirst({
        where: { name: 'PT Astra Otoparts', organizationId: org1.id },
    });
    if (!supplier1) {
        supplier1 = await prisma.supplier.create({
            data: {
                name: 'PT Astra Otoparts',
                email: 'sales@astra.co.id',
                phone: '021-5551234',
                organizationId: org1.id,
            },
        });
    }

    let supplier2 = await prisma.supplier.findFirst({
        where: { name: 'CV Sumber Makmur', organizationId: org1.id },
    });
    if (!supplier2) {
        supplier2 = await prisma.supplier.create({
            data: {
                name: 'CV Sumber Makmur',
                email: 'sales@sumbermakmur.com',
                phone: '021-5555678',
                organizationId: org1.id,
            },
        });
    }

    // 6. Create Categories
    console.log('Creating categories...');
    const categoriesData = [
        'Mesin & Komponen',
        'Oli & Fluida',
        'Sistem Rem',
        'Suspensi & Kaki-kaki',
        'Kelistrikan',
        'Ban & Velg',
        'Body & Eksterior',
        'Interior & Kenyamanan',
        'Aksesoris & Tools',
    ];

    const categoriesMap = new Map();

    for (const catName of categoriesData) {
        let cat = await prisma.category.findFirst({
            where: { name: catName, organizationId: org1.id },
        });
        if (!cat) {
            cat = await prisma.category.create({
                data: {
                    name: catName,
                    organizationId: org1.id,
                    description: `Kategori untuk ${catName}`,
                },
            });
        }
        categoriesMap.set(catName, cat.id);
    }

    // 7. Create Products & Inventory
    console.log('Creating products & inventory...');

    const products = [
        {
            name: 'Busi NGK CPR8EA-9',
            sku: 'NGK-CPR8EA-9',
            category: 'Kelistrikan',
            unit: 'pcs',
            cost: 15000,
            price: 25000,
            supplierId: supplier1.id,
            attributes: { brand: 'NGK', vehicleType: 'motor' },
        },
        {
            name: 'Oli Yamalube Sport 1L',
            sku: 'OIL-YAM-SPT-1L',
            category: 'Oli & Fluida',
            unit: 'liter',
            cost: 45000,
            price: 65000,
            supplierId: supplier1.id,
            attributes: { brand: 'Yamalube', viscosity: '10W-40' },
        },
        {
            name: 'Kampas Rem Depan Mio',
            sku: 'BRK-PAD-MIO-F',
            category: 'Sistem Rem',
            unit: 'set',
            cost: 35000,
            price: 55000,
            supplierId: supplier2.id,
            attributes: { brand: 'Yamaha Genuine Parts', compatibleModels: ['Mio', 'Fino'] },
        },
        {
            name: 'Aki GS Astra GTZ5S',
            sku: 'ACC-GS-GTZ5S',
            category: 'Kelistrikan',
            unit: 'pcs',
            cost: 180000,
            price: 250000,
            supplierId: supplier1.id,
            attributes: { brand: 'GS Astra', voltage: '12V', capacity: '3.5Ah' },
        },
        {
            name: 'Ban IRC 80/90-14',
            sku: 'TYR-IRC-809014',
            category: 'Ban & Velg',
            unit: 'pcs',
            cost: 140000,
            price: 195000,
            supplierId: null,
            attributes: { brand: 'IRC', size: '80/90-14', type: 'Tubeless' },
        },
        {
            name: 'Shockbreaker Belakang Vario',
            sku: 'SUS-SHK-VAR-R',
            category: 'Suspensi & Kaki-kaki',
            unit: 'pcs',
            cost: 250000,
            price: 350000,
            supplierId: supplier2.id,
            attributes: { brand: 'Honda Genuine Parts', compatibleModels: ['Vario 125', 'Vario 150'] },
        },
        {
            name: 'Filter Udara Beat FI',
            sku: 'FLT-AIR-BEAT',
            category: 'Mesin & Komponen',
            unit: 'pcs',
            cost: 40000,
            price: 60000,
            supplierId: null,
            attributes: { brand: 'Honda Genuine Parts' },
        },
        {
            name: 'Lampu Depan LED H4',
            sku: 'LGT-LED-H4',
            category: 'Kelistrikan',
            unit: 'pcs',
            cost: 75000,
            price: 125000,
            supplierId: supplier2.id,
            attributes: { brand: 'Osram', type: 'LED' },
        },
        {
            name: 'Spion Tomok CNC',
            sku: 'ACC-MIR-TMK',
            category: 'Aksesoris & Tools',
            unit: 'set',
            cost: 85000,
            price: 150000,
            supplierId: null,
            attributes: { material: 'Aluminum CNC', color: 'Black' },
        },
        {
            name: 'Rantai Keteng Satria FU',
            sku: 'ENG-CHN-SAT',
            category: 'Mesin & Komponen',
            unit: 'pcs',
            cost: 90000,
            price: 135000,
            supplierId: supplier1.id,
            attributes: { brand: 'Suzuki Genuine Parts' },
        },
    ];

    for (const p of products) {
        const product = await prisma.product.upsert({
            where: {
                organizationId_sku: { organizationId: org1.id, sku: p.sku },
            },
            update: {},
            create: {
                name: p.name,
                sku: p.sku,
                categoryId: categoriesMap.get(p.category),
                unit: p.unit,
                sellingPrice: p.price,
                costPrice: p.cost,
                organizationId: org1.id,
                createdById: user1.id,
                supplierId: p.supplierId,
                customAttributes: p.attributes,
            },
        });

        // Check if inventory setup exists (to avoid duplicate history/stock)
        const existingInv = await prisma.inventoryItem.findUnique({
            where: { productId_warehouseId: { productId: product.id, warehouseId: wh1.id } },
        });

        if (!existingInv) {
            // Initial Price History
            await prisma.productPriceHistory.createMany({
                data: [
                    {
                        productId: product.id,
                        priceType: PriceType.COST,
                        price: p.cost,
                        createdById: user1.id,
                        notes: 'Initial cost price',
                    },
                    {
                        productId: product.id,
                        priceType: PriceType.SELLING,
                        price: p.price,
                        createdById: user1.id,
                        notes: 'Initial selling price',
                    },
                ],
            });

            // Initial Stock (Movement IN)
            const initialQty = Math.floor(Math.random() * 50) + 10; // 10-60 items

            await prisma.inventoryMovement.create({
                data: {
                    productId: product.id,
                    warehouseId: wh1.id,
                    movementType: MovementType.IN,
                    quantity: initialQty,
                    createdById: user1.id,
                    notes: 'Initial stock seeding',
                },
            });

            // Update Inventory Item Cache
            await prisma.inventoryItem.create({
                data: {
                    productId: product.id,
                    warehouseId: wh1.id,
                    quantityOnHand: initialQty,
                    availableQty: initialQty,
                },
            });
        }
    }

    // 8. Create Plans & Subscriptions
    console.log('Creating plans...');
    const freePlan = await prisma.plan.upsert({
        where: { slug: 'free' },
        update: {},
        create: {
            name: 'Free',
            slug: 'free',
            description: 'Untuk usaha kecil',
            priceMonthly: 0,
            priceYearly: 0,
            limits: { maxUsers: 2, maxWarehouses: 1, maxItems: 100 },
            features: ['basic_inventory', 'basic_reports'],
        },
    });

    const proPlan = await prisma.plan.upsert({
        where: { slug: 'pro' },
        update: {},
        create: {
            name: 'Pro',
            slug: 'pro',
            description: 'Untuk usaha berkembang',
            priceMonthly: 150000,
            priceYearly: 1500000,
            limits: { maxUsers: 10, maxWarehouses: 5, maxItems: 10000 },
            features: ['advanced_inventory', 'advanced_reports', 'email_notifications'],
        },
    });

    console.log('Creating subscriptions...');
    // Assign Free plan to Org 1
    await prisma.subscription.upsert({
        where: { organizationId: org1.id },
        update: {},
        create: {
            organizationId: org1.id,
            planId: freePlan.id,
            status: 'ACTIVE',
        },
    });

    // Assign Pro plan to Org 2
    await prisma.subscription.upsert({
        where: { organizationId: org2.id },
        update: {},
        create: {
            organizationId: org2.id,
            planId: proPlan.id,
            status: 'ACTIVE',
        },
    });

    console.log('✅ Database seeded successfully!');
    console.log('Credentials:');
    console.log('Motor Admin: admin@majumotor.com / admin123');
    console.log('Mobil Admin: admin@otojaya.com / admin123');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
