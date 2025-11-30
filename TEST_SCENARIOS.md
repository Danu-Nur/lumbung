# Inventory Pro - Test Scenarios

## 🧪 Comprehensive Test Plan

This document contains detailed test scenarios for all features of Inventory Pro.

---

## Test Scenario 1: User Authentication & Registration

### Test 1.1: Login with Existing User
**Steps:**
1. Navigate to http://localhost:3000
2. Should redirect to `/login`
3. Enter email: `admin@demowarehouse.com`
4. Enter password: `admin123`
5. Click "Sign In"

**Expected Results:**
- ✅ Redirects to `/dashboard`
- ✅ Shows user name in topbar: "Admin User"
- ✅ Shows organization: "Demo Warehouse Co."
- ✅ Sidebar shows all menu items

### Test 1.2: Register New Organization
**Steps:**
1. Navigate to `/register`
2. Fill form:
   - Organization Name: "Test Company Ltd"
   - Your Name: "Test Admin"
   - Email: "admin@testcompany.com"
   - Password: "test123456"
   - Confirm Password: "test123456"
3. Click "Create Account"

**Expected Results:**
- ✅ Shows success message
- ✅ Redirects to `/login` after 2 seconds
- ✅ Can login with new credentials

### Test 1.3: Logout
**Steps:**
1. Click user menu in topbar
2. Click "Logout"

**Expected Results:**
- ✅ Redirects to `/login`
- ✅ Cannot access `/dashboard` without login

---

## Test Scenario 2: Product Management

### Test 2.1: View Product List
**Steps:**
1. Login as admin
2. Click "Inventory" in sidebar

**Expected Results:**
- ✅ Shows 4 products from seed data
- ✅ Displays: Name, SKU, Category, Price, Total Stock
- ✅ Low stock items highlighted (if any)
- ✅ "Add Product" button visible

### Test 2.2: Create New Product
**Steps:**
1. Navigate to "Inventory" → Click "Add Product"
2. Fill form:
   - Name: "Gaming Keyboard RGB"
   - SKU: "ELEC-KEY-001"
   - Barcode: "1234567890999"
   - Description: "Mechanical gaming keyboard"
   - Category: "Electronics"
   - Unit: "pcs"
   - Selling Price: 850000
   - Cost Price: 600000
   - Low Stock Threshold: 10
3. Click "Create Product"

**Expected Results:**
- ✅ Redirects to `/inventory`
- ✅ New product appears in list
- ✅ Shows correct details

### Test 2.3: Edit Product
**Steps:**
1. In inventory list, click "View" on "Gaming Keyboard RGB"
2. Change Selling Price to 900000
3. Click "Save Changes"

**Expected Results:**
- ✅ Shows success message
- ✅ Price updated in list
- ✅ Stock summary shows new price

### Test 2.4: Delete Product
**Steps:**
1. View product detail page
2. Click "Delete" button
3. Confirm deletion

**Expected Results:**
- ✅ Redirects to inventory list
- ✅ Product removed from list
- ✅ Soft deleted (still in database)

---

## Test Scenario 3: Stock Adjustments

### Test 3.1: Increase Stock
**Steps:**
1. Navigate to "Adjustments" → "New Adjustment"
2. Fill form:
   - Product: "Laptop Dell XPS 13"
   - Warehouse: "Main Warehouse"
   - Type: "Increase Stock"
   - Quantity: 15
   - Reason: "FOUND"
   - Notes: "Found in storage room B"
3. Click "Create Adjustment"

**Expected Results:**
- ✅ Redirects to adjustments list
- ✅ Adjustment appears with green badge
- ✅ Shows +15 quantity
- ✅ Dashboard shows recent change
- ✅ Product stock increased by 15

### Test 3.2: Decrease Stock
**Steps:**
1. Create new adjustment
2. Select same product
3. Type: "Decrease Stock"
4. Quantity: 5
5. Reason: "DAMAGE"
6. Notes: "Water damage"

**Expected Results:**
- ✅ Adjustment shows red badge
- ✅ Shows -5 quantity
- ✅ Product stock decreased by 5

### Test 3.3: Verify Inventory Movement
**Steps:**
1. Go to Dashboard
2. Check "Recent Inventory Changes"

**Expected Results:**
- ✅ Shows both movements (ADJUST type)
- ✅ Correct quantities (+15, -5)
- ✅ Shows user who created

---

## Test Scenario 4: Sales Orders

### Test 4.1: Create Sales Order
**Steps:**
1. Navigate to "Sales Orders" → "New Order"
2. Select Customer: "PT. Maju Jaya"
3. Select Warehouse: "Main Warehouse"
4. Add items:
   - Select "Laptop Dell XPS 13" → Click "Add"
   - Set Quantity: 2
   - Price auto-filled: 15000000
   - Discount: 500000
5. Add another item:
   - Select "Wireless Mouse Logitech" → Click "Add"
   - Quantity: 5
   - Price: 350000
   - Discount: 0
