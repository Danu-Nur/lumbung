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

        const user = req.user as { organizationId: string; id: string };

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

export async function getProductsHandler(req: FastifyRequest<{ Querystring: { page?: string; pageSize?: string; q?: string } }>, reply: FastifyReply) {
    try {
        if (!req.user) return reply.code(401).send({ error: 'Unauthorized' });

        const user = req.user as { organizationId: string };
        const page = parseInt(req.query.page || '1');
        const pageSize = parseInt(req.query.pageSize || '10');
        const search = req.query.q || '';

        const result = await ProductService.getProducts(user.organizationId, page, pageSize, search);
        return result;
    } catch (error) {
        req.log.error(error);
        return reply.code(500).send({ error: 'Internal Server Error' });
    }
}

export async function updateProductHandler(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
        if (!req.user) return reply.code(401).send({ error: 'Unauthorized' });
        const user = req.user as { organizationId: string; id: string };
        const { id } = req.params;

        const data = createProductSchema.partial().parse(req.body);

        const updated = await ProductService.updateProduct(id, user.organizationId, {
            ...data,
            organizationId: user.organizationId,
            userId: user.id
        });

        return reply.send(updated);
    } catch (error) {
        if (error instanceof z.ZodError) return reply.code(400).send({ error: error.errors });
        if (error instanceof Error && error.message === 'SKU already exists') {
            return reply.code(409).send({ error: error.message });
        }
        req.log.error(error);
        return reply.code(500).send({ error: 'Internal Server Error' });
    }
}

export async function deleteProductHandler(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
        if (!req.user) return reply.code(401).send({ error: 'Unauthorized' });
        const user = req.user as { organizationId: string; id: string };
        const { id } = req.params;

        await ProductService.deleteProduct(id, user.organizationId, user.id);

        return reply.send({ success: true });
    } catch (error) {
        if (error instanceof Error && error.message.includes('stock')) {
            return reply.code(409).send({ error: error.message });
        }
        req.log.error(error);
        return reply.code(500).send({ error: 'Internal Server Error' });
    }
}
