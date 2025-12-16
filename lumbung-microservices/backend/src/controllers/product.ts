import { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { ProductService } from '../services/product.js';

const createProductSchema = z.object({
    name: z.string().min(1),
    sku: z.string().min(1),
    barcode: z.string().optional(),
    description: z.string().optional(),
    categoryId: z.string().optional(),
    supplierId: z.string().optional(),
    unit: z.string().min(1),
    sellingPrice: z.number().min(0),
    costPrice: z.number().min(0),
    lowStockThreshold: z.number().int().optional(),
    initialStock: z.number().int().min(0).optional(),
    warehouseId: z.string().optional(),
});

export async function createProductHandler(req: FastifyRequest, reply: FastifyReply) {
    try {
        if (!req.user) return reply.code(401).send({ error: 'Unauthorized' });

        const data = createProductSchema.parse(req.body);

        const user = req.user as any;

        const product = await ProductService.createProduct({
            ...data,
            organizationId: user.organizationId,
            userId: user.id
        });

        return product;
    } catch (error) {
        if (error instanceof z.ZodError) {
            return reply.code(400).send({ error: error.errors });
        }
        // Handle 'SKU already exists'
        if (error instanceof Error && error.message === 'SKU already exists') {
            return reply.code(409).send({ error: error.message });
        }
        req.log.error(error);
        return reply.code(500).send({ error: 'Internal Server Error' });
    }
}

export async function getProductsHandler(req: FastifyRequest, reply: FastifyReply) {
    try {
        if (!req.user) return reply.code(401).send({ error: 'Unauthorized' });

        const user = req.user as any;
        const products = await ProductService.getProducts(user.organizationId);
        return products;
    } catch (error) {
        req.log.error(error);
        return reply.code(500).send({ error: 'Internal Server Error' });
    }
}
