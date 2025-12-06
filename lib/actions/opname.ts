"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { StockOpnameStatus, AdjustmentReason } from "@prisma/client";

export async function createOpname(formData: FormData) {
    const session = await auth();
    if (!session?.user?.id || !session.user.organizationId) {
        throw new Error("Unauthorized");
    }

    const warehouseId = formData.get("warehouseId") as string;
    const notes = formData.get("notes") as string;

    if (!warehouseId) {
        throw new Error("Warehouse is required");
    }

    // Generate Opname Number
    const count = await prisma.stockOpname.count({
        where: { organizationId: session.user.organizationId }
    });
    const opnameNumber = `SO-${new Date().getFullYear()}-${(count + 1).toString().padStart(4, '0')}`;

    const opname = await prisma.stockOpname.create({
        data: {
            opnameNumber,
            warehouseId,
            notes,
            organizationId: session.user.organizationId,
            createdById: session.user.id,
            status: "DRAFT"
        }
    });

    revalidatePath("/inventory?view=opname");
    return { success: true, id: opname.id };
}

export async function startOpname(opnameId: string) {
    const session = await auth();
    if (!session?.user?.organizationId) throw new Error("Unauthorized");

    const opname = await prisma.stockOpname.findUnique({
        where: { id: opnameId },
        include: { warehouse: true }
    });

    if (!opname) throw new Error("Opname not found");
    if (opname.status !== "DRAFT") throw new Error("Opname already started");

    // Fetch all products
    const products = await prisma.product.findMany({
        where: { organizationId: session.user.organizationId, deletedAt: null },
        include: {
            inventoryItems: {
                where: { warehouseId: opname.warehouseId }
            }
        }
    });

    // Create Opname Items snapshot
    await prisma.$transaction(async (tx) => {
        for (const product of products) {
            const currentStock = product.inventoryItems[0]?.quantityOnHand || 0;

            await tx.stockOpnameItem.create({
                data: {
                    opnameId: opname.id,
                    productId: product.id,
                    systemQty: currentStock,
                    actualQty: null // Not counted yet
                }
            });
        }

        await tx.stockOpname.update({
            where: { id: opnameId },
            data: { status: "IN_PROGRESS" }
        });
    });

    revalidatePath(`/inventory/opname/${opnameId}`);
}

export async function saveOpnameItem(itemId: string, actualQty: number) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    const item = await prisma.stockOpnameItem.findUnique({
        where: { id: itemId }
    });

    if (!item) throw new Error("Item not found");

    const difference = actualQty - item.systemQty;

    await prisma.stockOpnameItem.update({
        where: { id: itemId },
        data: {
            actualQty,
            difference
        }
    });

    revalidatePath("/inventory/opname/[id]");
}

export async function completeOpname(opnameId: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const opname = await prisma.stockOpname.findUnique({
        where: { id: opnameId },
        include: { items: true }
    });

    if (!opname) throw new Error("Opname not found");
    if (opname.status !== "IN_PROGRESS") throw new Error("Opname not in progress");

    // Process adjustments
    await prisma.$transaction(async (tx) => {
        for (const item of opname.items) {
            if (item.actualQty !== null && item.difference !== 0 && item.difference !== null) {
                const isIncrease = item.difference > 0;
                const absQty = Math.abs(item.difference);

                // Create Adjustment
                await tx.stockAdjustment.create({
                    data: {
                        productId: item.productId,
                        warehouseId: opname.warehouseId,
                        adjustmentType: isIncrease ? "increase" : "decrease",
                        quantity: absQty,
                        reason: "AUDIT", // Using AUDIT as generic Opname reason
                        notes: `Generated from Opname ${opname.opnameNumber}`,
                        organizationId: opname.organizationId,
                        createdById: session.user.id,
                        reference: opname.opnameNumber
                    }
                });

                // Update Inventory Item
                if (isIncrease) {
                    await tx.inventoryItem.upsert({
                        where: {
                            productId_warehouseId: {
                                productId: item.productId,
                                warehouseId: opname.warehouseId
                            }
                        },
                        create: {
                            productId: item.productId,
                            warehouseId: opname.warehouseId,
                            quantityOnHand: absQty,
                            availableQty: absQty
                        },
                        update: {
                            quantityOnHand: { increment: absQty },
                            availableQty: { increment: absQty }
                        }
                    });
                } else {
                    await tx.inventoryItem.update({
                        where: {
                            productId_warehouseId: {
                                productId: item.productId,
                                warehouseId: opname.warehouseId
                            }
                        },
                        data: {
                            quantityOnHand: { decrement: absQty },
                            availableQty: { decrement: absQty }
                        }
                    });
                }

                // Construct Inventory Movement
                await tx.inventoryMovement.create({
                    data: {
                        productId: item.productId,
                        warehouseId: opname.warehouseId,
                        movementType: "ADJUST",
                        quantity: isIncrease ? absQty : -absQty,
                        referenceType: "StockOpname",
                        referenceId: opname.id,
                        notes: `Opname ${opname.opnameNumber}`,
                        createdById: session.user.id
                    }
                });
            }
        }

        await tx.stockOpname.update({
            where: { id: opnameId },
            data: { status: "COMPLETED" }
        });
    });

    revalidatePath(`/inventory/opname/${opnameId}`);
    redirect("/inventory?view=opname");
}

export async function cancelOpname(opnameId: string) {
    await prisma.stockOpname.update({
        where: { id: opnameId },
        data: { status: "CANCELLED" }
    });
    revalidatePath("/inventory?view=opname");
}
