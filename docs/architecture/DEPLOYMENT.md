# Deployment & Infrastructure

The stack is designed for containerized deployment using Docker.

## 1. Topology
```mermaid
graph LR
    Traefik[Ingress/LB] --> Frontend
    Traefik --> Backend
    Backend --> DB[(PostgreSQL)]
    Backend --> Redis[(Redis)]
    Worker[Worker Service] --> Redis
    Worker --> DB
```

## 2. Environment Configuration
Crucial variables for production:
```env
# DB
DATABASE_URL=postgresql://user:password@host:5432/db

# Redis
REDIS_URL=redis://redis:6379

# Features
ENABLE_REDIS_CACHE=true
ENABLE_QUEUE=true
```

## 3. Scaling Strategy
- **Frontend**: Next.js is stateless, can scale horizontally behind a load balancer.
- **Backend**: Fastify is stateless, can scale horizontally.
- **Worker**: Scale horizontally to handle spike in job volume (e.g., massive CSV import).
- **DB/Redis**: Vertical scaling initially, then read-replicas for DB.

---

[Back to Architecture](./ARCHITECTURE.md)
