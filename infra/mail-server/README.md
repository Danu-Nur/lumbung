# Stalwart All-in-One Mail & Collaboration Server

Sistem ini didesain menggunakan **Stalwart** versi terbaru yang sudah mencakup fungsi Email Server, Groupware (Kalender/Kontak), dan Analytics dalam satu mesin yang sangat ringan.

## Cara Menjalankan

1.  **Masuk ke folder** `infra/mail-server`.
2.  **Jalankan Command**:
    ```bash
    docker-compose up -d
    ```

## Komponen & Akses

### 1. Stalwart Admin & Analytics (`:8080`)
- **Akses**: `http://localhost:8080`
- **Tujuan**: Konfigurasi domain, manajemen user, dan **Monitoring/Analytics**.
- **Langkah**: Saat pertama kali dibuka, buat akun Administrator. Masuk ke Dashboard untuk melihat statistik email secara real-time.

### 2. SnappyMail Webmail (`:8888`)
- **Akses User**: `http://localhost:8888`
- **Akses Admin**: `http://localhost:8888/?admin` (Pass default: `admin`)
- **Tujuan**: Interface untuk user membaca email, melihat kalender, dan mengelola kontak.
- **Konfigurasi**: Daftarkan domain Anda di panel admin SnappyMail dan arahkan host IMAP/SMTP ke `stalwart-mail`.

## Fitur Unggulan (Built-in di Stalwart)
- **Analytics Terpadu**: Tidak butuh Grafana lagi. Grafik pengiriman, penolakan spam, dan antrean email sudah ada di panel admin.
- **Groupware (Collaboration)**: Mendukung CalDAV (Kalender) dan CardDAV (Kontak) secara bawaan. Bisa langsung dihubungkan ke HP (iOS/Android) atau Outlook.
- **Anti-Spam AI**: Dilengkapi dengan LLM (Large Language Model) filter untuk mendeteksi spam/phishing lebih akurat.
- **Keamanan Rust**: Sangat aman dari bug memori dibandingkan server email tradisional.

## Tips Integrasi Aplikasi
Untuk mengirim email dari aplikasi (Auth, Invoice, dsb), gunakan setting berikut:
- **Host**: `localhost` (atau `stalwart-mail` jika di dalam network docker)
- **Port**: `587`
- **Encryption**: `STARTTLS`
