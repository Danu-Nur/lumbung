export function serializeDecimal(value: any): number {
    if (value === null || value === undefined) return 0;
    // Handle Prisma Decimal or other object-wrapped numbers
    if (typeof value === 'object' && 'toNumber' in value && typeof value.toNumber === 'function') {
        return value.toNumber();
    }
    if (typeof value === 'object' && 'toString' in value) {
        return Number(value.toString());
    }
    return Number(value);
}

/**
 * Recursively serialize any object, converting Decimal-like objects to numbers
 * and Date objects to ISO strings.
 */
export function serializeAny(value: any): any {
    if (value === null || value === undefined) {
        return value;
    }

    // Check for Decimal-like objects (duck typing)
    if (typeof value === 'object' && 'toNumber' in value && typeof value.toNumber === 'function') {
        return value.toNumber();
    }

    // Handle Date objects
    if (value instanceof Date) {
        return value.toISOString();
    }

    // Handle Arrays
    if (Array.isArray(value)) {
        return value.map(item => serializeAny(item));
    }

    // Handle plain objects
    if (typeof value === 'object') {
        const result: any = {};
        for (const key in value) {
            if (Object.prototype.hasOwnProperty.call(value, key)) {
                result[key] = serializeAny(value[key]);
            }
        }
        return result;
    }

    return value;
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
