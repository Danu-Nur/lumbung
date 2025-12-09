
import { prisma } from "@/lib/prisma";
import { CreateCustomerParams, UpdateCustomerParams } from "@/types/domain";

export const customerService = {
    async createCustomer({
        organizationId,
        name,
        email,
        phone,
        address,
        city,
        taxId,
        notes,
    }: CreateCustomerParams) {
        // Check uniqueness
        const existing = await prisma.customer.findFirst({
            where: {
                organizationId,
                name: { equals: name, mode: 'insensitive' },
                deletedAt: null,
            },
        });

        if (existing) {
            throw new Error('Customer with this name already exists');
        }

        return await prisma.customer.create({
            data: {
                organizationId,
                name,
                email,
                phone,
                address,
                city,
                taxId,
                notes,
            },
        });
    },

    async updateCustomer({ id, organizationId, data }: UpdateCustomerParams) {
        const customer = await prisma.customer.findFirst({
            where: { id, organizationId, deletedAt: null },
        });

        if (!customer) {
            throw new Error('Customer not found');
        }

        if (data.name && data.name !== customer.name) {
            const existing = await prisma.customer.findFirst({
                where: {
                    organizationId,
                    name: { equals: data.name, mode: 'insensitive' },
                    deletedAt: null,
                    NOT: { id },
                },
            });

            if (existing) {
                throw new Error('Customer with this name already exists');
            }
        }

        return await prisma.customer.update({
            where: { id },
            data,
        });
    },

    async deleteCustomer({ id, organizationId }: { id: string; organizationId: string }) {
        const customer = await prisma.customer.findFirst({
            where: { id, organizationId, deletedAt: null },
        });

        if (!customer) {
            throw new Error('Customer not found');
        }

        // Check for sales orders
        const soCount = await prisma.salesOrder.count({
            where: { customerId: id },
        });

        if (soCount > 0) {
            throw new Error(`Cannot delete customer. They have ${soCount} sales orders.`);
        }

        return await prisma.customer.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    },

    async listCustomers({
        organizationId,
        page = 1,
        pageSize = 10,
        search = '',
    }: {
        organizationId: string;
        page?: number;
        pageSize?: number;
        search?: string;
    }) {
        const skip = (page - 1) * pageSize;
        const where = {
            organizationId,
            deletedAt: null,
            OR: search
                ? [
                    { name: { contains: search, mode: 'insensitive' as const } },
                    { email: { contains: search, mode: 'insensitive' as const } },
                    { phone: { contains: search, mode: 'insensitive' as const } },
                ]
                : undefined,
        };

        const [customers, total] = await prisma.$transaction([
            prisma.customer.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: pageSize,
            }),
            prisma.customer.count({ where }),
        ]);

        return {
            customers,
            total,
            totalPages: Math.ceil(total / pageSize),
        };
    },
};
