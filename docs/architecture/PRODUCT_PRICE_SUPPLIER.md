# Product Price & Supplier Management - Implementation Guide

## Overview

Sistem ini telah diperbaiki untuk mengelola harga dan supplier dengan lebih terstruktur menggunakan:
- **ProductPriceHistory** untuk tracking perubahan harga jual
- **InventoryItem** untuk tracking supplier dan cost per batch
- **Product cache fields** untuk performance

## Architecture

### Data Flow

```
Product (Master Data + Cache)
├─ sellingPrice (cache) ← ProductPriceHistory (source of truth)
├─ costPrice (cache)    ← InventoryItem.unitCost weighted avg
└─ supplierId (cache)   ← Most frequent supplier from InventoryItem

ProductPriceHistory
└─ All selling price changes with history

InventoryItem (Batch)
├─ supplierId    → Supplier for this batch
├─ unitCost      → Cost for this batch
├─ warehouseId   → Location of this batch
└─ quantityOnHand → Stock quantity
```

## Database Schema Changes

### Product Model
```prisma
model Product {
  // CACHE FIELDS (deprecated as source of truth)
  supplierId   String?  // CACHE: Most frequent supplier
  sellingPrice Decimal  // CACHE: from ProductPriceHistory
  costPrice    Decimal  // CACHE: weighted avg from InventoryItem.unitCost
  
  // Relations
  priceHistory ProductPriceHistory[]
  inventoryItems InventoryItem[]
}
```

### ProductPriceHistory (NEW - already exists)
```prisma
model ProductPriceHistory {
  id          String
  productId   String
  priceType   PriceType  // SELLING | COST
  price       Decimal
  effectiveAt DateTime
  notes       String?
  createdById String
}
```

### InventoryItem (ENHANCED)
```prisma
model InventoryItem {
  productId      String
  warehouseId    String
  supplierId     String?   // ✅ Now properly set
  unitCost       Decimal   // ✅ Now properly set
  quantityOnHand Int
  batchNumber    String?   // ✅ Now properly set
  receivedDate   DateTime  // ✅ Now properly set
}
```

## API Changes

### Creating Product
```typescript
// Before: Only set cache fields
await ProductService.createProduct({
  sellingPrice: 100000,
  costPrice: 75000,
  supplierId: 'xxx'
});

// After: Also creates ProductPriceHistory & proper InventoryItem
// ProductPriceHistory entry created automatically
// InventoryItem gets supplierId, unitCost, batchNumber
```

### Updating Selling Price
```typescript
// NEW METHOD
await ProductService.updateSellingPrice(
  productId,
  organizationId,
  newPrice: 120000,
  userId,
  notes: 'Price increase due to supplier change'
);
// Creates history entry + updates cache
```

### Calculating Average Cost
```typescript
// NEW METHOD
await ProductService.updateAverageCost(productId, organizationId);
// Called automatically after receiving stock
// Calculates weighted average from all batches
```

### Getting Current Price
```typescript
// NEW METHOD
const price = await ProductService.getCurrentSellingPrice(productId);
// Returns from history, falls back to cache
```

### Getting Price History
```typescript
// NEW METHOD
const history = await ProductService.getPriceHistory(productId, 'SELLING');
// Returns all price changes with timestamps
```

## Usage Examples

### 1. Create Product with Initial Stock
```typescript
const product = await ProductService.createProduct({
  name: 'Oli Yamalube Sport 1L',
  sku: 'OIL-YAM-SPT-1L',
  sellingPrice: 100000,  // Creates ProductPriceHistory entry
  costPrice: 75000,       // Set in InventoryItem.unitCost
  supplierId: 'supplier-abc',  // Set in InventoryItem.supplierId
  initialStock: 50,
  warehouseId: 'warehouse-123'
});

// Result:
// ✅ Product created
// ✅ ProductPriceHistory entry: 100000 IDR
// ✅ InventoryItem: supplier=supplier-abc, cost=75000, qty=50, batch=INIT-OIL-YAM-SPT-1L
```

