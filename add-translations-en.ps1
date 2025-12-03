# Comprehensive Translation Key Addition Script
# This script adds ALL missing translation keys to en.json based on component usage

$json = Get-Content 'messages\en.json' -Raw | ConvertFrom-Json

# ===== INVENTORY NAMESPACE =====
$inventoryForm = @{
    createTitle = "Create Product"
    createDescription = "Add a new product to your inventory."
    editTitle = "Edit Product"
    editDescription = "Update product information."
    name = "Name"
    namePlaceholder = "Product Name"
    sku = "SKU"
    skuPlaceholder = "Stock Keeping Unit"
    barcode = "Barcode"
    barcodePlaceholder = "Scan or enter barcode"
    category = "Category"
    selectCategory = "Select category"
    addCategory = "Add Category"
    description = "Description"
    descriptionPlaceholder = "Product description"
    unit = "Unit"
    sellingPrice = "Selling Price"
    costPrice = "Cost Price"
    lowStockThreshold = "Low Stock Threshold"
    units = @{
        pcs = "Pieces (pcs)"
        box = "Box"
        kg = "Kilogram (kg)"
        liter = "Liter"
        meter = "Meter"
    }
}

$inventoryShow = @{
    category = "Category"
    unit = "Unit"
    sellingPrice = "Selling Price"
    costPrice = "Cost Price"
    description = "Description"
    stockOverview = "Stock Overview"
    totalStock = "Total Stock"
    lowStockThreshold = "Low Stock Threshold"
    warehouse = "Warehouse"
    quantity = "Quantity"
    noStock = "No stock available"
    history = "Product History"
    priceHistory = "Price History"
    date = "Date"
    type = "Type"
    oldPrice = "Old Price"
    newPrice = "New Price"
    stockMovements = "Stock Movements"
    reference = "Reference"
    noHistory = "No history available"
    failedToLoadHistory = "Failed to load history"
}

$inventoryStock = @{
    title = "Manage Stock"
    description = "Adjust stock levels for this product"
    warehouse = "Warehouse"
    selectWarehouse = "Select warehouse"
    currentStock = "Current Stock"
    adjustment = "Adjustment"
    adjustmentPlaceholder = "Enter quantity to add or subtract"
    reason = "Reason"
    reasonPlaceholder = "Reason for adjustment"
}

if (-not $json.inventory) {
    $json | Add-Member -MemberType NoteProperty -Name 'inventory' -Value @{} -Force
}
$json.inventory | Add-Member -MemberType NoteProperty -Name 'form' -Value $inventoryForm -Force
$json.inventory | Add-Member -MemberType NoteProperty -Name 'show' -Value $inventoryShow -Force
$json.inventory | Add-Member -MemberType NoteProperty -Name 'stock' -Value $inventoryStock -Force

# ===== SUPPLIERS NAMESPACE =====
$suppliersForm = @{
    createTitle = "Create Supplier"
    createDescription = "Add a new supplier to your database."
    editTitle = "Edit Supplier"
    editDescription = "Update supplier information."
    name = "Name"
    namePlaceholder = "Supplier Name"
    email = "Email"
    emailPlaceholder = "supplier@example.com"
    phone = "Phone"
    phonePlaceholder = "+62 xxx xxxx xxxx"
    address = "Address"
    addressPlaceholder = "Full address"
    city = "City"
    cityPlaceholder = "City name"
}

$suppliersShow = @{
    name = "Name"
    email = "Email"
    phone = "Phone"
    address = "Address"
    city = "City"
    createdAt = "Created At"
}

if (-not $json.suppliers) {
    $json | Add-Member -MemberType NoteProperty -Name 'suppliers' -Value @{} -Force
}
$json.suppliers | Add-Member -MemberType NoteProperty -Name 'form' -Value $suppliersForm -Force
$json.suppliers | Add-Member -MemberType NoteProperty -Name 'show' -Value $suppliersShow -Force

# ===== CUSTOMERS NAMESPACE =====
$customersForm = @{
    createTitle = "Create Customer"
    createDescription = "Add a new customer to your database."
    editTitle = "Edit Customer"
    editDescription = "Update customer information."
    name = "Name"
    namePlaceholder = "Customer Name"
    email = "Email"
    emailPlaceholder = "customer@example.com"
    phone = "Phone"
    phonePlaceholder = "+62 xxx xxxx xxxx"
    address = "Address"
    addressPlaceholder = "Full address"
    city = "City"
    cityPlaceholder = "City name"
}

$customersShow = @{
    name = "Name"
    email = "Email"
    phone = "Phone"
    address = "Address"
    city = "City"
    createdAt = "Created At"
}

if (-not $json.customers) {
    $json | Add-Member -MemberType NoteProperty -Name 'customers' -Value @{} -Force
}
$json.customers | Add-Member -MemberType NoteProperty -Name 'form' -Value $customersForm -Force
$json.customers | Add-Member -MemberType NoteProperty -Name 'show' -Value $customersShow -Force

