import { auth } from "@/lib/auth";
import { purchaseOrderService } from "@/lib/services/purchaseOrderService";
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
        const body = await req.json();
        const { receivedItems, notes } = body;

        if (!receivedItems || !Array.isArray(receivedItems)) {
            return new NextResponse("Missing receivedItems", { status: 400 });
        }

        const receipt = await purchaseOrderService.createPurchaseReceipt({
            purchaseOrderId: id,
            organizationId: session.user.organizationId,
            receivedItems,
            notes,
            userId: session.user.id,
        });

        return NextResponse.json(receipt);
    } catch (error: any) {
        console.error("[PURCHASE_ORDER_RECEIVE]", error);
        return new NextResponse(error.message || "Internal Error", { status: 500 });
    }
}
