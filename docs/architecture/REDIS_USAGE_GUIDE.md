# Redis Usage Guide

Redis is the high-performance backbone for Lumbung, handling caching, job queue storage, and messaging.

## 1. Connection Design
We use a **Singleton** pattern for Redis connection to avoid leaking sockets and ensure connection reuse across the Fastify instance.

- **File**: `backend/src/lib/redis.ts`
- **Provider**: `ioredis`

## 2. Key Design Patterns
Keys must be namespaced by Tenant (Organization) to ensure data isolation.

| Pattern | Example Key | Purpose |
|---------|-------------|---------|
| `tenant:{tid}:product:{pid}` | `tenant:cl123:product:p456` | Product details cache. |
| `tenant:{tid}:inventory:stats` | `tenant:cl123:inventory:stats` | Summary dashboard counts. |
| `tenant:{tid}:warehouse:{wid}:stock` | `tenant:cl123:warehouse:w789:stock` | List of stock in warehouse. |
| `bull:{job_name}:*` | `bull:inventory-sync:*` | Internal BullMQ keys. |

## 3. Usage Pattern: Cache-Aside
Always try to read from Redis first, then fallback to DB and populate cache.

```typescript
// Proposed Helper
const data = await cache.getOrSet(`tenant:${tid}:product:${pid}`, async () => {
    return await prisma.product.findUnique({ where: { id: pid } });
});
```

## 4. Cache Invalidation
Whenever data changes, the cache MUST be invalidated.
- **Immediate**: Delete key directly on write.
- **Async**: Emit an event to a worker to clear related keys (e.g., clear stats when a movement is created).

## 5. Graceful Degradation
If Redis is down, the system should **NOT** crash. 
- All `cache.get` should catch errors and log them, falling back to DB.
- BullMQ naturally handles reconnection.

---

## 6. Realtime Features (Pub/Sub)
Used for SSE (Server-Sent Events) or WebSockets to nudge the frontend when critical data changes.
- `PUBLISH inventory_updated { "organizationId": "...", "warehouseId": "..." }`

## 7. Configuration
```env
REDIS_URL=redis://localhost:6379
REDIS_MAX_RETRIES=3
REDIS_RECONNECT_INTERVAL=1000
```

[Back to Architecture](./ARCHITECTURE.md) | [Queue Guide](./QUEUE_ASYNC_PROCESSING.md)
