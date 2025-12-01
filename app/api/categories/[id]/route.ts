import { auth } from "@/lib/auth";
import { categoryService } from "@/lib/services/categoryService";
import { NextResponse } from "next/server";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user?.organizationId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { id } = await params;
        const category = await categoryService.getCategoryById({
            id,
            organizationId: session.user.organizationId,
        });

        if (!category) {
            return new NextResponse("Category not found", { status: 404 });
        }

        return NextResponse.json(category);
    } catch (error: any) {
        console.error("[CATEGORY_GET]", error);
        return new NextResponse(error.message || "Internal Error", { status: 500 });
    }
}

export async function PUT(
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
        const { name, description } = body;

        const updatedCategory = await categoryService.updateCategory({
            id,
            organizationId: session.user.organizationId,
            name,
            description,
        });

        return NextResponse.json(updatedCategory);
    } catch (error: any) {
        console.error("[CATEGORY_UPDATE]", error);
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
        const { searchParams } = new URL(req.url);
        const forceDelete = searchParams.get("forceDelete") === "true";

        // Default to soft delete
        await categoryService.deleteCategory({
            id,
            organizationId: session.user.organizationId,
            softDelete: true,
            forceDelete,
        });

        return new NextResponse(null, { status: 204 });
    } catch (error: any) {
        console.error("[CATEGORY_DELETE]", error);
        return new NextResponse(error.message || "Internal Error", { status: 500 });
    }
}
