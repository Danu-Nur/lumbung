
import { auth } from '@/lib/auth';
import { notFound, redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getTranslations } from 'next-intl/server';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { OpnameExecutionTable } from '@/components/domain/inventory/tables/opname-execution-table';
import { ArrowLeft, Play, CheckCircle, Ban } from 'lucide-react';
import Link from 'next/link';
import { startOpname, completeOpname, cancelOpname } from '@/lib/actions/opname';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { SerializedStockOpnameItem } from '@/types/serialized';

interface OpnamePageProps {
    params: Promise<{ id: string; locale: string }>;
}

export default async function OpnamePage({ params }: OpnamePageProps) {
    const { id } = await params;
    const session = await auth();
    const t = await getTranslations('opname.show');
    const tStatus = await getTranslations('opname.status');

    if (!session?.user || !session.user.organizationId) {
        redirect('/login');
    }

    const opname = await prisma.stockOpname.findUnique({
        where: { id, organizationId: session.user.organizationId },
        include: {
            warehouse: true,
            items: {
                include: {
                    product: true
                },
                orderBy: {
                    product: { name: 'asc' }
                }
            },
            createdBy: true
        }
    });

    if (!opname) {
        notFound();
    }

    // Serialize items for client component
    const serializedItems: SerializedStockOpnameItem[] = opname.items.map((item: any) => ({
        ...item,
        product: {
            ...item.product,
            sellingPrice: Number(item.product.sellingPrice),
            costPrice: Number(item.product.costPrice),
        }
    }));

    const handleStart = async () => {
        "use server";
        await startOpname(id);
    };

    const handleComplete = async () => {
        "use server";
        await completeOpname(id);
    };

    const handleCancel = async () => {
        "use server";
        await cancelOpname(id);
    }

    let statusColor = "bg-slate-500";
    if (opname.status === 'IN_PROGRESS') statusColor = "bg-blue-500";
    if (opname.status === 'COMPLETED') statusColor = "bg-green-500";
    if (opname.status === 'CANCELLED') statusColor = "bg-red-500";

    return (
        <div className="w-full space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/inventory?view=opname">
                        <Button variant="outline" size="icon">
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                    </Link>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold tracking-tight">
                                {t('title', { number: opname.opnameNumber })}
                            </h1>
                            <Badge className={statusColor}>
                                {tStatus(opname.status)}
                            </Badge>
                        </div>
                        <p className="text-slate-500">
                            {opname.warehouse.name} • {format(opname.date, 'PPP')}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {opname.status === 'DRAFT' && (
                        <form action={handleStart}>
                            <Button type="submit">
                                <Play className="w-4 h-4 mr-2" />
                                {t('start')}
                            </Button>
                        </form>
                    )}
                    {opname.status === 'IN_PROGRESS' && (
                        <>
                            <form action={handleCancel}>
                                <Button variant="destructive" type="submit">
                                    <Ban className="w-4 h-4 mr-2" />
                                    {t('cancel')}
                                </Button>
                            </form>
                            <form action={handleComplete}>
                                <Button type="submit" variant="default" className="bg-green-600 hover:bg-green-700 text-white">
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    {t('finalize')}
                                </Button>
                            </form>
                        </>
                    )}
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{t('product')}</CardTitle>
                    <CardDescription>
                        {opname.status === 'DRAFT'
                            ? "Start the opname to load products and current system quantities."
                            : `${opname.items.length} products loaded.`}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {opname.status === 'DRAFT' ? (
                        <div className="py-8 text-center text-slate-500">
                            Click "Start Opname" to begin the counting process.
                        </div>
                    ) : (
                        <OpnameExecutionTable items={serializedItems} status={opname.status} />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
