import { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { MasterService } from '../services/master.js';

const customerSchema = z.object({
    name: z.string().min(1),
    email: z.string().email().optional().or(z.literal('')),
    phone: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    taxId: z.string().optional(),
    notes: z.string().optional(),
});

export const createCustomerHandler = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
        const user = req.user as { organizationId: string };
        const organizationId = user.organizationId;

        const data = customerSchema.parse(req.body);

        const existing = await prisma.customer.findFirst({
            where: {
                organizationId,
                name: { equals: data.name, mode: 'insensitive' },
                deletedAt: null
            }
        });
        if (existing) return reply.code(409).send({ error: 'Customer already exists' });

        const customer = await prisma.customer.create({
            data: {
                ...data,
                organizationId
            }
        });

        await MasterService.invalidateMasterCache(organizationId, 'customers');

        return reply.code(201).send(customer);
    } catch (error) {
        if (error instanceof z.ZodError) return reply.code(400).send({ error: error.errors });
        req.log.error(error);
        return reply.code(500).send({ error: 'Internal Server Error' });
    }
};

export const getCustomersHandler = async (req: FastifyRequest<{ Querystring: { page?: string; pageSize?: string; q?: string } }>, reply: FastifyReply) => {
    try {
        const user = req.user as { organizationId: string };
        const organizationId = user.organizationId;
        const page = parseInt(req.query.page || '1');
        const pageSize = parseInt(req.query.pageSize || '10');
        const q = req.query.q || '';

        const customers = await MasterService.getCustomers(organizationId, { page, pageSize, q });
        return reply.send(customers);
    } catch (error) {
        req.log.error(error);
        return reply.code(500).send({ error: 'Internal Server Error' });
    }
};

export const updateCustomerHandler = async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
        const user = req.user as { organizationId: string };
        const organizationId = user.organizationId;
        const { id } = req.params;

        const data = customerSchema.partial().parse(req.body);

        const customer = await prisma.customer.findFirst({
            where: { id, organizationId, deletedAt: null }
        });
        if (!customer) return reply.code(404).send({ error: 'Customer not found' });

        if (data.name && data.name !== customer.name) {
            const existing = await prisma.customer.findFirst({
                where: {
                    organizationId,
                    name: { equals: data.name, mode: 'insensitive' },
                    deletedAt: null,
                    NOT: { id }
                }
            });
            if (existing) return reply.code(409).send({ error: 'Customer name taken' });
        }

        const updated = await prisma.customer.update({
            where: { id },
            data
        });

        await MasterService.invalidateMasterCache(organizationId, 'customers');

        return reply.send(updated);
    } catch (error) {
        req.log.error(error);
        return reply.code(500).send({ error: 'Internal Server Error' });
    }
};

export const deleteCustomerHandler = async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
        const user = req.user as { organizationId: string };
        const organizationId = user.organizationId;
        const { id } = req.params;

        const customer = await prisma.customer.findFirst({ where: { id, organizationId, deletedAt: null } });
        if (!customer) return reply.code(404).send({ error: 'Customer not found' });

        const soCount = await prisma.salesOrder.count({ where: { customerId: id } });
        if (soCount > 0) return reply.code(409).send({ error: `Customer has ${soCount} Sales Orders.` });

        await prisma.customer.update({
            where: { id },
            data: { deletedAt: new Date() }
        });

        await MasterService.invalidateMasterCache(organizationId, 'customers');

        return reply.send({ success: true });
    } catch (error) {
        req.log.error(error);
        return reply.code(500).send({ error: 'Internal Server Error' });
    }
};
