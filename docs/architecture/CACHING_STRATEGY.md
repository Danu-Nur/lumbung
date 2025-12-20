# Caching Strategy

Efficiency is achieved by minimizing direct database hits through multi-layered caching.

## 1. Frontend Caching (Client-Side)
- **Library**: `@tanstack/react-query`.
- **Strategy**: Stale-While-Revalidate (SWR).
- **TTL**: 1 minute for list data, 5 minutes for master data (Categories, Warehouses).

## 2. Backend Caching (Server-Side)
- **Library**: `ioredis`.
- **Layer**: Service Level (Repository pattern).
- **Toggle**: `process.env.ENABLE_REDIS_CACHE`.

### Key Cacheable Data:
1. **Organization Settings**: Read frequently, rarely changes.
2. **Product Details**: Individual product viewing.
3. **Inventory Summaries**: High-traffic dashboard data.

## 3. Invalidation Matrix
| Action | Invalidate Key | Secondary Action |
|--------|----------------|------------------|
| Update Product | `product:{id}` | Clear `inventory:stats` |
| New Stock Movement | `warehouse:{id}:stock` | Recalculate Summary via Queue |
| Create Category | `category:list` | - |

## 4. Cache Anti-Stampede
To prevent "Cache Stampede" (many requests hitting DB at once when cache expires), we use:
- **Jitter**: Randomized TTL (e.g., $3600 \pm 300$ seconds).
- **Locking**: Only the first request fetches from DB, others wait or return stale (if applicable).

---

## 5. Performance Monitoring
Target Cache Hit Ratio: **>70%**.
Monitor hits/misses via Redis `INFO stats`.

[Redevelopment Guide](./ARCHITECTURE.md)
