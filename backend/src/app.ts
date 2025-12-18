import Fastify, { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import cookie from '@fastify/cookie';
import { authRoutes } from './routes/auth.js';
import { inventoryRoutes } from './routes/inventory.js';
import { productRoutes } from './routes/product.js';
import { orderRoutes } from './routes/order.js';
import { masterRoutes } from './routes/master.js';
import { subscriptionRoutes } from './routes/subscription.js';
import { dashboardRoutes } from './routes/dashboard.js';
import { marketingRoutes } from './routes/marketing.js';

const fastify = Fastify({
    logger: true
});

// Plugins
fastify.register(cors, {
    origin: true,
    credentials: true
});

fastify.register(jwt, {
    secret: process.env.AUTH_SECRET || 'supersecret'
});

fastify.register(cookie, {
    secret: process.env.AUTH_SECRET || 'supersecret',
    hook: 'onRequest',
    parseOptions: {}
});

fastify.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        await request.jwtVerify();
    } catch (err) {
        reply.send(err);
    }
});

// Routes
fastify.register(authRoutes, { prefix: '/api/auth' });
fastify.register(inventoryRoutes, { prefix: '/api/inventory' });
fastify.register(productRoutes, { prefix: '/api/products' });
fastify.register(orderRoutes, { prefix: '/api/orders' });
fastify.register(masterRoutes, { prefix: '/api' });
fastify.register(subscriptionRoutes, { prefix: '/api' });
fastify.register(dashboardRoutes, { prefix: '/api' });
fastify.register(marketingRoutes, { prefix: '/api' });

// Health Check
fastify.get('/health', async (request, reply) => {
    return { status: 'ok', timestamp: new Date() };
});

// Run the server
// Run the server only if run directly
import { fileURLToPath } from 'url';

const start = async () => {
    try {
        const port = parseInt(process.env.PORT || '4000');
        await fastify.listen({ port, host: '0.0.0.0' });
        console.log(`Server listening on http://localhost:${port}`);
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

// Check if file is run directly (ES Modules way)
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    start();
}

export { fastify };
