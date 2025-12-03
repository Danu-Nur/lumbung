# Comprehensive Indonesian Translation Addition Script
# This script adds ALL missing translation keys to id.json

$json = Get-Content 'messages\id.json' -Raw | ConvertFrom-Json

# ===== COMMON.ACTIONS =====
$commonActions = @{
    view = "Lihat"
    edit = "Ubah"
    delete = "Hapus"
    cancel = "Batal"
    save = "Simpan"
    saving = "Menyimpan..."
    deleting = "Menghapus..."
    close = "Tutup"
    deleteConfirmTitle = "Konfirmasi Hapus"
    deleteConfirmDescription = "Apakah Anda yakin ingin menghapus item ini? Tindakan ini tidak dapat dibatalkan."
    createSuccess = "Berhasil dibuat"
    createError = "Gagal membuat"
    updateSuccess = "Berhasil diperbarui"
    updateError = "Gagal memperbarui"
    deleteSuccess = "Berhasil dihapus"
    deleteError = "Gagal menghapus"
}

$json.common | Add-Member -MemberType NoteProperty -Name 'actions' -Value $commonActions -Force
$json.common.help | Add-Member -MemberType NoteProperty -Name 'buttonLabel' -Value "Panduan" -Force

# Also add Common.actions (capital C)
$json | Add-Member -MemberType NoteProperty -Name 'Common' -Value @{
    actions = $commonActions
} -Force

# ===== INVENTORY NAMESPACE =====
$inventoryForm = @{
    createTitle = "Buat Produk"
    createDescription = "Tambahkan produk baru ke inventaris Anda."
    editTitle = "Ubah Produk"
    editDescription = "Perbarui informasi produk."
    name = "Nama"
    namePlaceholder = "Nama Produk"
    sku = "SKU"
    skuPlaceholder = "Kode Stok"
    barcode = "Barcode"
    barcodePlaceholder = "Scan atau masukkan barcode"
    category = "Kategori"
    selectCategory = "Pilih kategori"
    addCategory = "Tambah Kategori"
    description = "Deskripsi"
    descriptionPlaceholder = "Deskripsi produk"
    unit = "Satuan"
    sellingPrice = "Harga Jual"
    costPrice = "Harga Beli"
    lowStockThreshold = "Batas Stok Minimum"
    units = @{
        pcs = "Buah (pcs)"
        box = "Kotak"
        kg = "Kilogram (kg)"
        liter = "Liter"
        meter = "Meter"
    }
}

$inventoryShow = @{
    category = "Kategori"
    unit = "Satuan"
    sellingPrice = "Harga Jual"
    costPrice = "Harga Beli"
    description = "Deskripsi"
    stockOverview = "Ringkasan Stok"
    totalStock = "Total Stok"
    lowStockThreshold = "Batas Stok Minimum"
    warehouse = "Gudang"
    quantity = "Jumlah"
    noStock = "Tidak ada stok"
    history = "Riwayat Produk"
    priceHistory = "Riwayat Harga"
    date = "Tanggal"
    type = "Tipe"
    oldPrice = "Harga Lama"
    newPrice = "Harga Baru"
    stockMovements = "Pergerakan Stok"
    reference = "Referensi"
    noHistory = "Belum ada riwayat"
    failedToLoadHistory = "Gagal memuat riwayat"
}

$inventoryStock = @{
    title = "Kelola Stok"
    description = "Sesuaikan level stok untuk produk ini"
    warehouse = "Gudang"
    selectWarehouse = "Pilih gudang"
    currentStock = "Stok Saat Ini"
    adjustment = "Penyesuaian"
    adjustmentPlaceholder = "Masukkan jumlah untuk ditambah atau dikurangi"
    reason = "Alasan"
    reasonPlaceholder = "Alasan penyesuaian"
}

$json.inventory | Add-Member -MemberType NoteProperty -Name 'form' -Value $inventoryForm -Force
$json.inventory | Add-Member -MemberType NoteProperty -Name 'show' -Value $inventoryShow -Force
$json.inventory | Add-Member -MemberType NoteProperty -Name 'stock' -Value $inventoryStock -Force
$json.inventory.help | Add-Member -MemberType NoteProperty -Name 'buttonLabel' -Value "Panduan" -Force

