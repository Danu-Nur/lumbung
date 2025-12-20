# Frontend & Backend Integration

Standardizing the communication bridge between the Next.js frontend and the Fastify backend.

## 1. Authentication
- **Strategy**: NextAuth.js on frontend.
- **Backend Verification**: Fastify uses `@fastify/jwt` to verify tokens passed in the `Authorization: Bearer <token>` header.
- **Session Sharing**: The `accessToken` contains the `organizationId` for tenant isolation.

## 2. API Design Patterns
- **Protocol**: RESTful JSON.
- **Error Handling**: Follow standard HTTP Status Codes.
  - `401`: Unauthorized (Login required).
  - `403`: Forbidden (Check Organization ID / Role).
  - `422`: Unprocessable Entity (Zod Validation Failure).

## 3. Realtime Updates
When the backend processes an async job (e.g., PO receipt complete), it signals the frontend:
- **Primary**: React Query invalidation triggered by API response.
- **Secondary (Planned)**: Redis Pub/Sub → WebSocket → Frontend Nudge.

## 4. Sync Batching
The frontend sends batches of offline actions to:
`POST /api/inventory/sync`
- Batch size: Max 50 items.
- Result: Returns a success map with Server IDs for client reconciliation.

---

[Back to Architecture](./ARCHITECTURE.md)
