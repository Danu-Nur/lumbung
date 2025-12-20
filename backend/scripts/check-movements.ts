import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const count = await prisma.inventoryMovement.count();
    console.log('Total Movements:', count);

    const latest = await prisma.inventoryMovement.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { product: true, warehouse: true }
    });

    console.log('Latest Movements:', JSON.stringify(latest, null, 2));
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
