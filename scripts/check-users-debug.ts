import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany({
        select: {
            email: true,
            role: { select: { name: true } },
            password: true, // We won't print this, just check if it exists
        },
    });

    console.log("Found users:", users.length);
    users.forEach((u) => {
        console.log(`- ${u.email} (${u.role.name}) - Password set: ${!!u.password}`);
    });
}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());
