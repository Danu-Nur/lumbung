import { auth } from "@/lib/auth";
import { categoryService } from "@/lib/services/categoryService";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.organizationId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const search = searchParams.get("q") || undefined;
        const page = Number(searchParams.get("page")) || 1;
        const pageSize = Number(searchParams.get("pageSize")) || 10;

        const result = await categoryService.listCategories({
            organizationId: session.user.organizationId,
            search,
            page,
            pageSize,
        });

        return NextResponse.json(result);
    } catch (error: any) {
        console.error("[CATEGORIES_GET]", error);
        return new NextResponse(error.message || "Internal Error", { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.organizationId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { name, description } = body;

        if (!name) {
            return new NextResponse("Name is required", { status: 400 });
        }

        const category = await categoryService.createCategory({
            organizationId: session.user.organizationId,
            name,
            description,
            createdById: session.user.id,
        });

        return NextResponse.json(category);
    } catch (error: any) {
        console.error("[CATEGORIES_CREATE]", error);
        return new NextResponse(error.message || "Internal Error", { status: 500 });
    }
}
