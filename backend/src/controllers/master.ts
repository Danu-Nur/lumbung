
import { FastifyRequest, FastifyReply } from 'fastify';
import { MasterService } from '../services/master.js';


export const getCategoriesHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const user = request.user as { organizationId: string };
        const { page = '1', pageSize = '10', q = '' } = request.query as any;

        const result = await MasterService.getCategories(user.organizationId, {
            page: parseInt(page),
            pageSize: parseInt(pageSize),
            q
        });

        return reply.send(result);
    } catch (error) {
        request.log.error(error);
        return reply.status(500).send({ error: 'Failed to fetch categories' });
    }
};

export const getWarehousesHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const user = request.user as { organizationId: string };
        const { page = '1', pageSize = '10', q = '' } = request.query as any;

        const result = await MasterService.getWarehouses(user.organizationId, {
            page: parseInt(page),
            pageSize: parseInt(pageSize),
            q
        });

        return reply.send(result);
    } catch (error) {
        request.log.error(error);
        return reply.status(500).send({ error: 'Failed to fetch warehouses' });
    }
};

export const getSuppliersHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const user = request.user as { organizationId: string };
        const { page = '1', pageSize = '10', q = '' } = request.query as any;

        const result = await MasterService.getSuppliers(user.organizationId, {
            page: parseInt(page),
            pageSize: parseInt(pageSize),
            q
        });

        return reply.send(result);
    } catch (error) {
        request.log.error(error);
        return reply.status(500).send({ error: 'Failed to fetch suppliers' });
    }
};
