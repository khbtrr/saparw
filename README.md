# SapaRW: Sistem Informasi Pengaduan Fasilitas Lingkungan (RW 05 Desa Karangraharja)

Sistem informasi berbasis web untuk pengelolaan pengaduan fasilitas lingkungan warga RW 05 Desa Karangraharja. Dibangun dengan arsitektur SPA React (Vite + TypeScript) dan REST API Laravel (PHP + MySQL).

---

## Stack Teknologi

- Frontend: React 18, Vite, TypeScript, Tailwind CSS, TanStack Query v5, React Router DOM v6, Lucide React, MSW (Mock Service Worker).
- Backend: Laravel (PHP 8.2+), Laravel Sanctum (Token Auth), Eloquent ORM.
- Database: MySQL (`saparw_db`), mencakup 6 tabel sesuai rancangan ERD.
- Standar Antarmuka: Mengikuti panduan antislop dengan setelan dial ENERGY 1, RHYTHM 1, dan MOTION 1 (utilitas publik warga dan panel administrasi pengurus RW).

---

## Panduan Menjalankan Sistem

### 1. Menjalankan Backend (Laravel API)

1. Pastikan layanan MySQL di XAMPP Control Panel aktif pada port default (`localhost:3306`) dan database `saparw_db` telah tersedia.
2. Masuk ke folder `backend` lalu jalankan migrasi database (jika belum atau ada pembaruan tabel):
   ```powershell
   cd d:\kuproy\SapaRW\backend
   php artisan migrate
   ```
3. Jalankan server artisan:
   ```powershell
   php artisan serve --port=8000
   ```
   Layanan API aktif di `http://127.0.0.1:8000/api`.

### 2. Menjalankan Frontend (React SPA)

1. Buka terminal baru, masuk ke folder `frontend`, lalu jalankan server pengembangan:
   ```powershell
   cd d:\kuproy\SapaRW\frontend
   npm run dev
   ```
2. Buka peramban pada alamat lokal yang tertera (default: `http://localhost:5173/`).

---

## Akun Demo

Data pengguna berikut tersedia langsung di basis data lokal:

| Peran | Username | Password | Deskripsi |
|---|---|---|---|
| Ketua RW 05 | `admin` | `SapaRW05#Karangraharja2026` | Administrator pengurus RW. Mengelola laporan aduan, verifikasi status, tanggapan warga, aktivasi akun, kelola kategori fasilitas, dan rekapitulasi cetak. |
| Warga Aktif | `warga01` | `warga123` | Siti Aminah (Warga RT 02). Mengajukan aduan baru disertai foto dan memantau status laporan. |
| Warga Baru (Pending) | `warga02` | `warga123` | Ahmad Fauzi (RT 03). Akun berstatus belum aktif (`aktif = false`). Akses masuk dibatasi sampai pengurus mengaktifkan akun di panel admin. |

---

## Fitur Aplikasi

### 1. Layanan Warga (Antarmuka Mobile-First)

- Pendaftaran Akun (`/daftar`) dan Masuk Warga (`/masuk`): Formulir pendaftaran warga mencakup nama, RT, nomor rumah, dan kontak WhatsApp. Akun baru masuk antrean verifikasi pengurus.
- Daftar Aduan Saya (`/warga/aduan`): Menampilkan riwayat aduan milik warga bersangkutan, filter status, dan penanda tanggapan baru dari pengurus.
- Formulir Aduan (`/warga/aduan/baru`): Pengisian kategori fasilitas, lokasi RT, deskripsi masalah, unggah lampiran foto (maksimal 3 foto), dan penerbitan nomor tiket unik (`ADU-2026-XXX`).
- Detail Aduan Warga (`/warga/aduan/:id`): Rincian pengaduan, foto bukti, tanggapan tertulis pengurus RW, linimasa riwayat status, dan opsi pembatalan selama status masih Diajukan.
- Profil Warga (`/warga/profil`): Pembaruan identitas domisili dan penggantian kata sandi.

### 2. Panel Pengurus RW (Antarmuka Desktop)

- Masuk Pengurus (`/admin/masuk`): Gerbang masuk resmi bagi pengurus RW 05.
- Daftar Aduan (`/admin/aduan`): Ringkasan status (Total, Diajukan, Diverifikasi, Diproses, Selesai, Ditolak), pencarian teks, filter status, dan tabel aduan.
- Detail Aduan Pengurus (`/admin/aduan/:id`):
  - Kolom info: Rincian aduan warga, foto lapangan, dan riwayat status penanganan.
  - Kolom tindakan: Pembaruan status (Diverifikasi, Diproses, Selesai, Ditolak), opsi penerusan di luar kewenangan RW (instansi terkait), dan formulir pengiriman tanggapan resmi.
- Verifikasi Akun Warga (`/admin/akun`): Pemilahan akun (Belum aktif, Aktif, Semua), pencarian nama/username, dan tombol aktivasi akun warga.
- Kelola Kategori Fasilitas (`/admin/kategori`): Daftar kategori fasilitas umum, penambahan kategori baru, dan sakelar status aktif/nonaktif.
- Rekapitulasi Laporan (`/admin/rekap`): Penyaringan data berdasarkan rentang tanggal, kategori, dan status. Menyajikan tabel matriks silang Kategori × Status serta fungsi cetak laporan berformat kop surat resmi RW 05 dan kolom tanda tangan.

### 3. Beranda Publik (`/`)

- Menampilkan gambaran umum layanan SapaRW 05, statistik ringkas penanganan fasilitas, alur kerja empat tahap resmi, kategori fasilitas lingkungan, dan daftar aduan yang telah tuntas ditangani demi transparansi warga.

---

## Struktur Tabel Basis Data MySQL (`saparw_db`)

1. `pengguna`: Menyimpan data akun pengurus dan warga, nomor RT domisili, nomor rumah, nomor telepon, dan status aktivasi.
2. `kategori_fasilitas`: Master data kategori fasilitas lingkungan (Lampu Penerangan Jalan, Saluran Drainase/Got, Jalan Lingkungan, Pos Keamanan/Ronda, Kebersihan dan Sampah).
3. `pengaduan`: Data utama aduan warga, nomor aduan unik, lokasi, uraian, status terkini, dan catatan penerusan kewenangan.
4. `lampiran_foto`: Foto bukti kondisi fasilitas yang dilaporkan warga (maksimal 3 foto per aduan).
5. `tanggapan`: Catatan resmi pengurus RW yang dikirimkan kepada pelapor.
6. `riwayat_status`: Rekam jejak perubahan status laporan, dilengkapi catatan tindak lanjut dan identitas pencatat.
