# Queue & Async Processing

Lumbung uses asynchronous queues to handle heavy, non-blocking, or multi-step operations.

## 1. Why use Queues?
- **Low Latency**: User doesn't wait for emails or complex stock recalculations.
- **Reliability**: Failed jobs (e.g., SMTP down) automatically retry with exponential backoff.
- **Scalability**: Workers can be scaled independently of the main API.

## 2. Default Stack: BullMQ
We use **BullMQ** (built on Redis) because:
- High performance (multi-producer/multi-consumer).
- Priority jobs support.
- Delay & scheduled jobs (e.g., reminder emails).
- Parent-child dependencies (Flow).

## 3. Recommended Jobs
| Job Name | Frequency | Target |
|----------|-----------|--------|
| `email-sender` | On Request | Sending PO/SO PDF via SMTP. |
| `inventory-summary-recalc` | Per movement | Updating de-normalized summary tables. |
| `low-stock-alert` | Filtered | Check threshold and notify manager. |
| `offline-sync-processor` | Batch | Process incoming batches from Web Client. |

## 4. The Outbox Pattern
To avoid distributed transaction failures (e.g., DB updated but Redis job failed to push), we use the **Outbox Pattern**.

### Workflow
1. **DB Transaction**:
   - Update `Product`.
   - Insert `OutboxEntry` { type: 'PRODUCT_UPDATED', payload: { id: 1 } }.
2. **Batch Processor** (Interval/Trigger):
   - Read `OutboxEntry` (status: PENDING).
   - Push to **BullMQ**.
   - Mark `OutboxEntry` as SUCCESS.

## 5. Alternative Message Queues (MQ)
| Service | Recommendation | Use Case |
|---------|----------------|----------|
| **Redis/BullMQ** | **Default** | High performance, simplicity, already in infra. |
| **RabbitMQ** | Optional | Advanced routing (Exchange/Binding), multi-language services. |
| **NATS** | Optional | Low latency requirements, ultra-simple pub/sub. |
| **Kafka** | Not Recommended | Overkill for this project. Use for massive event streaming (>10k events/sec). |

---

## 6. Worker Implementation Skeleton
```typescript
// backend/src/queue/worker.ts
import { Worker } from 'bullmq';

const worker = new Worker('inventory-summary', async job => {
  // 1. Recalculate totals
  // 2. Update stock_summary table
  // 3. Invalidate Redis cache
}, { connection: redisClient });
```

[Back to Architecture](./ARCHITECTURE.md) | [Database Schema](./DATABASE_SCHEMA.md)
