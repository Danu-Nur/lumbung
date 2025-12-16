import { auth } from "@/lib/auth";
import { redirect } from "@/i18n/routing";
import { ROLES } from "@/lib/rbac";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";

export default async function SuperAdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    // Strict check for SuperAdmin role
    // Using roleName as per build error feedback
    if (!session?.user || session.user.roleName !== ROLES.SUPER_ADMIN) {
        redirect({ href: "/", locale: "en" });
    }

    return (
        <div className="flex min-h-screen flex-col">
            <header className="sticky top-0 z-50 w-full border-b bg-destructive/10 backdrop-blur">
                <div className="container flex h-14 items-center">
                    <div className="mr-4 flex">
                        <Link href="/superadmin" className="mr-6 flex items-center space-x-2 font-bold text-destructive">
                            Lumbung SuperAdmin
                        </Link>
                        <nav className="flex items-center space-x-6 text-sm font-medium">
                            <Link href="/superadmin/organizations" className="transition-colors hover:text-foreground/80">
                                Organizations
                            </Link>
                            <Link href="/superadmin/users" className="transition-colors hover:text-foreground/80">
                                Global Users
                            </Link>
                        </nav>
                    </div>
                    <div className="ml-auto flex items-center space-x-4">
                        <Link href="/dashboard">
                            <Button variant="outline" size="sm">Exit to App</Button>
                        </Link>
                    </div>
                </div>
            </header>
            <main className="flex-1 container py-6">{children}</main>
        </div>
    );
}
