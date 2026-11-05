# Kontrak REST API SapaRW

Dokumen ini mendefinisikan kontrak antara Frontend (React) dan Backend (Laravel 11 + Sanctum).
Selama backend belum dibangun, frontend menggunakan MSW (Mock Service Worker) yang menyimulasikan endpoint-endpoint di bawah ini dan menyimpan state di `localStorage`.

---

## Standar Respons & Error

### Format Sukses
```json
{
  "message": "Operasi berhasil",
  "data": { ... }
}
```
Atau untuk list:
```json
{
  "data": [ ... ],
  "meta": {
    "total": 12,
    "ringkasan": { ... } // opsional untuk summary card
  }
}
```

### Format Error Validasi (HTTP 422 - Standar Laravel)
```json
{
  "message": "Data yang diberikan tidak valid.",
  "errors": {
    "username": ["Username sudah terdaftar."],
    "alasan": ["Alasan wajib diisi jika laporan ditolak."]
  }
}
```

### Format Error Umum (HTTP 400, 401, 403, 404, 500)
```json
{
  "message": "Pesan deskriptif error."
}
```

---

## Tipe Data & Enum Utama

- **Peran**: `'warga' | 'admin'`
- **Status Aduan**: `'Diajukan' | 'Diverifikasi' | 'Diproses' | 'Selesai' | 'Ditolak'`
- **Status Verifikasi Akun**: Kolom `aktif: boolean` (false = belum aktif, true = aktif).

---

## 1. Autentikasi (`/api/auth`)

### 1.1 Registrasi Warga
- **Endpoint**: `POST /api/auth/register`
- **Akses**: Publik
- **Payload**:
  ```json
  {
    "nama": "Budi Santoso",
    "username": "budi01",
    "password": "password123",
    "rt": "02",
    "no_rumah": "14",
    "no_hp": "08123456789"
  }
  ```
- **Respons (201)**:
  ```json
  {
    "message": "Pendaftaran berhasil! Akun Anda sedang menunggu verifikasi/aktivasi dari Pengurus RW sebelum dapat digunakan untuk masuk.",
    "data": {
      "id_pengguna": 5,
      "nama": "Budi Santoso",
      "username": "budi01",
      "peran": "warga",
      "aktif": false
    }
  }
  ```

### 1.2 Login Warga & Pengurus
- **Endpoint**: `POST /api/auth/login`
- **Akses**: Publik
- **Payload**:
  ```json
  {
    "username": "budi01",
    "password": "password123",
    "peran_target": "warga" // atau "admin" untuk validasi guard
  }
  ```
- **Respons (200)**:
  ```json
  {
    "message": "Login berhasil",
    "data": {
      "user": {
        "id_pengguna": 1,
        "nama": "Budi Santoso",
        "username": "budi01",
        "peran": "warga",
        "aktif": true,
        "rt": "02",
        "no_rumah": "14",
        "no_hp": "08123456789"
      },
      "token": "sanctum_mock_token_xyz"
    }
  }
  ```
- **Respons (403 jika akun belum aktif)**:
  ```json
  {
    "message": "Akun Anda belum diaktifkan oleh Pengurus RW. Silakan hubungi pengurus atau tunggu proses verifikasi."
  }
  ```

### 1.3 Me (Info Pengguna Sedang Login)
- **Endpoint**: `GET /api/auth/me`
- **Akses**: Authenticated
- **Respons (200)**: `{ "data": { ...user } }`

### 1.4 Logout
- **Endpoint**: `POST /api/auth/logout`
- **Akses**: Authenticated
- **Respons (200)**: `{ "message": "Berhasil keluar" }`

### 1.5 Update Profil & Ganti Password
- `PUT /api/auth/profil` (nama, no_hp, no_rumah)
- `PUT /api/auth/password` (password_lama, password_baru)

---

## 2. Publik & Data Master (`/api/...`)

### 2.1 Statistik Publik
- **Endpoint**: `GET /api/publik/statistik`
- **Respons**:
  ```json
  {
    "data": {
      "total_aduan": 24,
      "selesai": 18,
      "diproses": 4,
      "diverifikasi": 1,
      "diajukan": 1
    }
  }
  ```

### 2.2 Kategori Fasilitas (Aktif)
- **Endpoint**: `GET /api/kategori`
- **Respons**: List kategori fasilitas dengan status `aktif: true`

---

## 3. Pengaduan - Sisi Warga (`/api/aduan`)

