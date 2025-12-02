
import { prisma } from '@/lib/prisma';
import { hash } from 'bcryptjs';

async function main() {
    const password = await hash('password123', 12);
    const user = await prisma.user.create({
        data: {
            name: 'QA User Script',
            email: 'qa-script@user.com',
            password,
            roleId: 'cmimli6g4000jfgmwr4pzegrs', // Staff
            organizationId: 'cmimli6hf001kfgmwimktlspq', // Bengkel Maju Motor Updated
        },
    });
    console.log('User created:', user);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
