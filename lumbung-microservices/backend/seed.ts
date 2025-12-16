import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    // 1. Create Role
    const adminRole = await prisma.role.upsert({
        where: { name: 'Admin' },
        update: {},
        create: {
            name: 'Admin',
            description: 'Administrator with full access to organization resources'
        }
    });

    // 2. Create Organization
    const org = await prisma.organization.upsert({
        where: { slug: 'lumbung-demo' },
        update: {},
        create: {
            name: 'Lumbung Demo',
            slug: 'lumbung-demo',
            email: 'info@lumbung.com'
        }
    });

    // 3. Create User
    const hashedPassword = await bcrypt.hash('password123', 10);
    const user = await prisma.user.upsert({
        where: { email: 'demo@lumbung.com' },
        update: {
            password: hashedPassword // Ensure password is set if user exists
        },
        create: {
            email: 'demo@lumbung.com',
            name: 'Demo User',
            password: hashedPassword,
            roleId: adminRole.id,
            organizationId: org.id
        }
    });

    console.log({ adminRole, org, user });
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
