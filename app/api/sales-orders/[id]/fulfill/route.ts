import { auth } from "@/lib/auth";
import { salesOrderService } from "@/lib/services/salesOrderService";
import { NextResponse } from "next/server";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user?.organizationId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { id } = await params;

        const salesOrder = await salesOrderService.fulfillSalesOrder(
            id,
            session.user.organizationId,
            session.user.id
        );

        return NextResponse.json(salesOrder);
    } catch (error: any) {
        console.error("[SALES_ORDER_FULFILL]", error);
        return new NextResponse(error.message || "Internal Error", { status: 500 });
    }
}
