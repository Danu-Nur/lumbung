/**
 * Recursively converts Prisma Decimal objects to plain numbers
 * to ensure JSON serialization works correctly.
 * 
 * Uses duck typing (checking for toNumber method) instead of instanceof
 * to handle cases where Decimal class comes from different module instances.
 */
export function serializeData<T>(data: T): T {
    if (data === null || data === undefined) {
        return data;
    }

    // Check for Decimal-like objects (duck typing)
    if (typeof data === 'object' && data !== null && 'toNumber' in data && typeof (data as any).toNumber === 'function') {
        return (data as any).toNumber() as unknown as T;
    }

    if (data instanceof Date) {
        return data.toISOString() as unknown as T;
    }

    if (Array.isArray(data)) {
        return data.map(item => serializeData(item)) as unknown as T;
    }

    if (typeof data === 'object') {
        const result: any = {};
        for (const key in data) {
            if (Object.prototype.hasOwnProperty.call(data, key)) {
                result[key] = serializeData((data as any)[key]);
            }
        }
        return result as T;
    }

    return data;
}
