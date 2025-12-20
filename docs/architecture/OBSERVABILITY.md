# Observability & Monitoring

Maintaining a healthy system requires clear insight into Redis performance, DB health, and application logs.

## 1. Structured Logging
Use `pino` (standard in Fastify) for JSON logs.
- Include `organizationId` and `correlationId` (Request ID) in every log.

## 2. Metrics to Track
| Metric | Source | Warning Threshold |
|--------|--------|-------------------|
| Cache Hit Rate | Redis | < 50% |
| Queue Lag | BullMQ | > 100 jobs pending |
| Worker Error Rate | BullMQ | > 5% failure |
| DB Query P95 | Postgres | > 200ms |

## 3. Redis Monitoring
Tools recommended:
- `RedisInsight`: For inspecting keys and performance.
- `BullMQ Board` (UI): For monitoring background jobs.

## 4. Health Checks
- `/api/health`: Verifies DB connection and Redis connectivity.

---

[Back to Architecture](./ARCHITECTURE.md)
