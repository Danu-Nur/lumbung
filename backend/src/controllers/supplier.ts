
import { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';

const supplierSchema = z.object({
    name: z.string().min(1),
    email: z.string().email().optional().or(z.literal('')),
    phone: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    taxId: z.string().optional(),
    notes: z.string().optional(),
});

export const createSupplierHandler = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
        const user = req.user as { organizationId: string };
        const organizationId = user.organizationId;

        const data = supplierSchema.parse(req.body);

        // Check Unique
        const existing = await prisma.supplier.findFirst({
            where: {
                organizationId,
                name: { equals: data.name, mode: 'insensitive' },
                deletedAt: null
            }
        });
        if (existing) return reply.code(409).send({ error: 'Supplier already exists' });

        const supplier = await prisma.supplier.create({
            data: {
                ...data,
                organizationId
            }
        });

        return reply.code(201).send(supplier);
    } catch (error) {
        if (error instanceof z.ZodError) return reply.code(400).send({ error: error.errors });
        req.log.error(error);
        return reply.code(500).send({ error: 'Internal Server Error' });
    }
};

export const updateSupplierHandler = async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
        const user = req.user as { organizationId: string };
        const organizationId = user.organizationId;
        const { id } = req.params;

        const data = supplierSchema.partial().parse(req.body);

        const supplier = await prisma.supplier.findFirst({
            where: { id, organizationId, deletedAt: null }
        });
        if (!supplier) return reply.code(404).send({ error: 'Supplier not found' });

        if (data.name && data.name !== supplier.name) {
            const existing = await prisma.supplier.findFirst({
                where: {
                    organizationId,
                    name: { equals: data.name, mode: 'insensitive' },
                    deletedAt: null,
                    NOT: { id }
                }
            });
            if (existing) return reply.code(409).send({ error: 'Supplier name taken' });
        }

        const updated = await prisma.supplier.update({
            where: { id },
            data
        });
        return reply.send(updated);
    } catch (error) {
        req.log.error(error);
        return reply.code(500).send({ error: 'Internal Server Error' });
    }
};

export const deleteSupplierHandler = async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
        const user = req.user as { organizationId: string };
        const organizationId = user.organizationId;
        const { id } = req.params;

        const supplier = await prisma.supplier.findFirst({ where: { id, organizationId, deletedAt: null } });
        if (!supplier) return reply.code(404).send({ error: 'Supplier not found' });

        // Checks
        const productCount = await prisma.product.count({ where: { supplierId: id } });
        if (productCount > 0) return reply.code(409).send({ error: `Supplier assigned to ${productCount} products.` });

        const poCount = await prisma.purchaseOrder.count({ where: { supplierId: id } });
        if (poCount > 0) return reply.code(409).send({ error: `Supplier has ${poCount} Purchase Orders.` });

        await prisma.supplier.update({
            where: { id },
            data: { deletedAt: new Date() }
        });
        return reply.send({ success: true });
    } catch (error) {
        req.log.error(error);
        return reply.code(500).send({ error: 'Internal Server Error' });
    }
};
