import { auth } from "@/lib/auth";
import { salesOrderService } from "@/lib/services/salesOrderService";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.organizationId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { customerId, warehouseId, items, notes } = body;

        if (!customerId || !warehouseId || !items || !Array.isArray(items)) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        const salesOrder = await salesOrderService.createSalesOrderDraft({
            organizationId: session.user.organizationId,
            customerId,
            warehouseId,
            items,
            notes,
            createdById: session.user.id,
        });

        return NextResponse.json(salesOrder);
    } catch (error: any) {
        console.error("[SALES_ORDER_CREATE]", error);
        return new NextResponse(error.message || "Internal Error", { status: 500 });
    }
}
