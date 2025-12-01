import { auth } from "@/lib/auth";
import { pricingService } from "@/lib/services/pricingService";
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
        const { newPrice, notes } = body;

        if (newPrice === undefined) {
            return new NextResponse("Missing newPrice", { status: 400 });
        }

        const updatedProduct = await pricingService.updateProductCostPrice({
            productId: id,
            organizationId: session.user.organizationId,
            newPrice,
            userId: session.user.id,
            notes,
        });

        return NextResponse.json(updatedProduct);
    } catch (error: any) {
        console.error("[PRODUCT_UPDATE_COST_PRICE]", error);
        return new NextResponse(error.message || "Internal Error", { status: 500 });
    }
}