# ===== WAREHOUSES NAMESPACE =====
$warehousesForm = @{
    createTitle = "Create Warehouse"
    createDescription = "Add a new warehouse location."
    editTitle = "Edit Warehouse"
    editDescription = "Update warehouse information."
    name = "Name"
    namePlaceholder = "Warehouse Name"
    code = "Code"
    codePlaceholder = "WH-001"
    location = "Location"
    locationPlaceholder = "Full address"
    isActive = "Active"
}

$warehousesShow = @{
    name = "Name"
    code = "Code"
    location = "Location"
    status = "Status"
    active = "Active"
    inactive = "Inactive"
    createdAt = "Created At"
}

if (-not $json.warehouses) {
    $json | Add-Member -MemberType NoteProperty -Name 'warehouses' -Value @{} -Force
}
$json.warehouses | Add-Member -MemberType NoteProperty -Name 'form' -Value $warehousesForm -Force
$json.warehouses | Add-Member -MemberType NoteProperty -Name 'show' -Value $warehousesShow -Force

# ===== CATEGORIES NAMESPACE =====
$categoriesForm = @{
    createTitle = "Create Category"
    createDescription = "Add a new product category."
    editTitle = "Edit Category"
    editDescription = "Update category information."
    name = "Name"
    namePlaceholder = "Category Name"
    description = "Description"
    descriptionPlaceholder = "Category description"
}

$categoriesShow = @{
    name = "Name"
    description = "Description"
    productCount = "Products"
    createdAt = "Created At"
}

if (-not $json.categories) {
    $json | Add-Member -MemberType NoteProperty -Name 'categories' -Value @{} -Force
}
$json.categories | Add-Member -MemberType NoteProperty -Name 'form' -Value $categoriesForm -Force
$json.categories | Add-Member -MemberType NoteProperty -Name 'show' -Value $categoriesShow -Force

# ===== SALES ORDERS NAMESPACE =====
$salesOrdersForm = @{
    createTitle = "Create Sales Order"
    createDescription = "Create a new sales order for a customer."
    editTitle = "Edit Sales Order"
    editDescription = "Update sales order information."
    customer = "Customer"
    walkInCustomer = "Walk-in Customer"
    warehouse = "Warehouse"
    selectWarehouse = "Select warehouse"
    notes = "Notes"
    notesPlaceholder = "Add notes here..."
    lineItems = "Line Items"
    selectProduct = "Select product to add"
    noItems = "No items added yet"
    subtotal = "Subtotal"
    discount = "Discount"
    total = "Total"
}

$salesOrdersShow = @{
    title = "Sales Order #{orderNumber}"
    invoice = "Invoice"
    confirm = "Confirm Order"
    fulfill = "Fulfill Order"
    cancel = "Cancel Order"
    confirmSuccess = "Order confirmed successfully"
    fulfillSuccess = "Order fulfilled successfully"
    cancelSuccess = "Order cancelled successfully"
    customer = "Customer"
    walkInCustomer = "Walk-in Customer"
    warehouse = "Warehouse"
    orderItems = "Order Items"
    product = "Product"
    qty = "Qty"
    price = "Price"
    total = "Total"
    subtotal = "Subtotal"
    discount = "Discount"
    notes = "Notes"
}

if (-not $json.PSObject.Properties['salesOrders']) {
    $json | Add-Member -MemberType NoteProperty -Name 'salesOrders' -Value @{} -Force
}
$json.salesOrders | Add-Member -MemberType NoteProperty -Name 'form' -Value $salesOrdersForm -Force
$json.salesOrders | Add-Member -MemberType NoteProperty -Name 'show' -Value $salesOrdersShow -Force

# ===== PURCHASE ORDERS NAMESPACE =====
$purchaseOrdersForm = @{
    createTitle = "Create Purchase Order"
    createDescription = "Create a new purchase order for a supplier."
    editTitle = "Edit Purchase Order"
    editDescription = "Update purchase order information."
    supplier = "Supplier"
    selectSupplier = "Select supplier"
    warehouse = "Warehouse"
    selectWarehouse = "Select warehouse"
    notes = "Notes"
    notesPlaceholder = "Add notes here..."
    lineItems = "Line Items"
    selectProduct = "Select product to add"
    noItems = "No items added yet"
    total = "Total"
}

$purchaseOrdersShow = @{
    title = "Purchase Order #{poNumber}"
    sendOrder = "Send Order"
    receiveItems = "Receive Items"
    sendSuccess = "Order sent successfully"
    receiveSuccess = "Items received successfully"
    supplier = "Supplier"
    warehouse = "Warehouse"
    orderItems = "Order Items"
    product = "Product"
    qty = "Qty"
    cost = "Cost"
    total = "Total"
    received = "Received"
    notes = "Notes"
}

