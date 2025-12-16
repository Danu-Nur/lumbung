# Lumbung Microservices

This is the refactored microservices architecture for the Lumbung Inventory System.

## Structure

- **`backend/`**: Node.js + Fastify API service. Handles Auth, Inventory, Products, and Orders.
- **`frontend/`**: Next.js 15 + React Application. Handles UI, Client-side logic, and Offline Sync (Dexie.js).
- **`docs/`**: Detailed documentation.
    - [Architecture](./docs/ARCHITECTURE.md)
    - [Database Schema](./docs/DATABASE.md)
- **`docker-compose.yml`**: Orchestration for backend, frontend, postgres, and redis.

## Prerequisites

- Node.js 18+
- Docker & Docker Compose
- PostgreSQL (if running locally without Docker)

## Getting Started

### 1. Using Docker (Recommended)

```bash
docker-compose up --build
```

Access the application:
- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend API: [http://localhost:3001](http://localhost:3001)

### 2. Running Locally

#### Database Setup
Ensure you have a PostgreSQL database running and update `backend/.env`.

#### Backend
```bash
cd backend
npm install
npx prisma generate
npx prisma db push # or migrate dev
npm run dev
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Features Implemented

- **Microservices Architecture**: Separate Frontend and Backend.
- **Authentication**: JWT-based auth with HTTP-Only cookies.
- **Offline Support**: Products are cached locally using Dexie.js. Offline inputs are queued.
- **Background Sync**: A background service automatically syncs offline orders when online.
- **Type Safety**: End-to-end TypeScript support.
