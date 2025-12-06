import { PageTransition } from "@/components/shared/page-transition";

export default function AuthTemplate({
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
