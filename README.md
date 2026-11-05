# SapaRW - Sistem Informasi Pengaduan Fasilitas Lingkungan Berbasis Web (RW 05 Desa Karangraharja)

Sistem Informasi Pengaduan Fasilitas Lingkungan RW 05 Desa Karangraharja berbasis web dengan arsitektur **SPA terpisah (React + Vite + TypeScript)** dan **REST API (Laravel + MySQL)**.

---

## 🛠️ Stack Teknologi

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, TanStack Query v5, React Router DOM v6, Lucide React, MSW (Mock Service Worker).
- **Backend**: Laravel (PHP 8.2+), Laravel Sanctum (Token Auth), Eloquent ORM.
- **Database**: MySQL (`saparw_db`), migrasi 6 tabel sesuai ERD Bab III.
- **Standar Desain & Kode**: Mematuhi aturan `/antislop` (Mode: DURING, Dial: ENERGY 1 / RHYTHM 1 / MOTION 1 - utilitas publik warga & panel administrasi pengurus RW).

---

## 🚀 Panduan Menjalankan Sistem

### 1. Menjalankan Backend (Laravel API)

1. Pastikan service **MySQL** di XAMPP Control Panel telah menyala (`localhost:3306`).
2. Masuk ke direktori `backend` dan jalankan server artisan:
   ```powershell
   cd d:\kuproy\SapaRW\backend
   php artisan serve --port=8000
   ```
   API akan siap melayani di `http://127.0.0.1:8000/api`.

### 2. Menjalankan Frontend (React SPA)

1. Buka terminal baru dan masuk ke direktori `frontend`:
   ```powershell
   cd d:\kuproy\SapaRW\frontend
   npm run dev
   ```
2. Buka browser pada URL yang tampil (default: `http://localhost:5173/`).

---

## 🔑 Akun Demo (Tersedia Otomatis di Database)

| Peran | Username | Password | Deskripsi / Catatan |
|---|---|---|---|
| **Ketua RW 05** | `admin` | `admin123` | Administrator pengurus RW, akses penuh ke kelola aduan, verifikasi status, tanggapan, aktivasi akun warga, kelola kategori, dan rekap/cetak laporan. |
| **Warga Aktif** | `warga01` | `warga123` | Siti Aminah (Warga RT 02). Bisa langsung login, buat aduan (upload foto), dan pantau progres laporan. |
| **Warga Baru (Pending)** | `warga02` | `warga123` | Ahmad Fauzi (RT 03). Akun belum aktif (`aktif = false`). Mencoba login akan ditolak sampai diaktifkan oleh pengurus di panel admin. |

---

## 📋 Fitur yang Telah Selesai (Frontend & Backend)

### 1. Sisi Warga (Mobile-First)
- **Login Warga (`/masuk`) & Pendaftaran Akun (`/daftar`)**: Form pendaftaran langsung mencatat data nama, RT, no. rumah, no. HP dengan status verifikasi `aktif = false`.
- **Daftar Aduan Saya (`/warga/aduan`)**: Menampilkan daftar aduan warga bersangkutan, filter status, dan badge notifikasi tanggapan baru.
- **Form Aduan (`/warga/aduan/baru`)**: Pemilihan kategori fasilitas, input lokasi RT, uraian keluhan, upload foto lampiran (maks 3 foto), serta konfirmasi nomor unik (`ADU-2026-XXX`).
- **Detail Aduan Warga (`/warga/aduan/:id`)**: Informasi laporan, lampiran foto, tanggapan pengurus RW, timeline riwayat status, serta tombol pembatalan laporan jika masih `Diajukan`.
- **Profil Pengguna (`/warga/profil`)**: Pengaturan data domisili dan pembaruan kata sandi.

### 2. Sisi Pengurus RW (Desktop Panel)
- **Login Pengurus RW (`/admin/masuk`)**: Form login desktop dengan layout panel khusus.
- **Daftar Aduan (`/admin/aduan`)**: Dilengkapi **6 Kotak Ringkasan** (*Total, Diajukan, Diverifikasi, Diproses, Selesai, Ditolak*), bar pencarian terpadu, filter status, dan tabel aduan.
- **Detail Aduan (`/admin/aduan/:id`)**: Layout 2 kolom:
  - Kiri: Detail laporan warga, lampiran foto dokumentasi, dan timeline riwayat status.
  - Kanan: Form verifikasi status, checkbox *Di luar kewenangan RW* (instansi tujuan penerusan), dan form kirim tanggapan resmi.
- **Verifikasi Akun Warga (`/admin/akun`)**: Tab filter (*Belum aktif, Aktif, Semua*), pencarian nama/username, dan tombol aksi *Aktifkan/Nonaktifkan*.
- **Kelola Kategori Fasilitas (`/admin/kategori`)**: Tabel kategori fasilitas dengan toggle sakelar aktifasi dan form penambahan kategori baru.
- **Rekap & Laporan (`/admin/rekap`)**: Filter rentang tanggal (Dari - Sampai), kategori, dan status. Menyajikan tabel matriks silang **Kategori × Status (Dj, Dv, Dp, Sl, Dt, Total)** dan tombol **Cetak Laporan** lengkap dengan format kop surat resmi RW 05 dan kolom tanda tangan (siap cetak / simpan ke PDF).

### 3. Landing Page Publik (`/`)
- Menampilkan profil layanan pengaduan RW 05, statistik transparan jumlah laporan, dan alur 4 tahap penanganan fasilitas.

---

## 🗄️ Struktur Basis Data MySQL (`saparw_db`)

1. `pengguna`: Menyimpan data akun pengurus dan warga beserta domisili RT dan status aktivasi.
2. `kategori_fasilitas`: Master data kategori keluhan fasilitas (Lampu Jalan, Saluran Got, Jalan Rusak, Pos Ronda, Sampah).
3. `pengaduan`: Data utama aduan warga beserta nomor aduan unik, status terkini, dan instansi penerusan.
4. `lampiran_foto`: Dokumentasi foto keluhan fasilitas (maksimal 3 foto).
5. `tanggapan`: Catatan resmi pengurus RW yang ditujukan kepada pelapor.
6. `riwayat_status`: Audit trail rekam jejak status laporan beserta catatan dan identitas petugas pencatat.
