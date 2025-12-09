# Analisis Dampak Migrasi ke Struktur `src/`

Dokumen ini menjelaskan detail dampak, keuntungan, dan kekurangan dari perubahan struktur folder proyek dengan memindahkan kode sumber utama ke dalam direktori `src/`.

## 1. Perubahan Struktur

Saat ini, file aplikasi (`app`, `components`, `lib`, dll.) berada langsung di root project.
**Tujuan**: Memisahkan kode aplikasi dari file konfigurasi project.

### Sebelum (Root Structure)
```
.
├── app/                  <-- Core App Code
├── components/           <-- UI Components
├── lib/                  <-- Utilities
├── features/             <-- Business Logic
├── types/                <-- TypeScript Types
├── public/               <-- Static Assets
├── package.json          <-- Config
├── next.config.ts        <-- Config
└── ... (file config lain berantakan dengan folder kode)
```

### Sesudah (`src/` Directory)
```
.
├── src/                  <-- SANGAT JELAS: Semua kode aplikasi ada di sini
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── features/
│   └── types/
├── public/               <-- Static Assets (tetap di root)
├── package.json          <-- Config
├── next.config.ts        <-- Config
└── ... (file config lebih mudah terlihat)
```

---

## 2. Analisis Dampak

### A. Performa Aplikasi (Runtime)
*   **Pengaruh**: **TIDAK ADA**.
*   **Penjelasan**: Next.js dikompilasi menjadi bundle JavaScript yang sama persis, baik source code ada di root maupun di `src/`. Tidak ada perubahan kecepatan loading halaman atau interaksi user.

### B. Performa Build & Develop
*   **Pengaruh**: **NEGLIGIBLE (Sangat Kecil)**.
*   **Penjelasan**:
    *   Saat pertama kali pindah, cache build lama (`.next`) mungkin perlu di-reset, membuat build pertama sedikit lebih lama (hanya sekali).
    *   Selanjutnya, kecepatan build normal seperti biasa.

### C. Deployment (Vercel / Docker / VPS)
*   **Pengaruh**: **MINIMAL (Perlu Penyesuaian Path)**.
*   **Penjelasan**:
    *   **Vercel/Netlify**: Mendukung struktur `src` secara native. Biasanya otomatis terdeteksi tanpa config tambahan.
    *   **Docker**: Jika menggunakan custom `Dockerfile`, perlu menyesuaikan perintah `COPY`.
        *   Contoh: `COPY app ./app` berubah menjadi `COPY src/app ./src/app`.
    *   **CI/CD (GitHub Actions)**: Jika ada script linting atau testing yang hardcode path (misal `eslint ./app`), perlu diupdate menjadi `eslint ./src/app`.

### D. Maintenance (Pemeliharaan Kode)
*   **Pengaruh**: **POSITIF (Lebih Mudah)**.
*   **Penjelasan**:
    *   Root folder menjadi bersih. Anda langsung tahu file mana yang merupakan konfigurasi project (`package.json`, lint config, tsconfig) dan mana yang kode aplikasi (`src/`).
    *   Mencegah ketidaksengajaan mengedit file konfigurasi saat mencari file kode.
    *   Lebih mudah untuk melakukan "Search in Directory" karena skop kode terisolasi di `src`.

---

## 3. Kelebihan dan Kekurangan

### Kelebihan (Pros)
1.  **Organizational Clarity**: Memisahkan "Configuration" vs "Source Code". Root folder tidak lagi "berisik" dengan campuran folder aplikasi dan file dotfiles.
2.  **Standard Industry Practice**: Banyak framework modern dan tim developer besar menggunakan standar `src/` (create-react-app, Vite, NestJS, dll), sehingga struktur project terasa familiar bagi developer baru.
3.  **Cleaner Root**: Mudah melihat file konfigurasi seperti `Dockerfile`, `README.md`, `.env` tanpa scroll melewati folder aplikasi.
4.  **Security/Deployment Safety**: Mengurangi risiko ketidaksengajaan mendeploy file config root ke public, karena fokus build tool terarah ke `src`.

### Kekurangan (Cons)
1.  **Effort Migrasi Awal**: Membutuhkan pemindahan banyak file dan update import path (walaupun IDE modern bisa melakukan rename refactor otomatis, tetap ada risiko path yang terlewat).
2.  **Git History**: Tergantung cara pemindahan (jika tidak menggunakan `git mv`), history commit per file bisa terputus/reset (tapi biasanya git cukup pintar mendeteksi rename).
3.  **Update Config**: Harus update `tsconfig.json`, `tailwind.config.ts`, dan alias path `@/` agar mengarah ke `src/`. Jika salah config, build akan error.

---

## 4. Kesimpulan

Perubahan ini **sangat direkomendasikan** untuk jangka panjang, terutama agar project terlihat profesional dan rapi ("clean architecture" secara struktur folder). Risiko teknisnya rendah dan hanya terjadi di awal (saat migrasi), sedangkan manfaat maintenance-nya bersifat permanen.

**Rekomendasi**: Lanjutkan migrasi, tetapi pastikan backup/commit kode sebelum eksekusi.
