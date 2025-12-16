import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { fastify } from '../app.js';

describe('Health Check', () => {
    it('should return 200 OK', async () => {
        const response = await fastify.inject({
            method: 'GET',
            url: '/health'
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.status).toBe('ok');
    });
});
