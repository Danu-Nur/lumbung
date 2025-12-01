import { auth } from "@/lib/auth";
import { productService } from "@/lib/services/productService";
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
        const { supplierId } = body;

        if (!supplierId) {
            return new NextResponse("Missing supplierId", { status: 400 });
        }

        const updatedProduct = await productService.setProductDefaultSupplier({
            productId: id,
            supplierId,
            organizationId: session.user.organizationId,
        });

        return NextResponse.json(updatedProduct);
    } catch (error: any) {
        console.error("[PRODUCT_SET_SUPPLIER]", error);
        return new NextResponse(error.message || "Internal Error", { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user?.organizationId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { id } = await params;

        const updatedProduct = await productService.clearProductDefaultSupplier({
            productId: id,
            organizationId: session.user.organizationId,
        });

        return NextResponse.json(updatedProduct);
    } catch (error: any) {
        console.error("[PRODUCT_CLEAR_SUPPLIER]", error);
        return new NextResponse(error.message || "Internal Error", { status: 500 });
    }
}
