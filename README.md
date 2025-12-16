# Lumbung Microservices

This is the refactored microservices architecture for the Lumbung Inventory System.

## 📚 Documentation

**Complete documentation is available in the [`docs/`](./docs/) directory:**

- 🏗️ **Architecture**: [System Design](./docs/architecture/ARCHITECTURE.md) | [Database Schema](./docs/architecture/DATABASE.md)
- ⚙️ **Setup**: [Installation Guide](./docs/setup/SETUP.md) | [Project Status](./docs/setup/STATUS.md)
- ✨ **Features**: [Dashboard](./docs/features/DASHBOARD_REFACTOR.md) | [Offline Support](./docs/features/OFFLINE_SUPPORT.md)

👉 **[View Full Documentation Index](./docs/README.md)**

## Structure

- **`backend/`**: Node.js + Fastify API service. Handles Auth, Inventory, Products, and Orders.
- **`frontend/`**: Next.js 15 + React Application. Handles UI, Client-side logic, and Offline Sync (Dexie.js).
- **`docs/`**: Comprehensive documentation organized by category.
- **`docker-compose.yml`**: Orchestration for backend, frontend, postgres, and redis.

## Quick Start

### Prerequisites

- Node.js 18+
- Docker & Docker Compose (or Podman)
- PostgreSQL (if running locally without Docker)

### 1. Using Docker (Recommended)

```bash
# Clone the repository
cd lumbung-microservices

# Start all services
docker-compose up -d --build

# Initialize database (first time only)
docker exec -it lumbung-microservices-backend-1 npm run db:push

# Seed subscription plans (optional)
docker exec -it lumbung-microservices-backend-1 npm run seed:plans
```

**Access the application:**
- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend API: [http://localhost:4000](http://localhost:4000)
- Health Check: [http://localhost:4000/health](http://localhost:4000/health)

### 2. Running Locally

See [SETUP.md](./docs/setup/SETUP.md) for detailed local development instructions.

## Features

- ✅ **Microservices Architecture**: Separate Frontend and Backend
- ✅ **JWT Authentication**: Secure auth with HTTP-Only cookies
- ✅ **Offline Support**: Full offline functionality with IndexedDB caching
- ✅ **Organization Multi-tenancy**: Data isolation per organization
- ✅ **Real-time Updates**: Background sync when online
- ✅ **Type Safety**: End-to-end TypeScript support
- ✅ **Subscription Plans**: Free, Basic, Pro, Enterprise tiers
- ✅ **Dashboard Analytics**: Financial and operational insights

## Tech Stack

### Backend
- **Runtime**: Node.js 20
- **Framework**: Fastify
- **Database**: PostgreSQL + Prisma ORM
- **Cache**: Redis
- **Auth**: JWT (@fastify/jwt)

### Frontend
- **Framework**: Next.js 15 (App Router)
- **UI**: React 19 + Radix UI + Tailwind CSS
- **State**: React Query
- **Offline**: Dexie.js (IndexedDB)
- **i18n**: next-intl (English & Indonesian)

## Project Status

See [STATUS.md](./docs/setup/STATUS.md) for current implementation status and roadmap.

## Contributing

1. Read the [Architecture Guide](./docs/architecture/ARCHITECTURE.md)
2. Follow the [Setup Guide](./docs/setup/SETUP.md)
3. Check [Feature Documentation](./docs/features/) for implementation patterns

## License

MIT License - See LICENSE file for details

---

**Need help?** Check the [documentation](./docs/README.md) or review the [troubleshooting guide](./docs/setup/SETUP.md#troubleshooting).