### 2. Receive Stock from Purchase Order
```typescript
// When receiving PO
await prisma.inventoryItem.create({
  data: {
    productId,
    warehouseId,
    supplierId: 'supplier-xyz',  // Different supplier!
    unitCost: 80000,              // Different cost!
    quantityOnHand: 100,
    batchNumber: 'PO-2024-001',
    receivedDate: new Date()
  }
});

// Update average cost
await ProductService.updateAverageCost(productId, organizationId);
// New avgCost = (50 * 75000 + 100 * 80000) / 150 = 78,333
```

### 3. Change Selling Price
```typescript
await ProductService.updateSellingPrice(
  productId,
  organizationId,
  newPrice: 110000,
  userId,
  notes: 'Market price adjustment'
);

// Result:
// ✅ New ProductPriceHistory entry created
// ✅ Product.sellingPrice cache updated
```

### 4. Query Supplier History
```typescript
const product = await prisma.product.findUnique({
  where: { id: productId },
  include: {
    inventoryItems: {
      where: { quantityOnHand: { gt: 0 } },
      include: { supplier: true }
    }
  }
});

// Shows all suppliers who currently have stock
product.inventoryItems.forEach(item => {
  console.log(`${item.supplier.name}: ${item.quantityOnHand} pcs @ ${item.unitCost}`);
});
```

## Benefits

### 1. Data Integrity
- ✅ Price history preserved
- ✅ Supplier tracking per batch
- ✅ Cost tracking per batch
- ✅ Audit trail for all changes

### 2. Flexibility
- ✅ Multiple suppliers per product
- ✅ Different costs per batch
- ✅ Price changes over time
- ✅ Batch/lot tracking

### 3. Reporting
- ✅ Price trend analysis
- ✅ Profit margin calculation (selling - avg cost)
- ✅ Supplier performance by batch
- ✅ Cost variance analysis

### 4. Performance
- ✅ Cache fields for fast queries
- ✅ No JOIN needed for product lists
- ✅ History only loaded when needed

## Migration Notes

### Backward Compatibility
- ✅ Product.sellingPrice still exists (as cache)
- ✅ Product.costPrice still exists (as cache)
- ✅ Product.supplierId still exists (as cache)
- ✅ Existing code continues to work

### Gradual Migration
1. ✅ New products automatically use new system
2. ✅ Existing products can continue using cache
3. Future: Backfill ProductPriceHistory for existing products
4. Future: Backfill InventoryItem.supplier for existing stock

## Frontend Impact

### Minimal Changes Required
- Product creation form: No changes needed
- Product list: No changes needed (uses cache)
- Price updates: Use new API endpoint
- Supplier indicators: Already using InventoryItem.supplierId ✅

### New Features Enabled
- Price history chart
- Supplier performance dashboard
- Cost variance reports
- Profit margin trends

## Testing

### Test Scenarios
1. ✅ Create product with initial stock
2. ✅ Receive stock from different suppliers
3. ✅ Update selling price
4. ✅ Calculate average cost
5. ✅ View supplier history
6. ✅ View price history

### Data Verification
```sql
-- Check price history
SELECT * FROM product_price_history WHERE product_id = 'xxx' ORDER BY effective_at DESC;

-- Check inventory batches
SELECT 
  ii.batch_number,
  ii.quantity_on_hand,
  ii.unit_cost,
  s.name as supplier_name
FROM inventory_items ii
LEFT JOIN suppliers s ON s.id = ii.supplier_id
WHERE ii.product_id = 'xxx';

-- Verify cache consistency
SELECT 
  p.selling_price as cached_price,
  (SELECT price FROM product_price_history 
   WHERE product_id = p.id AND price_type = 'SELLING' 
   ORDER BY effective_at DESC LIMIT 1) as latest_price
FROM products p WHERE p.id = 'xxx';
```

## Conclusion

This implementation provides:
- ✅ Better data structure
- ✅ Historical tracking
- ✅ Batch/supplier flexibility
- ✅ Backward compatibility
- ✅ Performance optimization
- ✅ Future extensibility

All while maintaining existing functionality and minimal frontend changes.
