import { PageTransition } from "@/components/shared/page-transition";

export default function DashboardTemplate({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <PageTransition>
            {children}
        </PageTransition>
    );
}
