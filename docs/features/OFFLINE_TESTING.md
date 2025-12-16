# Testing Offline Functionality

## Quick Test Guide

### Test 1: Verify Cache Storage
1. **Login** to the dashboard
2. **Open DevTools** (F12) → Console tab
3. **Run this command**:
```javascript
// Check if data is cached
const db = await window.indexedDB.databases();
console.log('Databases:', db);

// Open LumbungDB
const request = indexedDB.open('LumbungDB', 2);
request.onsuccess = (e) => {
  const db = e.target.result;
  const tx = db.transaction('dashboardCache', 'readonly');
  const store = tx.objectStore('dashboardCache');
  const getAll = store.getAll();
  getAll.onsuccess = () => {
    console.log('Cached dashboard data:', getAll.result);
  };
};
```

### Test 2: Simulate Offline Mode
1. **Visit dashboard** while online (data loads normally)
2. **Open DevTools** → Network tab
3. **Select "Offline"** from throttling dropdown
4. **Refresh page** (F5)
5. **Expected Result**: 
   - Dashboard shows cached data
   - Offline indicator appears in bottom-right
   - Console shows "Using cached data" messages

### Test 3: Stop Backend
```bash
# Stop backend container
docker compose stop backend

# Visit dashboard - should show cached data
# Start backend again
docker compose start backend
```

### Test 4: Network Disconnect
1. **Load dashboard** (data caches)
2. **Disconnect WiFi/Ethernet**
3. **Refresh page**
4. **Expected**: Offline indicator + cached data
5. **Reconnect network**
6. **Refresh page**
7. **Expected**: Indicator disappears, fresh data loads

## Expected Behavior

### ✅ When Online
- No offline indicator
- Fresh data from API
- Data cached in IndexedDB
- Console: "API call successful"

### ✅ When Offline (with cache)
- Amber offline indicator visible
- Cached data displayed
- Console: "Using cached data for [key]"
- Timestamps show cache age

### ✅ When Offline (no cache)
- Amber offline indicator visible
- Fallback data (zeros/empty arrays)
- Console: "No cache available, using fallback"

## Verification Checklist

- [ ] Dashboard loads when online
- [ ] Data is cached in IndexedDB
- [ ] Offline indicator appears when offline
- [ ] Cached data displays when offline
- [ ] Indicator disappears when back online
- [ ] Fresh data loads when back online
- [ ] No errors in console
- [ ] Cache expires after 5 minutes

## Console Messages to Look For

### Success Messages
```
✓ API call successful for dashboard-stats
✓ Cached data in IndexedDB
```

### Offline Messages
```
⚠ API call failed for dashboard-stats, trying cache
ℹ Using cached data for dashboard-stats (age: 45s)
```

### Error Messages (if no cache)
```
✗ No cache available for dashboard-stats, using fallback
```

## Common Issues

### Issue: "Cannot read property 'dashboardCache'"
**Cause**: Database version mismatch
**Fix**: Clear IndexedDB and refresh
```javascript
indexedDB.deleteDatabase('LumbungDB');
```

### Issue: Offline indicator not showing
**Cause**: Browser still thinks it's online
**Fix**: Use DevTools Network tab "Offline" mode

### Issue: Cache not persisting
**Cause**: Private/Incognito mode
**Fix**: Use normal browser window

## Performance Check

### Cache Hit Rate
```javascript
// Monitor cache performance
let apiCalls = 0;
let cacheHits = 0;

// Check console logs for:
// "API call successful" → apiCalls++
// "Using cached data" → cacheHits++

// Calculate hit rate
const hitRate = (cacheHits / (apiCalls + cacheHits)) * 100;
console.log(`Cache hit rate: ${hitRate}%`);
```

### Expected Hit Rate
- **First load**: 0% (all API calls)
- **Refresh within 5 min**: 100% (all cache hits)
- **After 5 min**: 0% (cache expired, new API calls)

## Success Criteria

✅ **Test passes if**:
1. Dashboard works online
2. Dashboard works offline with cached data
3. Offline indicator shows when offline
4. No JavaScript errors
5. Data refreshes when back online

❌ **Test fails if**:
1. Dashboard blank when offline
2. JavaScript errors in console
3. Offline indicator doesn't appear
4. Cache doesn't persist
5. Data doesn't refresh when online

## Next Steps After Testing

If all tests pass:
- ✅ Offline support is working correctly
- ✅ Ready to refactor other pages
- ✅ Can implement offline write queue

If tests fail:
- Check browser console for errors
- Verify IndexedDB is enabled
- Check network tab for failed requests
- Review OFFLINE_SUPPORT.md for troubleshooting
