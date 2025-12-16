import 'fastify';

declare module 'fastify' {
    interface FastifyRequest {
        user: {
            id: string;
            email: string;
            role: string;
            organizationId: string;
        };
    }

    interface FastifyInstance {
        authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    }
}
