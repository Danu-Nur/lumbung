import { FastifyReply, FastifyRequest } from 'fastify';
import { prisma } from '../lib/prisma.js';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});

export async function loginHandler(req: FastifyRequest, reply: FastifyReply) {
    try {
        const { email, password } = loginSchema.parse(req.body);

        const user = await prisma.user.findUnique({
            where: { email },
            include: { organization: true, role: true }
        });

        if (!user || !user.password) {
            return reply.code(401).send({ error: 'Invalid credentials' });
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return reply.code(401).send({ error: 'Invalid credentials' });
        }

        // Generate JWT
        const token = await reply.jwtSign({
            id: user.id,
            email: user.email,
            role: user.role.name,
            organizationId: user.organizationId
        });

        // Set Cookie
        reply.setCookie('token', token, {
            path: '/',
            secure: false, // Set true in production
            httpOnly: true,
            sameSite: 'lax'
        });

        return { token, user: { id: user.id, name: user.name, email: user.email } };

    } catch (error) {
        if (error instanceof z.ZodError) {
            return reply.code(400).send({ error: error.errors });
        }
        req.log.error(error);
        return reply.code(500).send({ error: 'Internal Server Error' });
    }
}