# ===== SUPPLIERS NAMESPACE =====
$suppliersForm = @{
    createTitle = "Buat Pemasok"
    createDescription = "Tambahkan pemasok baru ke database."
    editTitle = "Ubah Pemasok"
    editDescription = "Perbarui informasi pemasok."
    name = "Nama"
    namePlaceholder = "Nama Pemasok"
    email = "Email"
    emailPlaceholder = "pemasok@contoh.com"
    phone = "Telepon"
    phonePlaceholder = "+62 xxx xxxx xxxx"
    address = "Alamat"
    addressPlaceholder = "Alamat lengkap"
    city = "Kota"
    cityPlaceholder = "Nama kota"
}

$suppliersShow = @{
    name = "Nama"
    email = "Email"
    phone = "Telepon"
    address = "Alamat"
    city = "Kota"
    createdAt = "Dibuat Pada"
}

$json.suppliers | Add-Member -MemberType NoteProperty -Name 'form' -Value $suppliersForm -Force
$json.suppliers | Add-Member -MemberType NoteProperty -Name 'show' -Value $suppliersShow -Force
$json.suppliers.help | Add-Member -MemberType NoteProperty -Name 'buttonLabel' -Value "Panduan" -Force

# ===== CUSTOMERS NAMESPACE =====
$customersForm = @{
    createTitle = "Buat Pelanggan"
    createDescription = "Tambahkan pelanggan baru ke database."
    editTitle = "Ubah Pelanggan"
    editDescription = "Perbarui informasi pelanggan."
    name = "Nama"
    namePlaceholder = "Nama Pelanggan"
    email = "Email"
    emailPlaceholder = "pelanggan@contoh.com"
    phone = "Telepon"
    phonePlaceholder = "+62 xxx xxxx xxxx"
    address = "Alamat"
    addressPlaceholder = "Alamat lengkap"
    city = "Kota"
    cityPlaceholder = "Nama kota"
}

$customersShow = @{
    name = "Nama"
    email = "Email"
    phone = "Telepon"
    address = "Alamat"
    city = "Kota"
    createdAt = "Dibuat Pada"
}

$json.customers | Add-Member -MemberType NoteProperty -Name 'form' -Value $customersForm -Force
$json.customers | Add-Member -MemberType NoteProperty -Name 'show' -Value $customersShow -Force
$json.customers.help | Add-Member -MemberType NoteProperty -Name 'buttonLabel' -Value "Panduan" -Force

# ===== WAREHOUSES NAMESPACE =====
$warehousesForm = @{
    createTitle = "Buat Gudang"
    createDescription = "Tambahkan lokasi gudang baru."
    editTitle = "Ubah Gudang"
    editDescription = "Perbarui informasi gudang."
    name = "Nama"
    namePlaceholder = "Nama Gudang"
    code = "Kode"
    codePlaceholder = "GD-001"
    location = "Lokasi"
    locationPlaceholder = "Alamat lengkap"
    isActive = "Aktif"
}

$warehousesShow = @{
    name = "Nama"
    code = "Kode"
    location = "Lokasi"
    status = "Status"
    active = "Aktif"
    inactive = "Tidak Aktif"
    createdAt = "Dibuat Pada"
}

$json.warehouses | Add-Member -MemberType NoteProperty -Name 'form' -Value $warehousesForm -Force
$json.warehouses | Add-Member -MemberType NoteProperty -Name 'show' -Value $warehousesShow -Force
$json.warehouses.help | Add-Member -MemberType NoteProperty -Name 'buttonLabel' -Value "Panduan" -Force

# ===== CATEGORIES NAMESPACE =====
$categoriesForm = @{
    createTitle = "Buat Kategori"
    createDescription = "Tambahkan kategori produk baru."
    editTitle = "Ubah Kategori"
    editDescription = "Perbarui informasi kategori."
    name = "Nama"
    namePlaceholder = "Nama Kategori"
    description = "Deskripsi"
    descriptionPlaceholder = "Deskripsi kategori"
}

$categoriesShow = @{
    name = "Nama"
    description = "Deskripsi"
    productCount = "Produk"
    createdAt = "Dibuat Pada"
}

$json.categories | Add-Member -MemberType NoteProperty -Name 'form' -Value $categoriesForm -Force
$json.categories | Add-Member -MemberType NoteProperty -Name 'show' -Value $categoriesShow -Force
$json.categories.help | Add-Member -MemberType NoteProperty -Name 'buttonLabel' -Value "Panduan" -Force

