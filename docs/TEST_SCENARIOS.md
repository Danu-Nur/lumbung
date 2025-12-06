# Test Scenarios - SaaS & Performance

## 1. Performance Layer
**Goal**: Verify that the application works with and without Redis.

### Scenario 1.1: Default Mode (Memory/Inline)
- **Setup**: Set `FEATURE_PERF_CACHE=false` and `FEATURE_PERF_QUEUE=false` in `.env`.
- **Action**: Login, browse dashboard, create an item.
- **Expected**: Everything works normally. No errors in console.

### Scenario 1.2: Redis Mode
- **Setup**: Set `FEATURE_PERF_CACHE=true`, `FEATURE_PERF_QUEUE=true`, `REDIS_URL=...`.
- **Action**: Login, browse dashboard.
- **Expected**: Data is cached (faster subsequent loads).
- **Action**: Trigger email (e.g., low stock).
- **Expected**: Job is enqueued in Redis (check via CLI or GUI) and processed by worker.

## 2. Subscription & Limits
**Goal**: Verify plan enforcement.

### Scenario 2.1: Free Plan Limits
- **Setup**: Ensure organization is on "Free" plan (max 5 users).
- **Action**: Attempt to invite the 6th user.
- **Expected**: Error message "Plan limit reached".

### Scenario 2.2: Upgrade to Pro
- **Setup**: Log in as Superadmin.
- **Action**: Go to Organization details, switch plan to "Pro".
- **Expected**: Plan updates immediately.
- **Action**: Log in as Org Admin, verify "Pro" badge in Billing settings.
- **Action**: Invite 6th user.
- **Expected**: Success.

## 3. Superadmin Dashboard
**Goal**: Verify global oversight.

### Scenario 3.1: Access Control
- **Action**: Log in as normal Org Admin.
- **Action**: Navigate to `/superadmin`.
- **Expected**: Redirected to home or error page (Access Denied).

### Scenario 3.2: Global Stats
- **Action**: Log in as Superadmin.
- **Expected**: See total count of organizations and users across the system.

## 4. Email Notifications
**Goal**: Verify alerts.

### Scenario 4.1: Low Stock Alert
- **Setup**: Product X has threshold 10. Current stock 12.
- **Action**: Create Sales Order for 5 units of Product X.
- **Expected**: Stock drops to 7. Email sent to Org Admin.
- **Verification**: Check logs or inbox.

### Scenario 4.2: User Preferences
- **Setup**: User disables "Low Stock" alerts in DB (manually for now).
- **Action**: Trigger low stock.
- **Expected**: No email sent to that user.
