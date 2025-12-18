"use client";

import { ScrollAnimation } from "@/components/ui/scroll-animation";
import { Link } from "@/i18n/routing";
import { ArrowRight, Check, X, Bug, Lightbulb, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function AboutPage() {
    return (
        <div className="flex flex-col min-h-screen bg-white dark:bg-black transition-colors duration-300">
            {/* 1. Hero Section */}
            <header className="container mx-auto px-4 py-20 relative bg-[#FFD700] dark:bg-yellow-600 border-b-4 border-black dark:border-white transition-colors duration-300">
                <div className="absolute inset-0 bg-[url('/dots.svg')] opacity-20" />
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <ScrollAnimation animation="fade-up">
                        <div className="inline-block bg-white dark:bg-black border-2 border-black dark:border-white px-3 py-1 font-bold mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_#ffffff] transform -rotate-2 text-black dark:text-white">
                            TENTANG KAMI
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black leading-tight mb-6 text-black dark:text-white uppercase">
                            GUDANG YANG RAPI ITU BUKAN MIMPI.
                            <br />
                            <span className="bg-white dark:bg-black px-2 border-2 border-black dark:border-white inline-block transform rotate-1 mt-2 md:mt-0 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_#ffffff] text-black dark:text-white">CUMA BUTUH SISTEM WARAS.</span>
                        </h1>
                        <p className="text-xl md:text-2xl font-bold max-w-2xl mx-auto mb-10 bg-white dark:bg-black border-2 border-black dark:border-white p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_#ffffff] text-black dark:text-gray-200">
                            Lumbung adalah aplikasi warehouse management untuk bisnis yang capek sama spreadsheet, selisih stok, dan “kok barangnya hilang ya?”
                        </p>
                        <div className="flex flex-col md:flex-row justify-center gap-4">
                            <Link href="/docs">
                                <Button className="w-full h-14 bg-white dark:bg-black border-2 border-black dark:border-white text-black dark:text-white px-8 py-3 font-black text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_#ffffff] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[6px_6px_0px_0px_#ffffff] transition-all rounded-none uppercase">
                                    📖 Baca Dokumentasi
                                </Button>
                            </Link>
                            <Link href="/changelog">
                                <Button className="w-full h-14 bg-black dark:bg-white text-white dark:text-black border-2 border-black dark:border-white px-8 py-3 font-black text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_#ffffff] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[6px_6px_0px_0px_#ffffff] transition-all rounded-none uppercase">
                                    🛠 Lihat Changelog
                                </Button>
                            </Link>
                        </div>
                    </ScrollAnimation>
                </div>
            </header>

            {/* 2. Origin Story */}
            <section className="border-b-4 border-black dark:border-white bg-white dark:bg-neutral-900 transition-colors duration-300">
                <div className="container mx-auto px-4 py-16">
                    <div className="grid md:grid-cols-12 gap-12 items-center">
                        <div className="md:col-span-7">
                            <ScrollAnimation animation="slide-right">
                                <h2 className="text-4xl font-black mb-6 underline decoration-wavy decoration-pink-500 text-black dark:text-white">Kenapa Lumbung Dibuat?</h2>
                                <div className="space-y-4 text-lg leading-relaxed text-gray-800 dark:text-gray-200 font-medium">
                                    <p>
                                        Saya melihat pola yang sama berulang kali: Stok di sistem bilang ada 10, di rak cuma ada 2. Tim sales jualan barang gaib, tim gudang pusing nyari barang hantu.
                                    </p>
                                    <p>
                                        Solusi yang ada di pasaran? Terlalu berat ("Enterprise ERP" yang butuh training 3 bulan), terlalu mahal, atau terlalu ribet untuk operasional harian.
                                    </p>
                                    <p className="font-bold border-l-4 border-black dark:border-white pl-4 my-4">
                                        Tujuannya sederhana: Bikin alat yang cepat dipakai tim gudang di lapangan, bukan cuma enak dilihat saat demo ke bos.
                                    </p>
                                </div>
                            </ScrollAnimation>
                        </div>
                        <div className="md:col-span-5">
                            <ScrollAnimation animation="scale-up" delay={0.2}>
                                <div className="bg-gray-100 dark:bg-gray-800 border-2 border-black dark:border-white p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_#ffffff] relative transition-colors">
                                    <div className="absolute -top-4 -right-4 bg-pink-500 border-2 border-black dark:border-white w-12 h-12 flex items-center justify-center font-bold rounded-full text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                        !
                                    </div>
                                    <blockquote className="text-xl font-bold italic text-black dark:text-white font-serif">
                                        "Spreadsheet chaos bukanlah takdir. Kita bisa punya single source of truth tanpa harus jadi perusahaan Fortune 500."
                                    </blockquote>
                                    <div className="mt-4 text-sm font-mono border-t-2 border-black dark:border-white pt-2 text-gray-600 dark:text-gray-400 font-bold">
                                        — Filosofi Lumbung
                                    </div>
                                </div>
                            </ScrollAnimation>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. Masalah yang Diselesaikan */}
            <section className="border-b-4 border-black dark:border-white bg-[#00FFFF] dark:bg-cyan-900 transition-colors duration-300">
                <div className="container mx-auto px-4 py-16">
                    <ScrollAnimation>
                        <div className="text-center mb-10">
                            <h2 className="text-4xl font-black bg-white dark:bg-black border-2 border-black dark:border-white inline-block px-4 py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_#ffffff] text-black dark:text-white uppercase">
                                MASALAH DI LAPANGAN
                            </h2>
                        </div>
                    </ScrollAnimation>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { icon: "📉", title: "Stok Fisik ≠ Sistem", desc: "Opname selalu selisih. Bingung barang hilang atau salah catat." },
                            { icon: "🕵️‍♂️", title: "Hantu Gudang", desc: "Perpindahan barang antar rak tidak ke-track. Barang ada, tapi gak ketemu." },
                            { icon: "💸", title: "Blind Margin", desc: "Jualan jalan terus, tapi margin boncos karena retur & barang rusak tak terekam." },
                            { icon: "🐌", title: "Klik... Klik... Lama.", desc: "Operator lambat kerja karena UI kebanyakan tombol & loading." }
                        ].map((item, i) => (
                            <ScrollAnimation key={i} delay={i * 0.1} animation="fade-up" className="h-full">
                                <div className="bg-white dark:bg-black border-2 border-black dark:border-white p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_#ffffff] hover:-translate-y-1 hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[10px_10px_0px_0px_#ffffff] transition-all h-full">
                                    <div className="text-4xl mb-4">{item.icon}</div>
                                    <h3 className="font-black text-xl mb-2 text-black dark:text-white uppercase">{item.title}</h3>
                                    <p className="text-sm font-bold text-gray-700 dark:text-gray-300">{item.desc}</p>
                                </div>
                            </ScrollAnimation>
                        ))}
                    </div>

                    <ScrollAnimation>
                        <div className="mt-14 text-center">
                            <p className="bg-black dark:bg-white text-white dark:text-black inline-block px-6 py-3 font-bold border-2 border-white dark:border-black shadow-[4px_4px_0px_0px_#ffffff] dark:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-lg">
                                Fokus Lumbung: Akurasi Data & Alur Waras Dulu. Otomasi Nanti.
                            </p>
                        </div>
                    </ScrollAnimation>
                </div>
            </section>

            {/* 4. Misi & Prinsip Produk */}
            <section className="border-b-4 border-black dark:border-white bg-white dark:bg-black py-16 transition-colors duration-300">
                <div className="container mx-auto px-4">
                    <ScrollAnimation>
                        <div className="max-w-3xl mx-auto text-center mb-12">
                            <h2 className="text-3xl font-black mb-4 uppercase text-black dark:text-white">MISI KAMI</h2>
                            <p className="text-xl font-bold text-gray-800 dark:text-gray-200 italic">
                                "Bikin operasional gudang jadi tertib, cepat, dan bisa diaudit—tanpa bikin tim gudang ikut jadi tim IT."
                            </p>
                        </div>
                    </ScrollAnimation>

                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            { title: "Simple Wins", desc: "Fitur secukupnya yang kepakai beneran. Gak ada fitur gimmick.", color: "decoration-lime-500" },
                            { title: "Fast by Default", desc: "Render ringan, flow pendek. Operator gak boleh nunggu loading.", color: "decoration-pink-500" },
                            { title: "Audit-Ready", desc: "Siapa mindahin apa, kapan, ke mana. Log & jejak jelas.", color: "decoration-cyan-500" },
                            { title: "Offline-Friendly", desc: "Koneksi gudang sering bapuk? Kerja tetap jalan, sync nanti.", color: "decoration-yellow-500" },
                            { title: "Security Baseline", desc: "Role & permission itu wajib sejak hari pertama, bukan fitur premium.", color: "decoration-purple-500" },
                            { title: "Scalable Arch", desc: "Tumbuh bareng bisnis tanpa perlu rewrite kode penuh drama.", color: "decoration-blue-500" }
                        ].map((item, i) => (
                            <ScrollAnimation key={i} delay={i * 0.1} animation="scale-up">
                                <div className="p-5 border-2 border-black dark:border-white bg-gray-50 dark:bg-neutral-900 transition-colors h-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_#ffffff]">
                                    <h4 className={`font-black underline decoration-4 ${item.color} mb-2 text-black dark:text-white text-lg uppercase`}>{item.title}</h4>
                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.desc}</p>
                                </div>
                            </ScrollAnimation>
                        ))}
                    </div>
                </div>
            </section>

            {/* 5. Solo Dev & 6. Build in Public */}
            <section className="border-b-4 border-black dark:border-white bg-gray-100 dark:bg-neutral-800 py-16 transition-colors duration-300">
                <div className="container mx-auto px-4">
                    <div className="grid lg:grid-cols-2 gap-12">

                        {/* Solo Process */}
                        <ScrollAnimation animation="slide-right">
                            <h2 className="text-3xl font-black mb-6 text-black dark:text-white">DIBANGUN SOLO,<br className="hidden md:block" />DIKELOLA DISIPLIN.</h2>
                            <p className="mb-6 text-lg text-gray-700 dark:text-gray-300 font-medium">
                                Meskipun dikerjakan solo, proses development mengikuti standar tim engineering besar. Tidak ada kode "cowboy".
                            </p>

                            <div className="space-y-4 font-mono text-sm text-black dark:text-white">
                                {[
                                    { step: "1. FEEDBACK", desc: "Dengar User", icon: "👂" },
                                    { step: "2. TRIAGE", desc: "Critical > Nice to have", icon: "⚖️" },
                                    { step: "3. FIX", desc: "Test & Code", icon: "💻" },
                                    { step: "4. RELEASE", desc: "Deploy + Note", icon: "🚀", highlight: true }
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center group cursor-default">
                                        <div className="w-28 font-bold flex items-center gap-2">{item.step}</div>
                                        <div className="flex-1 border-b-2 border-dashed border-black dark:border-white mx-2 group-hover:border-solid transition-all"></div>
                                        <div className={`${item.highlight ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-white dark:bg-gray-800 border-2 border-black dark:border-white'} px-2 py-1 font-bold transition-colors`}>
                                            {item.desc}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollAnimation>

                        {/* Build in Public */}
                        <ScrollAnimation animation="slide-left" delay={0.2} className="h-full">
                            <div className="bg-white dark:bg-black border-2 border-black dark:border-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_#ffffff] transition-colors h-full flex flex-col justify-center">
                                <h3 className="text-xl font-black mb-4 flex items-center gap-2 text-black dark:text-white uppercase">
                                    <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse border border-black"></span>
                                    TRANSPARAN (BUILD IN PUBLIC)
                                </h3>
                                <p className="mb-6 text-sm text-gray-600 dark:text-gray-400 font-bold">
                                    Kalau ada yang belum ada, saya tulis jelas. Yang penting arahnya kelihatan.
                                </p>

                                <div className="space-y-3">
                                    {[
                                        { title: "📜 Changelog", desc: "Lihat Update", hover: "hover:bg-yellow-400 dark:hover:bg-yellow-700" },
                                        { title: "🗺️ Roadmap Publik", desc: "Now / Next / Later", hover: "hover:bg-lime-400 dark:hover:bg-lime-700" },
                                        { title: "🐛 Known Issues", desc: "Status Perbaikan", hover: "hover:bg-pink-400 dark:hover:bg-pink-700" }
                                    ].map((link, i) => (
                                        <Link href="#" key={i} className={`block bg-gray-50 dark:bg-gray-900 ${link.hover} border-2 border-black dark:border-white p-3 flex justify-between items-center transition-all group hover:-translate-x-1`}>
                                            <span className="font-bold text-black dark:text-white">{link.title}</span>
                                            <span className="text-sm text-black dark:text-white group-hover:translate-x-1 transition-transform font-mono font-bold">{link.desc} -&gt;</span>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </ScrollAnimation>

                    </div>
                </div>
            </section>

            {/* 7. Reliability & 8. Security */}
            <section className="border-b-4 border-black dark:border-white bg-white dark:bg-black py-16 transition-colors duration-300">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-2 gap-12">
                        {/* Reliability */}
                        <ScrollAnimation animation="fade-up">
                            <h2 className="text-2xl font-black mb-4 bg-black dark:bg-white text-white dark:text-black inline-block px-2 transition-colors uppercase">KEANDALAN DATA</h2>
                            <p className="mb-4 text-gray-800 dark:text-gray-200 font-medium">
                                Transaksi penting punya jejak. Validasi ketat supaya input gak "asal lewat". Pagination & caching seperlunya.
                            </p>
                            <div className="grid grid-cols-1 gap-3">
                                {[
                                    { text: "Release Notes Selalu Ada", color: "border-cyan-500" },
                                    { text: "Bug Critical = Prioritas #1", color: "border-pink-500" },
                                    { text: "Konsistensi Struktur Data", color: "border-black dark:border-white" }
                                ].map((item, i) => (
                                    <div key={i} className={`border-l-4 ${item.color} pl-4 py-2 bg-gray-50 dark:bg-neutral-900`}>
                                        <span className="font-bold text-black dark:text-white">{item.text}</span>
                                    </div>
                                ))}
                            </div>
                        </ScrollAnimation>

                        {/* Security */}
                        <ScrollAnimation animation="fade-up" delay={0.2}>
                            <h2 className="text-2xl font-black mb-4 bg-black dark:bg-white text-white dark:text-black inline-block px-2 transition-colors uppercase">PRIVASI & SECURITY</h2>
                            <p className="mb-4 font-black text-black dark:text-white">Data gudang itu sensitif. Titik.</p>
                            <ul className="space-y-2 font-medium text-gray-800 dark:text-gray-200">
                                {[
                                    "Data 100% milik pelanggan.",
                                    "RBAC (Akses berbasis peran) di setiap endpoint.",
                                    "Audit log untuk aksi penting (Delete/Edit stok).",
                                    "Backup rutin & Retensi data jelas."
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 bg-black dark:bg-white rounded-full"></span>
                                        {item}
                                    </li>
                                ))}
                                <li className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-black dark:bg-white rounded-full"></span>
                                    <span><span className="bg-red-200 dark:bg-red-900 px-1 font-bold">TIDAK</span> menjual data / profiling.</span>
                                </li>
                            </ul>
                        </ScrollAnimation>
                    </div>
                </div>
            </section>

            {/* 9. Audience & 10. Contact */}
            <section className="bg-[#FFD700] dark:bg-yellow-600 py-16 transition-colors duration-300 relative border-b-4 border-black dark:border-white overflow-hidden">
                <div className="absolute inset-0 bg-[url('/dots.svg')] opacity-20" />
                <div className="container mx-auto px-4 relative z-10">
                    {/* Audience */}
                    <div className="grid md:grid-cols-2 gap-8 mb-16">
                        <ScrollAnimation animation="slide-right" className="h-full">
                            <div className="bg-white dark:bg-black border-2 border-black dark:border-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_#ffffff] transition-colors h-full">
                                <h3 className="text-xl font-black mb-4 text-green-600 dark:text-green-400 flex items-center gap-2 uppercase">
                                    <Check className="border-2 border-green-600 dark:border-green-400 p-0.5" /> COCOK UNTUK:
                                </h3>
                                <ul className="space-y-3 text-sm font-bold text-black dark:text-white">
                                    <li>• UMKM, Toko, Grosir, Distributor menengah</li>
                                    <li>• Tim gudang yang butuh SOP sederhana</li>
                                    <li>• Bisnis yang mulai sering selisih stok</li>
                                </ul>
                            </div>
                        </ScrollAnimation>
                        <ScrollAnimation animation="slide-left" className="h-full">
                            <div className="bg-gray-200 dark:bg-neutral-800 border-2 border-gray-400 dark:border-gray-500 p-6 text-gray-500 dark:text-gray-400 transition-colors h-full opacity-90">
                                <h3 className="text-xl font-black mb-4 flex items-center gap-2 uppercase">
                                    <X className="border-2 border-gray-500 p-0.5" /> KURANG COCOK UNTUK:
                                </h3>
                                <ul className="space-y-3 text-sm font-bold">
                                    <li>• Enterprise raksasa yang butuh Custom ERP Heavy</li>
                                    <li>• Bisnis yang butuh implementasi on-site 6 bulan</li>
                                </ul>
                            </div>
                        </ScrollAnimation>
                    </div>

                    {/* Contact */}
                    <ScrollAnimation animation="scale-up">
                        <div className="max-w-2xl mx-auto text-center bg-white dark:bg-black border-2 border-black dark:border-white p-8 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] dark:shadow-[10px_10px_0px_0px_#ffffff] relative transition-colors">
                            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-black dark:bg-white text-white dark:text-black px-6 py-2 font-black rotate-2 border-2 border-white dark:border-black shadow-md transition-colors uppercase text-sm tracking-widest">
                                KONTAK SAYA
                            </div>
                            <h2 className="text-3xl font-black mb-4 mt-4 text-black dark:text-white uppercase">Punya Masukan? Saya Baca.</h2>
                            <p className="mb-8 text-gray-700 dark:text-gray-300 font-bold">Channel terbuka untuk diskusi fitur atau laporan bug. Ekspektasi respon: Realistis (1x24 jam).</p>
                            <div className="flex flex-col sm:flex-row justify-center gap-4">
                                <Link href="#">
                                    <Button className="w-full bg-[#ccff00] dark:bg-lime-700 text-black dark:text-white border-2 border-black dark:border-white px-6 py-6 font-black text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_#ffffff] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[6px_6px_0px_0px_#ffffff] transition-all rounded-none gap-2 uppercase">
                                        <Bug className="h-5 w-5" /> Laporkan Bug
                                    </Button>
                                </Link>
                                <Link href="#">
                                    <Button className="w-full bg-white dark:bg-neutral-800 text-black dark:text-white border-2 border-black dark:border-white px-6 py-6 font-black text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_#ffffff] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[6px_6px_0px_0px_#ffffff] transition-all rounded-none gap-2 uppercase">
                                        <Lightbulb className="h-5 w-5" /> Request Fitur
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </ScrollAnimation>
                </div>
            </section>

            {/* 11. FAQ */}
            <section className="bg-white dark:bg-black py-16 transition-colors duration-300">
                <div className="container mx-auto px-4 max-w-3xl">
                    <ScrollAnimation>
                        <h2 className="text-4xl font-black mb-10 text-center underline decoration-wavy decoration-cyan-500 text-black dark:text-white uppercase">FAQ</h2>
                    </ScrollAnimation>

                    <div className="space-y-6">
                        {[
                            { q: "Beneran dibangun solo?", a: "Ya. Ini memastikan pengambilan keputusan cepat dan visi produk yang konsisten. Namun, saya menggunakan tools & standar industri (CI/CD, Automated Testing) sehingga kualitas setara tim besar." },
                            { q: "Kalau saya butuh fitur X gimana?", a: "Silakan request di Roadmap Publik. Jika fitur tersebut berguna untuk banyak user (bukan custom case unik), akan saya prioritaskan." },
                            { q: "Bagaimana keamanan data?", a: "Data dienkripsi saat transit (SSL) dan at rest. Database di-backup harian secara otomatis ke lokasi terpisah (off-site backup)." },
                            { q: "Gimana kalau internet di gudang jelek?", a: "Lumbung didesain dengan konsep Offline-First untuk fitur inti (scan in/out). Data disimpan lokal di browser/app dan dikirim saat sinyal kembali." }
                        ].map((faq, i) => (
                            <FAQItem key={i} question={faq.q} answer={faq.a} delay={i * 0.1} />
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}

function FAQItem({ question, answer, delay }: { question: string; answer: string, delay: number }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <ScrollAnimation delay={delay} animation="fade-up">
            <div className="border-2 border-black dark:border-white bg-white dark:bg-neutral-900 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_#ffffff]">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex justify-between items-center w-full p-4 font-black text-lg text-left hover:bg-gray-50 dark:hover:bg-neutral-800 text-black dark:text-white transition-colors"
                >
                    <span>{question}</span>
                    <ChevronDown className={`h-6 w-6 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
                >
                    <div className="p-4 border-t-2 border-black dark:border-white bg-gray-50 dark:bg-neutral-800 text-sm font-medium leading-relaxed text-gray-700 dark:text-gray-300">
                        {answer}
                    </div>
                </div>
            </div>
        </ScrollAnimation>
    );
}
