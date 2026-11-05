# SapaRW - Sistem Informasi Pengaduan Fasilitas Lingkungan RW 05 Desa Karangraharja

Aplikasi web untuk pelaporan dan pemantauan perbaikan fasilitas umum di lingkungan RW 05 Desa Karangraharja. Dibangun menggunakan arsitektur SPA (React, Vite, TypeScript) dan REST API (Laravel, MySQL).

## Stack Teknologi

- Frontend: React 18, Vite, TypeScript, Tailwind CSS, TanStack Query v5, React Router DOM v6, Lucide React, MSW (Mock Service Worker).
- Backend: Laravel (PHP 8.2+), Laravel Sanctum (Token Auth), Eloquent ORM.
- Basis Data: MySQL (`saparw_db`) dengan 6 tabel relasional.
- Standar Desain: Mengikuti aturan `/antislop` (Mode: DURING, Dial: ENERGY 1 / RHYTHM 1 / MOTION 1).

## Menjalankan Sistem

### 1. Backend (Laravel API)

1. Nyalakan layanan MySQL di XAMPP (`localhost:3306`).
2. Masuk ke direktori `backend` dan jalankan server:
   ```powershell
   cd d:\kuproy\SapaRW\backend
   php artisan serve --port=8000
   ```
   Endpoint API aktif di `http://127.0.0.1:8000/api`.

### 2. Frontend (React SPA)

1. Buka terminal baru dan masuk ke direktori `frontend`:
   ```powershell
   cd d:\kuproy\SapaRW\frontend
   npm run dev
   ```
2. Buka `http://localhost:5173/` di peramban.

## Akun Demo (Data Awal Seeder)

| Peran | Username | Password | Catatan |
|---|---|---|---|
| Ketua RW 05 | `admin` | `admin123` | Pengurus RW: verifikasi status aduan, kirim tanggapan, aktivasi akun warga, kelola kategori, dan cetak rekap laporan. |
| Warga Aktif | `warga01` | `warga123` | Siti Aminah (RT 02). Dapat masuk, mengirim aduan beserta foto, dan memantau riwayat status. |
| Warga Baru | `warga02` | `warga123` | Ahmad Fauzi (RT 03). Status `aktif = false`, tidak dapat masuk sebelum diaktifkan pengurus RW. |

## Cakupan Fitur

### 1. Sisi Warga (Mobile-First)
- Masuk (`/masuk`) dan pendaftaran akun warga (`/daftar`) dengan status awal menunggu verifikasi pengurus (`aktif = false`).
- Daftar aduan saya (`/warga/aduan`) dilengkapi filter status dan penanda tanggapan baru.
- Formulir pengaduan (`/warga/aduan/baru`) untuk memilih kategori fasilitas, mengisi lokasi RT, menulis uraian masalah, dan melampirkan maksimal 3 foto (`ADU-YYYY-NNN`).
- Rincian aduan warga (`/warga/aduan/:id`) yang menampilkan informasi laporan, foto, tanggapan pengurus RW, riwayat status, dan pembatalan laporan selama masih berstatus `Diajukan`.
- Profil pengguna (`/warga/profil`) untuk memperbarui data domisili dan kata sandi.

### 2. Sisi Pengurus RW (Panel Administrasi)
- Masuk pengurus RW (`/admin/masuk`).
- Daftar aduan (`/admin/aduan`) dengan 6 kartu ringkasan status, pencarian nomor/lokasi/uraian, dan filter status.
- Rincian aduan (`/admin/aduan/:id`) untuk memperbarui status penanganan, mencatat penerusan ke instansi di luar kewenangan RW, dan mengirim tanggapan resmi.
- Verifikasi akun warga (`/admin/akun`) untuk mengaktifkan atau menonaktifkan akun warga.
- Kelola kategori fasilitas (`/admin/kategori`) untuk menambah, mengubah, atau menonaktifkan kategori fasilitas.
- Rekap dan laporan (`/admin/rekap`) dengan matriks silang Kategori x Status serta tata letak cetak dokumen resmi RW 05.

### 3. Halaman Publik (`/`)
- Menampilkan informasi layanan pengaduan RW 05, statistik laporan dari basis data, alur 4 tahap penanganan, kategori fasilitas aktif, dan daftar aduan yang telah selesai tanpa membuka identitas pelapor.

## Struktur Tabel Basis Data (`saparw_db`)

1. `pengguna`: Data akun pengurus dan warga beserta RT domisili dan status aktivasi.
2. `kategori_fasilitas`: Data induk kategori fasilitas umum.
3. `pengaduan`: Data laporan warga, nomor tiket unik, status terkini, dan tujuan penerusan instansi.
4. `lampiran_foto`: File dokumentasi foto laporan (maksimal 3 foto per aduan).
5. `tanggapan`: Tanggapan resmi pengurus RW pada laporan warga.
6. `riwayat_status`: Rekam jejak perubahan status laporan beserta waktu, catatan, dan pencatat.