6. Notes: "Urgent order - deliver by Friday"
7. Click "Create Order"

**Expected Results:**
- ✅ Shows calculated totals correctly
- ✅ Subtotal: (2 × 15000000) + (5 × 350000) = 31,750,000
- ✅ Discount: 500,000
- ✅ Total: 31,250,000
- ✅ Order created with status "DRAFT"

### Test 4.2: View Sales Order Detail
**Steps:**
1. In sales orders list, click "View" on new order

**Expected Results:**
- ✅ Shows order number (SO-XXXXXX)
- ✅ Lists all items with quantities and prices
- ✅ Shows customer info
- ✅ Shows warehouse
- ✅ Status badge shows "DRAFT"
- ✅ "Confirm Order" button visible

### Test 4.3: Confirm Sales Order
**Steps:**
1. On order detail page, click "Confirm Order"

**Expected Results:**
- ✅ Status changes to "CONFIRMED"
- ✅ "Fulfill Order" button now visible
- ✅ Order list shows updated status

### Test 4.4: Fulfill Sales Order
**Steps:**
1. Click "Fulfill Order"

**Expected Results:**
- ✅ Status changes to "FULFILLED"
- ✅ Inventory movements created (OUT type)
- ✅ Stock decreased:
  - Laptop: -2 units
  - Mouse: -5 units
- ✅ Dashboard shows movements

### Test 4.5: View & Print Invoice
**Steps:**
1. On order detail, click "View Invoice"
2. Verify invoice content
3. Click "Print Invoice" or Ctrl+P

**Expected Results:**
- ✅ Shows professional invoice layout
- ✅ Company header with details
- ✅ Customer billing info
- ✅ Itemized list with prices
- ✅ Correct totals
- ✅ Print dialog opens
- ✅ Print preview looks clean

---

## Test Scenario 5: Purchase Orders

### Test 5.1: Create Purchase Order
**Steps:**
1. Navigate to "Purchase Orders" → "New PO"
2. Select Supplier: "PT. Global Electronics"
3. Select Warehouse: "Main Warehouse"
4. Add items:
   - Product: "Laptop Dell XPS 13"
   - Quantity: 30
   - Unit Cost: 12000000
5. Add another:
   - Product: "Desk Lamp LED"
   - Quantity: 50
   - Unit Cost: 300000
6. Notes: "Monthly restock"
7. Click "Create PO"

**Expected Results:**
- ✅ Total: (30 × 12000000) + (50 × 300000) = 375,000,000
- ✅ PO created with status "DRAFT"
- ✅ Shows in PO list

### Test 5.2: View PO Detail
**Steps:**
1. Click "View" on new PO

**Expected Results:**
- ✅ Shows PO number (PO-XXXXXX)
- ✅ Lists items with costs
- ✅ Shows supplier info
- ✅ Received quantities: 0/30, 0/50
- ✅ Status: "DRAFT"

### Test 5.3: Send PO to Supplier
**Steps:**
1. Manually update status to "SENT" (via form action)

**Expected Results:**
- ✅ Status changes to "SENT"
- ✅ "Receive Items" button visible

### Test 5.4: Receive Purchase Order
**Steps:**
1. Click "Receive Items"

**Expected Results:**
- ✅ Status changes to "COMPLETED"
- ✅ Inventory movements created (IN type)
- ✅ Stock increased:
  - Laptop: +30 units
  - Desk Lamp: +50 units
- ✅ Received quantities updated: 30/30, 50/50
- ✅ Dashboard shows movements

---

## Test Scenario 6: Stock Transfers

### Test 6.1: Create Stock Transfer
**Steps:**
1. Navigate to "Transfers" → "New Transfer"
2. From Warehouse: "Main Warehouse"
3. To Warehouse: "Secondary Warehouse"
4. Add items:
   - Product: "Office Chair Executive"
   - Quantity: 10
5. Notes: "Rebalancing inventory"
6. Click "Create Transfer"

**Expected Results:**
- ✅ Transfer created with status "DRAFT"
- ✅ Shows transfer number (TR-XXXXXX)
- ✅ Appears in transfers list

### Test 6.2: View Transfer Detail
**Steps:**
1. Click "View" on new transfer

**Expected Results:**
- ✅ Shows from/to warehouses
- ✅ Lists items with quantities
- ✅ Status: "DRAFT"

### Test 6.3: Set Transfer In Transit
**Steps:**
1. Manually update status to "IN_TRANSIT"

**Expected Results:**
- ✅ Status changes to "IN_TRANSIT"
- ✅ "Complete Transfer" button visible

### Test 6.4: Complete Transfer
**Steps:**
1. Click "Complete Transfer"

**Expected Results:**
- ✅ Status changes to "COMPLETED"
- ✅ Two inventory movements created:
  - TRANSFER_OUT from Main (-10)
  - TRANSFER_IN to Secondary (+10)
- ✅ Stock in Main Warehouse decreased by 10
- ✅ Stock in Secondary Warehouse increased by 10
- ✅ Dashboard shows both movements

