export function serializeDecimal(value: any): number {
    if (value === null || value === undefined) return 0;
    // Handle Prisma Decimal or other object-wrapped numbers
    if (typeof value === 'object' && 'toNumber' in value) {
        return value.toNumber();
    }
    if (typeof value === 'object' && 'toString' in value) {
        return Number(value.toString());
    }
    return Number(value);
}

export function serializeProduct(product: any): any {
    if (!product) return null;
    return {
        ...product,
        sellingPrice: serializeDecimal(product.sellingPrice),
        costPrice: serializeDecimal(product.costPrice),
        lowStockThreshold: serializeDecimal(product.lowStockThreshold),
        inventoryItems: product.inventoryItems?.map((item: any) => ({
            ...item,
            unitCost: serializeDecimal(item.unitCost)
        })) || []
    };
}