# ===== SALES ORDERS NAMESPACE =====
$salesOrdersForm = @{
    createTitle = "Buat Pesanan Penjualan"
    createDescription = "Buat pesanan penjualan baru untuk pelanggan."
    editTitle = "Ubah Pesanan Penjualan"
    editDescription = "Perbarui informasi pesanan penjualan."
    customer = "Pelanggan"
    walkInCustomer = "Pelanggan Langsung"
    warehouse = "Gudang"
    selectWarehouse = "Pilih gudang"
    notes = "Catatan"
    notesPlaceholder = "Tambahkan catatan di sini..."
    lineItems = "Item Pesanan"
    selectProduct = "Pilih produk untuk ditambahkan"
    noItems = "Belum ada item"
    subtotal = "Subtotal"
    discount = "Diskon"
    total = "Total"
}

$salesOrdersShow = @{
    title = "Pesanan Penjualan #{orderNumber}"
    invoice = "Invoice"
    confirm = "Konfirmasi Pesanan"
    fulfill = "Penuhi Pesanan"
    cancel = "Batalkan Pesanan"
    confirmSuccess = "Pesanan berhasil dikonfirmasi"
    fulfillSuccess = "Pesanan berhasil dipenuhi"
    cancelSuccess = "Pesanan berhasil dibatalkan"
    customer = "Pelanggan"
    walkInCustomer = "Pelanggan Langsung"
    warehouse = "Gudang"
    orderItems = "Item Pesanan"
    product = "Produk"
    qty = "Jml"
    price = "Harga"
    total = "Total"
    subtotal = "Subtotal"
    discount = "Diskon"
    notes = "Catatan"
}

if (-not $json.PSObject.Properties['salesOrders']) {
    $json | Add-Member -MemberType NoteProperty -Name 'salesOrders' -Value @{} -Force
}
$json.salesOrders | Add-Member -MemberType NoteProperty -Name 'form' -Value $salesOrdersForm -Force
$json.salesOrders | Add-Member -MemberType NoteProperty -Name 'show' -Value $salesOrdersShow -Force

# ===== PURCHASE ORDERS NAMESPACE =====
$purchaseOrdersForm = @{
    createTitle = "Buat Pesanan Pembelian"
    createDescription = "Buat pesanan pembelian baru untuk pemasok."
    editTitle = "Ubah Pesanan Pembelian"
    editDescription = "Perbarui informasi pesanan pembelian."
    supplier = "Pemasok"
    selectSupplier = "Pilih pemasok"
    warehouse = "Gudang"
    selectWarehouse = "Pilih gudang"
    notes = "Catatan"
    notesPlaceholder = "Tambahkan catatan di sini..."
    lineItems = "Item Pesanan"
    selectProduct = "Pilih produk untuk ditambahkan"
    noItems = "Belum ada item"
    total = "Total"
}

$purchaseOrdersShow = @{
    title = "Pesanan Pembelian #{poNumber}"
    sendOrder = "Kirim Pesanan"
    receiveItems = "Terima Barang"
    sendSuccess = "Pesanan berhasil dikirim"
    receiveSuccess = "Barang berhasil diterima"
    supplier = "Pemasok"
    warehouse = "Gudang"
    orderItems = "Item Pesanan"
    product = "Produk"
    qty = "Jml"
    cost = "Biaya"
    total = "Total"
    received = "Diterima"
    notes = "Catatan"
}

if (-not $json.PSObject.Properties['purchaseOrders']) {
    $json | Add-Member -MemberType NoteProperty -Name 'purchaseOrders' -Value @{} -Force
}
$json.purchaseOrders | Add-Member -MemberType NoteProperty -Name 'form' -Value $purchaseOrdersForm -Force
$json.purchaseOrders | Add-Member -MemberType NoteProperty -Name 'show' -Value $purchaseOrdersShow -Force

# ===== TRANSFERS NAMESPACE =====
$transfersForm = @{
    createTitle = "Buat Transfer"
    createDescription = "Transfer stok antar gudang."
    editTitle = "Ubah Transfer"
    editDescription = "Perbarui informasi transfer."
    fromWarehouse = "Dari Gudang"
    selectSource = "Pilih gudang asal"
    toWarehouse = "Ke Gudang"
    selectDestination = "Pilih gudang tujuan"
    notes = "Catatan"
    notesPlaceholder = "Tambahkan catatan di sini..."
    lineItems = "Item Transfer"
    selectProduct = "Pilih produk untuk ditambahkan"
    noItems = "Belum ada item"
}

