# Panduan Deployment Produksi SapaRW 05

Dokumen ini berisi langkah-langkah persiapan dan deployment aplikasi **SapaRW 05 Desa Karangraharja** ke server produksi dengan arsitektur **Satu Domain Terpadu** (Nginx melayani build statis React di `/` dan meneruskan `/api/*` serta `/storage/*` ke Laravel).

---

## 1. Prasyarat Server Produksi

- **OS**: Ubuntu 22.04 / 24.04 LTS (atau setara)
- **Web Server**: Nginx
- **PHP**: PHP 8.2+ beserta ekstensi `php-fpm`, `php-mysql`, `php-mbstring`, `php-xml`, `php-curl`, `php-zip`, `php-gd`
- **Database**: MySQL 8.0+ atau MariaDB 10.6+
- **Composer**: v2.x
- **Node.js**: v20 LTS (untuk proses build frontend)

---

## 2. Persiapan Database MySQL

Buat database dan akun pengguna khusus di MySQL:

```sql
CREATE DATABASE saparw_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'saparw_user'@'localhost' IDENTIFIED BY 'PasswordKuatProduksi123!';
GRANT ALL PRIVILEGES ON saparw_db.* TO 'saparw_user'@'localhost';
FLUSH PRIVILEGES;
```

---

## 3. Deployment Backend (Laravel API)

Masuk ke direktori `backend` di server (misal `/var/www/saparw/backend`):

```bash
cd /var/www/saparw/backend

# 1. Instal dependensi produksi tanpa paket dev
composer install --no-dev --optimize-autoloader

# 2. Salin konfigurasi environment produksi
cp .env.production.example .env

# 3. Generate application key
php artisan key:generate

# 4. Buat symbolic link untuk akses lampiran foto (/storage/aduan/*)
php artisan storage:link

# 5. Jalankan migrasi tabel (termasuk personal_access_tokens & 6 tabel SapaRW) beserta data awal
php artisan migrate --seed --force

# 6. Optimasi cache konfigurasi, route, dan view untuk performa produksi
php artisan config:cache
php artisan route:cache
php artisan view:cache

# 7. Atur izin direktori storage dan cache agar dapat ditulis oleh web server
chown -R www-data:www-data storage bootstrap/cache
chmod -R 775 storage bootstrap/cache
```

> **Penting (Keamanan Produksi):** Setelah login pertama kali menggunakan akun pengurus (`admin` / `admin123`), segera ubah kata sandi akun `admin` atau perbarui melalui database produksi.

---

## 4. Build Frontend (React SPA)

Masuk ke direktori `frontend`:

```bash
cd /var/www/saparw/frontend

# 1. Salin konfigurasi environment (pastikan VITE_USE_MOCKS=false dan VITE_SHOW_DEMO_HINT=false)
cp .env.example .env

# 2. Instal dependensi dan jalankan build produksi
npm ci
npm run build
```

Hasil kompilasi statis akan berada di direktori `/var/www/saparw/frontend/dist`.

---

## 5. Konfigurasi Web Server (Nginx)

Salin file konfigurasi [`deploy/nginx-saparw.conf`](../deploy/nginx-saparw.conf) ke `/etc/nginx/sites-available/saparw`:

```bash
sudo cp /var/www/saparw/deploy/nginx-saparw.conf /etc/nginx/sites-available/saparw
sudo ln -s /etc/nginx/sites-available/saparw /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

Tambahkan sertifikat HTTPS gratis menggunakan Certbot (Let's Encrypt):

```bash
sudo certbot --nginx -d saparw05.karangraharja.desa.id
```

---

## 6. Alternatif: Akses Publik dari Komputer Lokal via Cloudflare Tunnel

Jika Anda ingin menjalankan aplikasi langsung dari komputer lokal (menggunakan MySQL XAMPP lokal dan penyimpanan foto lokal) namun dapat diakses publik lewat internet dengan HTTPS gratis:

### Prasyarat
1. Nyalakan **MySQL** di XAMPP Control Panel.
2. Instal **Cloudflare Tunnel (`cloudflared`)** di Windows (cukup sekali):
   ```powershell
   winget install Cloudflare.cloudflared
   ```

### Cara Cepat (Otomatis dengan Script)
Jalankan script [`start-tunnel.ps1`](../start-tunnel.ps1) dari direktori utama proyek:

```powershell
cd d:\kuproy\SapaRW
.\start-tunnel.ps1
```
*(Gunakan `.\start-tunnel.ps1 -Rebuild` apabila Anda baru saja mengubah kode frontend dan ingin memperbarui bundel produksi).*

### Cara Manual (3 Terminal)
1. **Terminal 1 (Backend Laravel - Port 8000)**:
   ```powershell
   cd d:\kuproy\SapaRW\backend
   php artisan storage:link
   php artisan serve --host=127.0.0.1 --port=8000
   ```
2. **Terminal 2 (Frontend Produksi - Port 4173)**:
   ```powershell
   cd d:\kuproy\SapaRW\frontend
   npm run build
   npm run preview -- --host --port 4173
   ```
3. **Terminal 3 (Cloudflare Tunnel)**:
   ```powershell
   cloudflared tunnel --url http://localhost:4173
   ```
   Salin URL `https://xxxx.trycloudflare.com` yang muncul di terminal. Karena `preview.proxy` di [`frontend/vite.config.ts`](../frontend/vite.config.ts) sudah meneruskan `/api` dan `/storage` ke `http://127.0.0.1:8000`, seluruh fitur dan unggahan foto akan langsung berjalan lewat satu URL tersebut.

---

## 7. Daftar Periksa Pasca-Deploy (Smoke Test)

1. Buka halaman utama `/` dan pastikan angka pada bagian **Statistik Penanganan Aduan RW 05** serta **Aduan Warga yang Telah Selesai** tampil dari MySQL tanpa error di Console.
2. Pastikan `/mockServiceWorker.js` tidak aktif di tab Network / Application DevTools.
3. Uji pendaftaran warga baru di `/daftar` dan pastikan akun berstatus `Belum aktif`.
4. Masuk sebagai pengurus di `/admin/masuk`, aktifkan akun warga baru di menu **Verifikasi Akun**, dan coba ubah salah satu kategori di menu **Kelola Kategori**.
5. Masuk sebagai warga di `/masuk`, ajukan laporan baru disertai unggahan foto (`JPG/PNG/WebP`), lalu pastikan foto tampil dari path `/storage/aduan/...`.
