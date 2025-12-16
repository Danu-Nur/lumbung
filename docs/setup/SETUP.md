# Lumbung Microservices - Setup Complete

## Summary of Changes

### Backend (Port 4000)
1. **Subscription API Endpoints**:
   - `GET /api/plans` - Public endpoint to fetch all available subscription plans
   - `GET /api/subscriptions/:organizationId` - Protected endpoint to get organization subscription

2. **Controllers Created**:
   - `backend/src/controllers/subscription.ts` - Handles subscription and plan queries

3. **Routes Created**:
   - `backend/src/routes/subscription.ts` - Subscription route definitions

4. **Port Configuration**:
   - Backend now runs on **port 4000** (changed from 3001)
   - Updated in `Dockerfile`, `docker-compose.yml`, and `app.ts`

### Frontend (Port 3000)
1. **Fixed Next-Intl Configuration**:
   - Added `next-intl` plugin to `next.config.ts`
   - Replaced `middleware.ts` with `proxy.ts` for Next.js 16 compatibility
   - Configured `postcss.config.mjs` for Tailwind v4 support

2. **Refactored Services to Use Backend API**:
   - `subscriptionService.ts` - Now calls backend API instead of Prisma
   - `productService.ts` - Added token parameter support
   - `inventoryService.ts` - Added token parameter support
   - `categoryService.ts` - Added token parameter support
   - `supplierService.ts` - Added token parameter support
   - `warehouseService.ts` - Created new service for warehouse operations

3. **Updated Server Actions**:
   - All actions now retrieve JWT token from cookies
   - Pass token to service layer for API authentication
   - Files updated:
     - `features/warehouses/actions.ts`
     - `features/inventory/actions.ts`
     - `features/categories/actions.ts`
     - `features/suppliers/actions.ts`

### Docker Configuration
1. **docker-compose.yml** updated:
   - Backend port: `4000:4000`
   - Frontend API URL: `http://localhost:4000/api`
   - Added required environment variables (JWT_SECRET, DATABASE_URL, etc.)

2. **Dockerfiles** updated:
   - Backend exposes port 4000
   - Frontend includes `next.config.ts` for standalone builds

## Running the Application

### Option 1: Docker/Podman (Recommended)
```bash
cd lumbung-microservices

# Start all services
docker-compose up -d --build

# Initialize database (first time only)
docker exec -it lumbung-microservices-backend-1 npm run db:push

# View logs
docker-compose logs -f
```

### Option 2: Local Development
```bash
# Terminal 1 - Backend
cd backend
npm install
npx prisma generate
npx prisma db push
npm run dev

# Terminal 2 - Frontend
cd frontend
npm install
npm run dev
```

## Access Points
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000
- **Health Check**: http://localhost:4000/health

## Environment Variables Required

### Backend (.env)
```env
DATABASE_URL=postgresql://user:password@localhost:5432/lumbung
JWT_SECRET=your_jwt_secret
AUTH_SECRET=your_jwt_secret
PORT=4000
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
DATABASE_URL=postgresql://user:password@localhost:5432/lumbung
NEXTAUTH_SECRET=your_jwt_secret
AUTH_SECRET=your_jwt_secret
```

## Architecture Notes

### Microservices Separation
- **Frontend**: Next.js app that handles UI and client-side logic
  - Uses Server Actions to call backend API
  - No direct database access
  - Authentication via JWT tokens stored in cookies

- **Backend**: Fastify API that handles all data operations
  - Direct database access via Prisma
  - JWT-based authentication
  - Organization-scoped data access

### Authentication Flow
1. User logs in via frontend → calls `POST /api/auth/login`
2. Backend validates credentials and returns JWT token
3. Frontend stores token in HTTP-only cookie
4. Server Actions retrieve token from cookies
5. Token passed to API calls via Authorization header
6. Backend verifies token and extracts user/organization info

### Data Access Pattern
```
Frontend Component
    ↓
Server Action (gets token from cookies)
    ↓
Service Layer (passes token to API)
    ↓
Backend API (validates token, filters by organizationId)
    ↓
Database (via Prisma)
```

## Troubleshooting

### Frontend shows "Unauthorized" error
- Ensure you're logged in
- Check that token cookie is set (DevTools → Application → Cookies)
- Verify backend is running on port 4000

### Backend database connection error
- Ensure PostgreSQL is running
- Check DATABASE_URL in backend/.env
- Run `npx prisma db push` to sync schema

### "Cannot find module" errors
- Run `npm install` in both frontend and backend
- Run `npx prisma generate` in backend

### Port conflicts
- Backend uses port 4000
- Frontend uses port 3000
- PostgreSQL uses port 5432
- Redis uses port 6379

## Next Steps
1. Seed the database with initial data (plans, roles, permissions)
2. Test all CRUD operations
3. Implement remaining API endpoints as needed
4. Add comprehensive error handling
5. Set up production environment variables
