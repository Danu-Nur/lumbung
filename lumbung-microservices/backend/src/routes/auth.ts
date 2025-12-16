import { FastifyInstance } from 'fastify';
import { loginHandler } from '../controllers/auth.js';

export async function authRoutes(fastify: FastifyInstance) {
    fastify.post('/login', loginHandler);
}