$transfersShow = @{
    title = "Transfer #{transferNumber}"
    sendTransfer = "Kirim Transfer"
    completeTransfer = "Selesaikan Transfer"
    sendSuccess = "Transfer berhasil dikirim"
    completeSuccess = "Transfer berhasil diselesaikan"
    fromWarehouse = "Dari Gudang"
    toWarehouse = "Ke Gudang"
    transferItems = "Item Transfer"
    product = "Produk"
    quantity = "Jumlah"
    notes = "Catatan"
}

$json.transfers | Add-Member -MemberType NoteProperty -Name 'form' -Value $transfersForm -Force
$json.transfers | Add-Member -MemberType NoteProperty -Name 'show' -Value $transfersShow -Force
$json.transfers.help | Add-Member -MemberType NoteProperty -Name 'buttonLabel' -Value "Panduan" -Force

# ===== ADJUSTMENTS NAMESPACE =====
$adjustmentsForm = @{
    createTitle = "Buat Penyesuaian"
    createDescription = "Sesuaikan level stok secara manual."
    editTitle = "Ubah Penyesuaian"
    editDescription = "Perbarui informasi penyesuaian."
    product = "Produk"
    selectProduct = "Pilih produk"
    warehouse = "Gudang"
    selectWarehouse = "Pilih gudang"
    type = "Tipe"
    increase = "Tambah (+)"
    decrease = "Kurang (-)"
    quantity = "Jumlah"
    reason = "Alasan"
    selectReason = "Pilih alasan"
    reasons = @{
        DAMAGE = "Rusak"
        LOST = "Hilang"
        FOUND = "Ditemukan"
        AUDIT = "Koreksi Audit"
        CORRECTION = "Koreksi Data"
        EXPIRED = "Kadaluarsa"
        OTHER = "Lainnya"
    }
    notes = "Catatan"
    notesPlaceholder = "Tambahkan catatan di sini..."
}

$adjustmentsShow = @{
    title = "Detail Penyesuaian"
    reverseAdjustment = "Batalkan Penyesuaian"
    reverseSuccess = "Penyesuaian berhasil dibatalkan"
    reverseError = "Gagal membatalkan penyesuaian"
    details = "Detail"
    product = "Produk"
    warehouse = "Gudang"
    type = "Tipe"
    quantity = "Jumlah"
    reason = "Alasan"
    createdBy = "Dibuat Oleh"
    notes = "Catatan"
}

$json.adjustments | Add-Member -MemberType NoteProperty -Name 'form' -Value $adjustmentsForm -Force
$json.adjustments | Add-Member -MemberType NoteProperty -Name 'show' -Value $adjustmentsShow -Force
$json.adjustments.help | Add-Member -MemberType NoteProperty -Name 'buttonLabel' -Value "Panduan" -Force

# ===== SETTINGS NAMESPACE =====
$settingsUsers = @{
    title = "Pengguna"
    createTitle = "Undang Pengguna"
    createDescription = "Kirim undangan ke pengguna baru."
    editTitle = "Ubah Pengguna"
    editDescription = "Perbarui informasi pengguna."
    name = "Nama"
    namePlaceholder = "Nama Lengkap"
    email = "Email"
    emailPlaceholder = "pengguna@contoh.com"
    role = "Peran"
    selectRole = "Pilih peran"
    status = "Status"
    active = "Aktif"
    inactive = "Tidak Aktif"
    invitationSent = "Undangan berhasil dikirim"
    invitationError = "Gagal mengirim undangan"
}

$settingsOrganization = @{
    title = "Detail Organisasi"
    name = "Nama Organisasi"
    namePlaceholder = "Nama Perusahaan Anda"
    email = "Email"
    emailPlaceholder = "kontak@perusahaan.com"
    phone = "Telepon"
    phonePlaceholder = "+62 xxx xxxx xxxx"
    address = "Alamat"
    addressPlaceholder = "Alamat lengkap"
    city = "Kota"
    cityPlaceholder = "Nama kota"
    updateSuccess = "Organisasi berhasil diperbarui"
    updateError = "Gagal memperbarui organisasi"
}

$json.settings | Add-Member -MemberType NoteProperty -Name 'users' -Value $settingsUsers -Force
$json.settings | Add-Member -MemberType NoteProperty -Name 'organization' -Value $settingsOrganization -Force
$json.settings.help | Add-Member -MemberType NoteProperty -Name 'buttonLabel' -Value "Panduan" -Force

# Save the updated JSON
$json | ConvertTo-Json -Depth 10 | Set-Content 'messages\id.json'
Write-Host "Successfully added all missing translation keys to id.json"
