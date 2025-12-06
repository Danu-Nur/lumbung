import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    console.log("🔧 Fixing seed data...");

    // 1. Ensure Roles
    const roles = ["SuperAdmin", "Admin", "Manager", "Staff", "Viewer"];
    for (const name of roles) {
        await prisma.role.upsert({
            where: { name },
            update: {},
            create: { name, description: `${name} role` },
        });
        console.log(`✅ Role ensured: ${name}`);
    }

    // 2. Ensure Plans
    const plans = [
        { name: "Free", slug: "free", price: 0, limits: { maxUsers: 5, maxWarehouses: 1 } },
        { name: "Pro", slug: "pro", price: 299000, limits: { maxUsers: 50, maxWarehouses: 10 } },
    ];

    for (const p of plans) {
        await prisma.plan.upsert({
            where: { slug: p.slug },
            update: {},
            create: {
                name: p.name,
                slug: p.slug,
                priceMonthly: p.price,
                priceYearly: p.price * 10,
                limits: p.limits,
                features: [],
            },
        });
        console.log(`✅ Plan ensured: ${p.name}`);
    }

    // 3. Ensure SuperAdmin User
    const superRole = await prisma.role.findUnique({ where: { name: "SuperAdmin" } });
    if (superRole) {
        const email = "superadmin@inventorypro.com";
        const password = await bcrypt.hash("admin123", 10);

        await prisma.user.upsert({
            where: { email },
            update: { password, roleId: superRole.id },
            create: {
                email,
                name: "Super Admin",
                password,
                roleId: superRole.id,
            },
        });
        console.log(`✅ SuperAdmin user ensured: ${email}`);
    }
}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());
