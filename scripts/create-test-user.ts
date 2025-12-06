import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    const email = "test-login@example.com";
    const password = "password123";
    const hashedPassword = await bcrypt.hash(password, 10);

    // Find or create role
    const role = await prisma.role.findFirst({ where: { name: "SuperAdmin" } });
    if (!role) throw new Error("SuperAdmin role not found");

    const user = await prisma.user.upsert({
        where: { email },
        update: { password: hashedPassword },
        create: {
            email,
            name: "Test Login User",
            password: hashedPassword,
            roleId: role.id,
        },
    });

    console.log(`Created/Updated user: ${user.email}`);
    console.log(`Password: ${password}`);
}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());
