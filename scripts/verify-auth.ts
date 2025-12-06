import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    try {
        const email = "superadmin@inventorypro.com";
        const password = "admin123";

        console.log(`Testing auth for: ${email}`);

        const user = await prisma.user.findUnique({
            where: { email },
            include: { role: true },
        });

        if (!user) {
            console.error("❌ User not found in DB");
            return;
        }

        console.log(`✅ User found: ${user.email} (Role: ${user.role?.name})`);
        console.log(`Stored Hash: ${user.password}`);

        const isMatch = await bcrypt.compare(password, user.password);
        console.log(`bcrypt.compare('${password}', hash) result: ${isMatch}`);

        if (isMatch) {
            console.log("✅ Password matches! Auth logic should work.");
        } else {
            console.error("❌ Password does NOT match.");

            // Debug: Hash the password again to see what it looks like
            const newHash = await bcrypt.hash(password, 10);
            console.log(`New hash of '${password}': ${newHash}`);
        }
    } catch (error) {
        console.error("❌ Script Error:", error);
    }
}

// Force exit after 10s
setTimeout(() => {
    console.error("Timeout reached, exiting...");
    process.exit(1);
}, 10000);

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());