### 3.1 Daftar Aduan Saya
- **Endpoint**: `GET /api/aduan`
- **Query Params**: `status` (opsional)
- **Respons (200)**: List aduan pelapor bersangkutan, terurut terbaru. Ada penanda `ada_pembaruan: boolean`.

### 3.2 Detail Aduan Saya
- **Endpoint**: `GET /api/aduan/{id}`
- **Respons (200)**: Termasuk `kategori`, `lampiran_foto`, `tanggapan` (list), dan `riwayat_status` (list terurut waktu). Otomatis update `dilihat_pelapor_pada`.

### 3.3 Buat Aduan Baru
- **Endpoint**: `POST /api/aduan`
- **Format**: `multipart/form-data`
- **Payload**:
  - `id_kategori`: int
  - `lokasi`: string (misal: "RT 02, dekat pos ronda")
  - `isi_pengaduan`: string
  - `fotos[]`: File[] (maksimal 3, jpg/png/webp)
- **Respons (201)**:
  ```json
  {
    "message": "Pengaduan berhasil diajukan",
    "data": {
      "id_pengaduan": 7,
      "nomor_pengaduan": "ADU-2026-007",
      "status_terkini": "Diajukan",
      "diajukan_pada": "2026-11-04 08:30:00"
    }
  }
  ```

### 3.4 Batalkan / Hapus Aduan (Hanya jika masih 'Diajukan')
- **Endpoint**: `DELETE /api/aduan/{id}`

---

## 4. Pengaduan & Rekap - Sisi Pengurus RW (`/api/admin/...`)

### 4.1 Daftar Aduan Admin
- **Endpoint**: `GET /api/admin/aduan`
- **Query Params**: `cari`, `status`, `page`
- **Respons (200)**:
  ```json
  {
    "data": [ ... ],
    "ringkasan": {
      "total": 6,
      "diajukan": 1,
      "diverifikasi": 1,
      "diproses": 1,
      "selesai": 2,
      "ditolak": 1
    }
  }
  ```

### 4.2 Detail Aduan Admin
- **Endpoint**: `GET /api/admin/aduan/{id}`
- **Respons (200)**: Data lengkap aduan, pelapor, foto, timeline riwayat status, dan daftar tanggapan.

### 4.3 Update Status Verifikasi & Tindak Lanjut
- **Endpoint**: `POST /api/admin/aduan/{id}/status`
- **Payload**:
  ```json
  {
    "status_baru": "Diverifikasi", // atau "Diproses", "Selesai", "Ditolak"
    "catatan": "Laporan diterima dan akan dikoordinasikan",
    "di_luar_kewenangan": false,
    "diteruskan_kepada": null
  }
  ```
- **Aturan Validasi**:
  - Jika `status_baru === 'Ditolak'`, `catatan` wajib diisi (alasan penolakan).
  - Jika `di_luar_kewenangan === true`, `diteruskan_kepada` wajib diisi.

### 4.4 Kirim Tanggapan
- **Endpoint**: `POST /api/admin/aduan/{id}/tanggapan`
- **Payload**: `{ "isi_tanggapan": "Petugas kebersihan sudah dikerahkan ke lokasi." }`

### 4.5 Verifikasi & Kelola Akun Warga
- **Endpoint**: `GET /api/admin/pengguna`
  - Query: `tab` (`belum_aktif` | `aktif` | `semua`), `cari`
- **Endpoint**: `PATCH /api/admin/pengguna/{id}/aktif`
  - Payload: `{ "aktif": true }` (atau `false`)
- **Endpoint**: `POST /api/admin/pengguna/{id}/reset-password`
  - Payload: `{ "password_baru": "warga123" }`

### 4.6 Kelola Kategori Fasilitas
- `GET /api/admin/kategori`
- `POST /api/admin/kategori` `{ "nama_kategori": "...", "deskripsi": "..." }`
- `PUT /api/admin/kategori/{id}`
- `PATCH /api/admin/kategori/{id}/aktif` `{ "aktif": boolean }`

### 4.7 Rekap & Laporan
- **Endpoint**: `GET /api/admin/rekap`
- **Query Params**: `dari_tanggal`, `sampai_tanggal`, `id_kategori`, `status`
- **Respons**:
  - Matriks data `kategori` x `status` (Diajukan, Diverifikasi, Diproses, Selesai, Ditolak, Total)
  - Detail item aduan dalam rentang filter untuk keperluan cetak dokumen/tabel resmi RW.
