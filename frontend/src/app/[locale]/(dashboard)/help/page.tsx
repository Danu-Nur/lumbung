import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Box, FileText, HelpCircle, Layers, ShoppingCart, Truck, Users } from "lucide-react";

export default function HelpPage() {
    return (
        <div className="p-6 space-y-6 max-w-5xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
                <HelpCircle className="h-8 w-8 text-primary" />
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Panduan Pengguna (User Guide)</h1>
                    <p className="text-muted-foreground">Pelajari cara menggunakan aplikasi Inventory Pro dengan mudah.</p>
                </div>
            </div>

            <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-5 h-auto">
                    <TabsTrigger value="overview">Pengenalan</TabsTrigger>
                    <TabsTrigger value="products">Produk & Stok</TabsTrigger>
                    <TabsTrigger value="transactions">Transaksi</TabsTrigger>
                    <TabsTrigger value="glossary">Istilah Penting</TabsTrigger>
                    <TabsTrigger value="faq">FAQ</TabsTrigger>
                </TabsList>

                {/* OVERVIEW TAB */}
                <TabsContent value="overview" className="space-y-4 mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Selamat Datang di Inventory Pro</CardTitle>
                            <CardDescription>Aplikasi manajemen stok dan gudang untuk bisnis otomotif Anda.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p>
                                Aplikasi ini dirancang untuk membantu Anda mencatat keluar-masuk barang, memantau stok di berbagai gudang,
                                dan mengelola harga jual serta harga beli dengan akurat.
                            </p>
                            <div className="grid gap-4 md:grid-cols-2 mt-4">
                                <div className="border p-4 rounded-lg flex gap-3">
                                    <Box className="h-6 w-6 text-blue-500 shrink-0" />
                                    <div>
                                        <h3 className="font-semibold">Manajemen Stok Akurat</h3>
                                        <p className="text-sm text-muted-foreground">Stok tercatat otomatis dari pembelian dan penjualan. Tidak ada stok minus.</p>
                                    </div>
                                </div>
                                <div className="border p-4 rounded-lg flex gap-3">
                                    <Layers className="h-6 w-6 text-green-500 shrink-0" />
                                    <div>
                                        <h3 className="font-semibold">Multi Gudang</h3>
                                        <p className="text-sm text-muted-foreground">Kelola stok di Toko, Gudang Utama, atau Gudang Cabang dalam satu akun.</p>
                                    </div>
                                </div>
                                <div className="border p-4 rounded-lg flex gap-3">
                                    <FileText className="h-6 w-6 text-orange-500 shrink-0" />
                                    <div>
                                        <h3 className="font-semibold">Riwayat Harga</h3>
                                        <p className="text-sm text-muted-foreground">Pantau perubahan harga beli dan harga jual dari waktu ke waktu.</p>
                                    </div>
                                </div>
                                <div className="border p-4 rounded-lg flex gap-3">
                                    <Users className="h-6 w-6 text-purple-500 shrink-0" />
                                    <div>
                                        <h3 className="font-semibold">Multi User</h3>
                                        <p className="text-sm text-muted-foreground">Berikan akses berbeda untuk Admin, Kasir, atau Kepala Gudang.</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* PRODUCTS & STOCK TAB */}
                <TabsContent value="products" className="space-y-4 mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Manajemen Produk & Kategori</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <section>
                                <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">
                                    <Layers className="h-5 w-5" /> Menambah Kategori
                                </h3>
                                <p className="text-sm text-muted-foreground mb-2">
                                    Kategori membantu mengelompokkan barang (contoh: Oli, Ban, Kampas Rem).
                                </p>
                                <ol className="list-decimal list-inside text-sm space-y-1 ml-2">
                                    <li>Buka menu <strong>Kategori</strong> di sidebar.</li>
                                    <li>Klik tombol <strong>+ Tambah Kategori</strong>.</li>
                                    <li>Isi nama kategori dan deskripsi.</li>
                                    <li>Klik <strong>Simpan</strong>.</li>
                                </ol>
                                <div className="mt-2 p-2 bg-muted rounded text-xs text-muted-foreground">
                                    <em>Tip: Anda juga bisa menambah kategori langsung saat membuat produk baru.</em>
                                </div>
                            </section>

                            <section>
                                <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">
                                    <Box className="h-5 w-5" /> Menambah Produk Baru
                                </h3>
                                <ol className="list-decimal list-inside text-sm space-y-1 ml-2">
                                    <li>Buka menu <strong>Produk</strong>.</li>
                                    <li>Klik <strong>Tambah Produk</strong>.</li>
                                    <li>Isi data wajib: Nama, SKU (Kode Barang), Kategori, dan Satuan.</li>
                                    <li>Masukkan Harga Jual dan Harga Beli awal.</li>
                                    <li>(Opsional) Pilih <strong>Supplier Default</strong> jika barang ini selalu dibeli dari supplier tertentu.</li>
                                    <li>Klik <strong>Simpan</strong>.</li>
                                </ol>
                            </section>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* TRANSACTIONS TAB */}
                <TabsContent value="transactions" className="space-y-4 mt-6">
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Truck className="h-5 w-5" /> Pembelian (Purchase Order)
                                </CardTitle>
                                <CardDescription>Menambah stok barang masuk.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ol className="list-decimal list-inside text-sm space-y-2">
                                    <li>Buat <strong>Purchase Order (PO)</strong> ke Supplier.</li>
                                    <li>Saat barang datang, buka PO tersebut.</li>
                                    <li>Klik tombol <strong>Receive (Terima Barang)</strong>.</li>
                                    <li>Masukkan jumlah yang diterima. Stok akan otomatis bertambah.</li>
                                </ol>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <ShoppingCart className="h-5 w-5" /> Penjualan (Sales Order)
                                </CardTitle>
                                <CardDescription>Mengurangi stok barang keluar.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ol className="list-decimal list-inside text-sm space-y-2">
                                    <li>Buat <strong>Sales Order (SO)</strong> untuk pelanggan.</li>
                                    <li>Pilih barang dan jumlah yang dibeli.</li>
                                    <li>Klik <strong>Fulfill (Penuhi Pesanan)</strong> untuk mengurangi stok fisik di gudang.</li>
                                    <li>Stok akan berkurang dan tercatat di kartu stok.</li>
                                </ol>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* GLOSSARY TAB */}
                <TabsContent value="glossary" className="space-y-4 mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Kamus Istilah</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Accordion type="single" collapsible className="w-full">
                                <AccordionItem value="sku">
                                    <AccordionTrigger>SKU (Stock Keeping Unit)</AccordionTrigger>
                                    <AccordionContent>
                                        Kode unik untuk setiap barang. Contoh: <code>OLI-YAM-001</code>. Tidak boleh ada dua barang dengan SKU yang sama.
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="onhand">
                                    <AccordionTrigger>Quantity On Hand (Stok Fisik)</AccordionTrigger>
                                    <AccordionContent>
                                        Jumlah barang yang ada di gudang saat ini.
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="allocated">
                                    <AccordionTrigger>Allocated Qty (Stok Terpesan)</AccordionTrigger>
                                    <AccordionContent>
                                        Jumlah barang yang sudah dipesan pelanggan tapi belum dikirim/diambil. Stok ini &quot;aman&quot; dan tidak bisa dijual ke orang lain.
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="available">
                                    <AccordionTrigger>Available Qty (Stok Tersedia)</AccordionTrigger>
                                    <AccordionContent>
                                        Sisa stok yang masih bisa dijual. Rumusnya: <code>Stok Fisik - Stok Terpesan</code>.
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="movement">
                                    <AccordionTrigger>Inventory Movement</AccordionTrigger>
                                    <AccordionContent>
                                        Catatan sejarah keluar-masuk barang. Setiap perubahan stok pasti tercatat di sini, tidak bisa dihapus.
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* FAQ TAB */}
                <TabsContent value="faq" className="space-y-4 mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Pertanyaan Sering Diajukan</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <h4 className="font-semibold text-sm">Bagaimana jika stok saya minus?</h4>
                                <p className="text-sm text-muted-foreground">
                                    Aplikasi ini mencegah stok minus. Anda tidak bisa membuat Sales Order jika stok Available tidak cukup. Pastikan input Pembelian (Purchase Order) atau Penyesuaian Stok (Adjustment) terlebih dahulu.
                                </p>
                            </div>
                            <div className="space-y-2">
                                <h4 className="font-semibold text-sm">Apakah saya bisa menghapus kategori?</h4>
                                <p className="text-sm text-muted-foreground">
                                    Bisa, asalkan kategori tersebut tidak memiliki produk. Jika masih ada produk, Anda harus memindahkan produk ke kategori lain atau menggunakan fitur &quot;Force Delete&quot; (Hapus Paksa) jika tersedia.
                                </p>
                            </div>
                            <div className="space-y-2">
                                <h4 className="font-semibold text-sm">Bagaimana cara mengubah harga?</h4>
                                <p className="text-sm text-muted-foreground">
                                    Masuk ke halaman detail Produk, lalu klik tombol Edit Harga. Semua perubahan harga akan tercatat di Riwayat Harga.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}