---

## Test Scenario 7: Dashboard & Reporting

### Test 7.1: Verify Dashboard Stats
**Steps:**
1. Navigate to Dashboard
2. Check all stat cards

**Expected Results:**
- ✅ Total Products: Shows correct count
- ✅ Total Stock Value: Calculated correctly
- ✅ Active Orders: Shows count
- ✅ Low Stock Items: Shows count

### Test 7.2: Low Stock Widget
**Steps:**
1. Check "Low Stock Items" widget

**Expected Results:**
- ✅ Shows products below threshold
- ✅ Displays current stock vs threshold
- ✅ Red indicator for low items

### Test 7.3: Recent Inventory Changes
**Steps:**
1. Check "Recent Inventory Changes" table

**Expected Results:**
- ✅ Shows last 10 movements
- ✅ Displays type, product, warehouse, quantity
- ✅ Shows date and user
- ✅ Color-coded by type

---

## Test Scenario 8: Settings & User Management

### Test 8.1: View Settings
**Steps:**
1. Navigate to "Settings"

**Expected Results:**
- ✅ Shows organization details
- ✅ Email notification preferences
- ✅ User management table

### Test 8.2: View Team Members
**Steps:**
1. Check "Team Members" section

**Expected Results:**
- ✅ Shows all users in organization
- ✅ Displays name, email, role, status
- ✅ Active/Inactive badges

---

## Test Scenario 9: Multi-Warehouse

### Test 9.1: View Warehouses
**Steps:**
1. Navigate to "Warehouses"

**Expected Results:**
- ✅ Shows 2 warehouses from seed
- ✅ Displays stats (products, total stock)
- ✅ Active/Inactive status
- ✅ Location info

### Test 9.2: View Stock by Warehouse
**Steps:**
1. Go to any product detail page
2. Check "Stock by Warehouse" section

**Expected Results:**
- ✅ Shows stock in each warehouse
- ✅ Displays warehouse name and quantity
- ✅ Updates after transfers

---

## Test Scenario 10: Dark Mode

### Test 10.1: Toggle Dark Mode
**Steps:**
1. Click sun/moon icon in topbar
2. Navigate through different pages

**Expected Results:**
- ✅ Theme switches instantly
- ✅ All components adapt colors
- ✅ Glassmorphism effects work
- ✅ Text remains readable
- ✅ Preference persists on reload

---

## Test Scenario 11: Price Snapshots

### Test 11.1: Verify Price Snapshot
**Steps:**
1. Create sales order with product
2. Note the price in order
3. Edit product and change selling price
4. View sales order again

**Expected Results:**
- ✅ Order still shows original price
- ✅ New orders use new price
- ✅ Historical accuracy maintained

---

## Test Scenario 12: Responsive Design

### Test 12.1: Mobile View
**Steps:**
1. Resize browser to mobile width (375px)
2. Navigate through pages

**Expected Results:**
- ✅ Sidebar collapses/adapts
- ✅ Tables scroll horizontally
- ✅ Forms stack vertically
- ✅ Buttons remain accessible

---

## 🎯 Critical Path Test (End-to-End)

**Complete Business Flow:**

1. **Login** → Dashboard
2. **Create Product** → "Gaming Monitor 27inch"
3. **Create PO** → Order 20 monitors from supplier
4. **Receive PO** → Stock increases to 20
5. **Create Sales Order** → Sell 5 monitors to customer
6. **Fulfill Order** → Stock decreases to 15
7. **View Invoice** → Print invoice
8. **Create Transfer** → Move 5 monitors to secondary warehouse
9. **Complete Transfer** → Main: 10, Secondary: 5
10. **Create Adjustment** → Found 2 damaged, decrease stock
11. **Check Dashboard** → Verify all movements recorded

**Expected Final State:**
- ✅ Main Warehouse: 8 monitors
- ✅ Secondary Warehouse: 5 monitors
- ✅ Total: 13 monitors
- ✅ All movements in dashboard
- ✅ Invoice generated
- ✅ Audit trail complete

---

## 📊 Test Results Template

| Test ID | Test Name | Status | Notes |
|---------|-----------|--------|-------|
| 1.1 | Login | ⏳ | |
| 1.2 | Register | ⏳ | |
| 2.1 | View Products | ⏳ | |
| 2.2 | Create Product | ⏳ | |
| 4.1 | Create Sales Order | ⏳ | |
| 4.4 | Fulfill Order | ⏳ | |
| 4.5 | Print Invoice | ⏳ | |
| 5.4 | Receive PO | ⏳ | |
| 6.4 | Complete Transfer | ⏳ | |
| 11.1 | Price Snapshot | ⏳ | |

Legend: ⏳ Pending | ✅ Pass | ❌ Fail

---

**Test Environment:**
- Browser: Chrome/Firefox/Edge
- URL: http://localhost:3000
- Database: PostgreSQL (seeded)
- User: admin@demowarehouse.com / admin123
