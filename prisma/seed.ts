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
    const org1 = await prisma.organization.create({
        data: {
            name: 'Bengkel Maju Motor',
            slug: 'maju-motor',
            address: 'Jl. Raya Bogor KM 30, Depok',
            phone: '021-87654321',
            email: 'info@majumotor.com',
        },
    });

    const org2 = await prisma.organization.create({
        data: {
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

    const user1 = await prisma.user.create({
        data: {
            name: 'Budi Santoso',
            email: 'admin@majumotor.com',
            password: hashedPassword,
            roleId: adminRole.id,
            organizationId: org1.id,
        },
    });

    const user2 = await prisma.user.create({
        data: {
            name: 'Siti Aminah',
            email: 'admin@otojaya.com',
            password: hashedPassword,
            roleId: adminRole.id,
            organizationId: org2.id,
        },
    });

    // 4. Create Warehouses
    console.log('Creating warehouses...');
    const wh1 = await prisma.warehouse.create({
        data: {
            name: 'Gudang Utama',
            code: 'WH-MAIN',
            organizationId: org1.id,
            address: 'Jl. Raya Bogor KM 30',
        },
    });

    const wh2 = await prisma.warehouse.create({
        data: {
            name: 'Gudang Cabang',
            code: 'WH-BRANCH',
            organizationId: org1.id,
            address: 'Jl. Margonda Raya',
        },
    });

    const wh3 = await prisma.warehouse.create({
        data: {
            name: 'Showroom',
            code: 'WH-SHOW',
            organizationId: org2.id,
            address: 'Jl. Fatmawati No. 10',
        },
    });

    // 5. Create Suppliers
    console.log('Creating suppliers...');
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
        const cat = await prisma.category.create({
            data: {
                name: catName,
                organizationId: org1.id,
                description: `Kategori untuk ${catName}`,
            },
        });
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
        const product = await prisma.product.create({
            data: {
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
