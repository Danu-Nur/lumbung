import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fastify } from '../app.js';
import bcrypt from 'bcryptjs';

const prismaMock = vi.hoisted(() => ({
    user: {
        findUnique: vi.fn(),
    },
    organization: {
        findUnique: vi.fn()
    }
}));

vi.mock('../lib/prisma', () => ({
    prisma: prismaMock
}));

describe('Auth Endpoints', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should login successfully with correct credentials', async () => {
        // Setup
        const hashedPassword = await bcrypt.hash('password123', 10);
        const mockUser = {
            id: 'user-1',
            email: 'test@example.com',
            password: hashedPassword,
            role: 'ADMIN',
            organizationId: 'org-1'
        };

        prismaMock.user.findUnique.mockResolvedValue(mockUser);

        // Execute
        const response = await fastify.inject({
            method: 'POST',
            url: '/api/auth/login',
            payload: {
                email: 'test@example.com',
                password: 'password123'
            }
        });

        // Verify
        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.user.email).toBe('test@example.com');
        expect(response.headers['set-cookie']).toBeDefined();
    });

    it('should fail with incorrect password', async () => {
        // Setup
        const hashedPassword = await bcrypt.hash('password123', 10);
        const mockUser = {
            id: 'user-1',
            email: 'test@example.com',
            password: hashedPassword
        };

        prismaMock.user.findUnique.mockResolvedValue(mockUser);

        // Execute
        const response = await fastify.inject({
            method: 'POST',
            url: '/api/auth/login',
            payload: {
                email: 'test@example.com',
                password: 'wrongpassword'
            }
        });

        // Verify
        expect(response.statusCode).toBe(401);
        const body = JSON.parse(response.body);
        expect(body.error).toBe('Invalid credentials');
    });
});
