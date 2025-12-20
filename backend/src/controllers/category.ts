
import { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { MasterService } from '../services/master.js';

const createCategorySchema = z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    organizationId: z.string().optional(),
});

const updateCategorySchema = z.object({
    name: z.string().min(1).optional(),
    description: z.string().optional(),
});

export const createCategoryHandler = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
        const user = req.user as { organizationId: string };
        const organizationId = user.organizationId;

        const data = createCategorySchema.parse(req.body);

        // Check Duplicates
        const existing = await prisma.category.findFirst({
            where: {
                organizationId,
                name: { equals: data.name, mode: 'insensitive' },
                deletedAt: null,
            },
        });

        if (existing) {
            return reply.code(409).send({ error: 'Category with this name already exists' });
        }

        const category = await prisma.category.create({
            data: {
                name: data.name,
                description: data.description,
                organizationId,
            }
        });

        await MasterService.invalidateMasterCache(organizationId, 'categories');

        return reply.code(201).send(category);
    } catch (error) {
        if (error instanceof z.ZodError) return reply.code(400).send({ error: error.errors });
        req.log.error(error);
        return reply.code(500).send({ error: 'Internal Server Error' });
    }
}

export const updateCategoryHandler = async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
        const user = req.user as { organizationId: string };
        const organizationId = user.organizationId;
        const { id } = req.params;

        const data = updateCategorySchema.parse(req.body);

        const category = await prisma.category.findFirst({
            where: { id, organizationId, deletedAt: null }
        });

        if (!category) return reply.code(404).send({ error: 'Category not found' });

        if (data.name && data.name !== category.name) {
            const existing = await prisma.category.findFirst({
                where: {
                    organizationId,
                    name: { equals: data.name, mode: 'insensitive' },
                    deletedAt: null,
                    NOT: { id }
                }
            });
            if (existing) return reply.code(409).send({ error: 'Category name taken' });
        }

        const updated = await prisma.category.update({
            where: { id },
            data: {
                name: data.name,
                description: data.description
            }
        });

        await MasterService.invalidateMasterCache(organizationId, 'categories');

        return reply.send(updated);
    } catch (error) {
        req.log.error(error);
        return reply.code(500).send({ error: 'Internal Server Error' });
    }
}

export const deleteCategoryHandler = async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
        const user = req.user as { organizationId: string };
        const organizationId = user.organizationId;
        const { id } = req.params;

        const category = await prisma.category.findFirst({
            where: { id, organizationId, deletedAt: null }
        });
        if (!category) return reply.code(404).send({ error: 'Category not found' });

        // Check products
        const productCount = await prisma.product.count({
            where: { categoryId: id }
        });

        if (productCount > 0) {
            return reply.code(409).send({ error: `Cannot delete category with ${productCount} assigned products.` });
        }

        await prisma.category.update({
            where: { id },
            data: { deletedAt: new Date() }
        });

        await MasterService.invalidateMasterCache(organizationId, 'categories');

        return reply.send({ success: true });
    } catch (error) {
        req.log.error(error);
        return reply.code(500).send({ error: 'Internal Server Error' });
    }
}