if (-not $json.PSObject.Properties['purchaseOrders']) {
    $json | Add-Member -MemberType NoteProperty -Name 'purchaseOrders' -Value @{} -Force
}
$json.purchaseOrders | Add-Member -MemberType NoteProperty -Name 'form' -Value $purchaseOrdersForm -Force
$json.purchaseOrders | Add-Member -MemberType NoteProperty -Name 'show' -Value $purchaseOrdersShow -Force

# ===== TRANSFERS NAMESPACE =====
$transfersForm = @{
    createTitle = "Create Transfer"
    createDescription = "Transfer stock between warehouses."
    editTitle = "Edit Transfer"
    editDescription = "Update transfer information."
    fromWarehouse = "From Warehouse"
    selectSource = "Select source warehouse"
    toWarehouse = "To Warehouse"
    selectDestination = "Select destination warehouse"
    notes = "Notes"
    notesPlaceholder = "Add notes here..."
    lineItems = "Line Items"
    selectProduct = "Select product to add"
    noItems = "No items added yet"
}

$transfersShow = @{
    title = "Transfer #{transferNumber}"
    sendTransfer = "Send Transfer"
    completeTransfer = "Complete Transfer"
    sendSuccess = "Transfer sent successfully"
    completeSuccess = "Transfer completed successfully"
    fromWarehouse = "From Warehouse"
    toWarehouse = "To Warehouse"
    transferItems = "Transfer Items"
    product = "Product"
    quantity = "Quantity"
    notes = "Notes"
}

if (-not $json.transfers) {
    $json | Add-Member -MemberType NoteProperty -Name 'transfers' -Value @{} -Force
}
$json.transfers | Add-Member -MemberType NoteProperty -Name 'form' -Value $transfersForm -Force
$json.transfers | Add-Member -MemberType NoteProperty -Name 'show' -Value $transfersShow -Force

# ===== ADJUSTMENTS NAMESPACE =====
$adjustmentsForm = @{
    createTitle = "Create Adjustment"
    createDescription = "Manually adjust stock levels."
    editTitle = "Edit Adjustment"
    editDescription = "Update adjustment information."
    product = "Product"
    selectProduct = "Select product"
    warehouse = "Warehouse"
    selectWarehouse = "Select warehouse"
    type = "Type"
    increase = "Increase (+)"
    decrease = "Decrease (-)"
    quantity = "Quantity"
    reason = "Reason"
    selectReason = "Select reason"
    reasons = @{
        DAMAGE = "Damage"
        LOST = "Lost"
        FOUND = "Found"
        AUDIT = "Audit Correction"
        CORRECTION = "Data Correction"
        EXPIRED = "Expired"
        OTHER = "Other"
    }
    notes = "Notes"
    notesPlaceholder = "Add notes here..."
}

$adjustmentsShow = @{
    title = "Adjustment Details"
    reverseAdjustment = "Reverse Adjustment"
    reverseSuccess = "Adjustment reversed successfully"
    reverseError = "Failed to reverse adjustment"
    details = "Details"
    product = "Product"
    warehouse = "Warehouse"
    type = "Type"
    quantity = "Quantity"
    reason = "Reason"
    createdBy = "Created By"
    notes = "Notes"
}

if (-not $json.adjustments) {
    $json | Add-Member -MemberType NoteProperty -Name 'adjustments' -Value @{} -Force
}
$json.adjustments | Add-Member -MemberType NoteProperty -Name 'form' -Value $adjustmentsForm -Force
$json.adjustments | Add-Member -MemberType NoteProperty -Name 'show' -Value $adjustmentsShow -Force

# ===== SETTINGS NAMESPACE =====
$settingsUsers = @{
    title = "Users"
    createTitle = "Invite User"
    createDescription = "Send an invitation to a new user."
    editTitle = "Edit User"
    editDescription = "Update user information."
    name = "Name"
    namePlaceholder = "Full Name"
    email = "Email"
    emailPlaceholder = "user@example.com"
    role = "Role"
    selectRole = "Select role"
    status = "Status"
    active = "Active"
    inactive = "Inactive"
    invitationSent = "Invitation sent successfully"
    invitationError = "Failed to send invitation"
}

$settingsOrganization = @{
    title = "Organization Details"
    name = "Organization Name"
    namePlaceholder = "Your Company Name"
    email = "Email"
    emailPlaceholder = "contact@company.com"
    phone = "Phone"
    phonePlaceholder = "+62 xxx xxxx xxxx"
    address = "Address"
    addressPlaceholder = "Full address"
    city = "City"
    cityPlaceholder = "City name"
    updateSuccess = "Organization updated successfully"
    updateError = "Failed to update organization"
}

if (-not $json.settings) {
    $json | Add-Member -MemberType NoteProperty -Name 'settings' -Value @{} -Force
}
$json.settings | Add-Member -MemberType NoteProperty -Name 'users' -Value $settingsUsers -Force
$json.settings | Add-Member -MemberType NoteProperty -Name 'organization' -Value $settingsOrganization -Force

# Save the updated JSON
$json | ConvertTo-Json -Depth 10 | Set-Content 'messages\en.json'
Write-Host "Successfully added all missing translation keys to en.json"
