
import { prisma } from '@/lib/prisma';

async function main() {
    const users = await prisma.user.findMany({
        include: {
            role: true,
            organization: true,
        },
    });
    const roles = await prisma.role.findMany();
    console.log('Users:', JSON.stringify(users, null, 2));
    console.log('Roles:', JSON.stringify(roles, null, 2));
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
