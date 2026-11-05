<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Seed Pengguna
        DB::table('pengguna')->insert([
            [
                'id_pengguna' => 1,
                'nama' => 'Ketua RW 05 (Pak Bambang)',
                'username' => 'admin',
                'password' => Hash::make('admin123'),
                'peran' => 'admin',
                'aktif' => true,
                'rt' => '01',
                'no_rumah' => '01',
                'no_hp' => '081288880001',
                'dibuat_pada' => '2026-01-01 08:00:00',
            ],
            [
                'id_pengguna' => 2,
                'nama' => 'Warga 01 (Siti Aminah)',
                'username' => 'warga01',
                'password' => Hash::make('warga123'),
                'peran' => 'warga',
                'aktif' => true,
                'rt' => '02',
                'no_rumah' => '12',
                'no_hp' => '081299990001',
                'dibuat_pada' => '2026-01-10 09:15:00',
            ],
            [
                'id_pengguna' => 3,
                'nama' => 'Warga 02 (Ahmad Fauzi)',
                'username' => 'warga02',
                'password' => Hash::make('warga123'),
                'peran' => 'warga',
                'aktif' => false,
                'rt' => '03',
                'no_rumah' => '05',
                'no_hp' => '081299990002',
                'dibuat_pada' => '2026-10-20 14:30:00',
            ],
            [
                'id_pengguna' => 4,
                'nama' => 'Warga 03 (Joko Susilo)',
                'username' => 'warga03',
                'password' => Hash::make('warga123'),
                'peran' => 'warga',
                'aktif' => false,
                'rt' => '04',
                'no_rumah' => '19',
                'no_hp' => '081299990003',
                'dibuat_pada' => '2026-10-22 11:20:00',
            ],
            [
                'id_pengguna' => 5,
                'nama' => 'Warga 04 (Rina Mariana)',
                'username' => 'warga04',
                'password' => Hash::make('warga123'),
                'peran' => 'warga',
                'aktif' => true,
                'rt' => '01',
                'no_rumah' => '22',
                'no_hp' => '081299990004',
                'dibuat_pada' => '2026-02-15 10:00:00',
            ],
        ]);

        // 2. Seed Kategori Fasilitas
        DB::table('kategori_fasilitas')->insert([
            ['id_kategori' => 1, 'nama_kategori' => 'Lampu Jalan', 'deskripsi' => 'Penerangan jalan lingkungan, lampu mati/redup/rusak', 'aktif' => true],
            ['id_kategori' => 2, 'nama_kategori' => 'Saluran Got', 'deskripsi' => 'Drainase, saluran air tersumbat sampah, luapan air', 'aktif' => true],
            ['id_kategori' => 3, 'nama_kategori' => 'Jalan Rusak', 'deskripsi' => 'Jalan berlubang/rusak, paving lepas', 'aktif' => true],
            ['id_kategori' => 4, 'nama_kategori' => 'Pos Ronda', 'deskripsi' => 'Fasilitas bersama pos kamling, atap bocor, pintu rusak', 'aktif' => true],
            ['id_kategori' => 5, 'nama_kategori' => 'Sampah', 'deskripsi' => 'Sampah menumpuk, bak sampah rusak, TPS liar', 'aktif' => true],
        ]);

        // 3. Seed Pengaduan Contoh
        DB::table('pengaduan')->insert([
            [
                'id_pengaduan' => 1,
                'nomor_pengaduan' => 'ADU-2026-001',
                'id_pelapor' => 2,
                'id_kategori' => 1,
                'judul' => 'Lampu Jalan – Lampu di gang 2 RT 02 mati total sudah 3 hari',
                'isi_pengaduan' => 'Lampu penerangan jalan di tiang depan rumah No 12 gang 2 mati sejak hari Selasa, kondisi gang sangat gelap di malam hari membahayakan warga.',
                'lokasi' => 'RT 02, dekat tiang listrik depan rumah No 12',
                'status_terkini' => 'Diajukan',
                'diteruskan_kepada' => null,
                'diajukan_pada' => '2026-10-24 19:30:00',
                'diperbarui_pada' => '2026-10-24 19:30:00',
                'dilihat_pelapor_pada' => '2026-10-24 19:30:00',
            ],
            [
                'id_pengaduan' => 2,
                'nomor_pengaduan' => 'ADU-2026-002',
                'id_pelapor' => 5,
                'id_kategori' => 2,
                'judul' => 'Saluran Got – Saluran got tersumbat sampah plastik dan meluap',
                'isi_pengaduan' => 'Got utama RT 01 mampet karena tumpukan sampah kiriman dan endapan lumpur, air meluap ke badan jalan setiap hujan deras.',
                'lokasi' => 'RT 01, jalan utama samping pos ronda',
                'status_terkini' => 'Diverifikasi',
                'diteruskan_kepada' => null,
                'diajukan_pada' => '2026-10-23 08:20:00',
                'diperbarui_pada' => '2026-10-23 10:15:00',
                'dilihat_pelapor_pada' => '2026-10-23 10:15:00',
            ],
            [
                'id_pengaduan' => 3,
                'nomor_pengaduan' => 'ADU-2026-003',
                'id_pelapor' => 2,
                'id_kategori' => 3,
                'judul' => 'Jalan Rusak – Jalan berlubang cukup dalam di persimpangan gang',
                'isi_pengaduan' => 'Ada lubang aspal berdiameter 60cm dengan kedalaman 10cm. Sudah ada warga yang terpeleset saat naik motor malam hari.',
                'lokasi' => 'RT 02, persimpangan gang Cendana IV',
                'status_terkini' => 'Diproses',
                'diteruskan_kepada' => 'Dinas Bina Marga / Desa Karangraharja',
                'diajukan_pada' => '2026-10-20 14:10:00',
                'diperbarui_pada' => '2026-10-22 09:00:00',
                'dilihat_pelapor_pada' => '2026-10-21 08:00:00',
            ],
            [
                'id_pengaduan' => 4,
                'nomor_pengaduan' => 'ADU-2026-004',
                'id_pelapor' => 5,
                'id_kategori' => 4,
                'judul' => 'Pos Ronda – Atap pos ronda bocor dan papan tempat duduk lapuk',
                'isi_pengaduan' => 'Atap asbes pos kamling pecah terkena ranting pohon, air masuk saat hujan sehingga warga tidak bisa jaga malam dengan nyaman.',
                'lokasi' => 'RT 04, Jl. Manggis No. 01 samping gerbang',
                'status_terkini' => 'Selesai',
                'diteruskan_kepada' => null,
                'diajukan_pada' => '2026-10-15 11:00:00',
                'diperbarui_pada' => '2026-10-18 16:00:00',
                'dilihat_pelapor_pada' => '2026-10-18 17:00:00',
            ],
            [
                'id_pengaduan' => 5,
                'nomor_pengaduan' => 'ADU-2026-005',
                'id_pelapor' => 2,
                'id_kategori' => 5,
                'judul' => 'Sampah – Sampah liar menumpuk di tanah kosong perbatasan RT',
                'isi_pengaduan' => 'Banyak kantong sampah plastik dibuang sembarangan oleh orang lewat di pinggir jalan tanah kosong, bau menyengat.',
                'lokasi' => 'RT 05, tanah kosong Jl. Dahlia',
                'status_terkini' => 'Selesai',
                'diteruskan_kepada' => null,
                'diajukan_pada' => '2026-10-10 09:00:00',
                'diperbarui_pada' => '2026-10-12 11:00:00',
                'dilihat_pelapor_pada' => '2026-10-12 12:00:00',
            ],
            [
                'id_pengaduan' => 6,
                'nomor_pengaduan' => 'ADU-2026-006',
                'id_pelapor' => 2,
                'id_kategori' => 1,
                'judul' => 'Lampu Jalan – Pasang lampu hias pribadi di tiang jalan',
                'isi_pengaduan' => 'Mohon RW memasangkan lampu sorot warna-warni pribadi saya di tiang jalan umum.',
                'lokasi' => 'RT 02, tiang listrik pribadi',
                'status_terkini' => 'Ditolak',
                'diteruskan_kepada' => null,
                'diajukan_pada' => '2026-10-05 13:00:00',
                'diperbarui_pada' => '2026-10-05 15:30:00',
                'dilihat_pelapor_pada' => '2026-10-05 16:00:00',
            ],
        ]);

        // 4. Seed Riwayat Status & Tanggapan
        DB::table('riwayat_status')->insert([
            ['id_pengaduan' => 1, 'id_pencatat' => 2, 'status_sebelumnya' => null, 'status_baru' => 'Diajukan', 'catatan' => 'Laporan baru dikirim warga', 'dicatat_pada' => '2026-10-24 19:30:00'],
            ['id_pengaduan' => 2, 'id_pencatat' => 5, 'status_sebelumnya' => null, 'status_baru' => 'Diajukan', 'catatan' => 'Laporan dibuat', 'dicatat_pada' => '2026-10-23 08:20:00'],
            ['id_pengaduan' => 2, 'id_pencatat' => 1, 'status_sebelumnya' => 'Diajukan', 'status_baru' => 'Diverifikasi', 'catatan' => 'Laporan diverifikasi oleh Ketua RW, dijadwalkan kerja bakti', 'dicatat_pada' => '2026-10-23 10:15:00'],
            ['id_pengaduan' => 3, 'id_pencatat' => 2, 'status_sebelumnya' => null, 'status_baru' => 'Diajukan', 'catatan' => null, 'dicatat_pada' => '2026-10-20 14:10:00'],
            ['id_pengaduan' => 3, 'id_pencatat' => 1, 'status_sebelumnya' => 'Diajukan', 'status_baru' => 'Diverifikasi', 'catatan' => 'Diverifikasi oleh admin', 'dicatat_pada' => '2026-10-21 08:30:00'],
            ['id_pengaduan' => 3, 'id_pencatat' => 1, 'status_sebelumnya' => 'Diverifikasi', 'status_baru' => 'Diproses', 'catatan' => 'Pengadaan semen dan pasir swadaya serta surat permohonan aspal desa telah diajukan', 'dicatat_pada' => '2026-10-22 09:00:00'],
            ['id_pengaduan' => 4, 'id_pencatat' => 5, 'status_sebelumnya' => null, 'status_baru' => 'Diajukan', 'catatan' => null, 'dicatat_pada' => '2026-10-15 11:00:00'],
            ['id_pengaduan' => 4, 'id_pencatat' => 1, 'status_sebelumnya' => 'Diajukan', 'status_baru' => 'Diverifikasi', 'catatan' => 'Diverifikasi pengurus', 'dicatat_pada' => '2026-10-15 13:00:00'],
            ['id_pengaduan' => 4, 'id_pencatat' => 1, 'status_sebelumnya' => 'Diverifikasi', 'status_baru' => 'Diproses', 'catatan' => 'Penggantian asbes dan pengecatan', 'dicatat_pada' => '2026-10-16 09:00:00'],
            ['id_pengaduan' => 4, 'id_pencatat' => 1, 'status_sebelumnya' => 'Diproses', 'status_baru' => 'Selesai', 'catatan' => 'Perbaikan pos ronda selesai dilakukan oleh tim swadaya RW', 'dicatat_pada' => '2026-10-18 16:00:00'],
            ['id_pengaduan' => 5, 'id_pencatat' => 2, 'status_sebelumnya' => null, 'status_baru' => 'Diajukan', 'catatan' => null, 'dicatat_pada' => '2026-10-10 09:00:00'],
            ['id_pengaduan' => 5, 'id_pencatat' => 1, 'status_sebelumnya' => 'Diajukan', 'status_baru' => 'Selesai', 'catatan' => 'Sampah sudah diangkut armada kebersihan desa dan dipasang spanduk dilarang membuang sampah', 'dicatat_pada' => '2026-10-12 11:00:00'],
            ['id_pengaduan' => 6, 'id_pencatat' => 2, 'status_sebelumnya' => null, 'status_baru' => 'Diajukan', 'catatan' => null, 'dicatat_pada' => '2026-10-05 13:00:00'],
            ['id_pengaduan' => 6, 'id_pencatat' => 1, 'status_sebelumnya' => 'Diajukan', 'status_baru' => 'Ditolak', 'catatan' => 'Pengaduan tidak sesuai kriteria fasilitas umum lingkungan RW. Pemasangan perlengkapan pribadi pada tiang PLN tidak diperbolehkan.', 'dicatat_pada' => '2026-10-05 15:30:00'],
        ]);

        DB::table('tanggapan')->insert([
            ['id_pengaduan' => 2, 'id_pengurus' => 1, 'isi_tanggapan' => 'Terima kasih laporannya Bu Rina. Pengurus sudah memeriksa dan akan mengkoordinasikan kerja bakti RT 01 hari Minggu besok.', 'ditanggapi_pada' => '2026-10-23 10:20:00'],
            ['id_pengaduan' => 3, 'id_pengurus' => 1, 'isi_tanggapan' => 'Laporan sedang ditangani. Bagian jalan sementara diberi penanda drum dan akan ditambal pasir semen swadaya akhir pekan.', 'ditanggapi_pada' => '2026-10-22 09:05:00'],
            ['id_pengaduan' => 4, 'id_pengurus' => 1, 'isi_tanggapan' => 'Perbaikan pos ronda sudah rampung 100%. Terima kasih atas partisipasi aktif warga.', 'ditanggapi_pada' => '2026-10-18 16:05:00'],
            ['id_pengaduan' => 6, 'id_pengurus' => 1, 'isi_tanggapan' => 'Mohon maaf permohonan ditolak karena fasilitas lingkungan hanya untuk penerangan umum standar dan utilitas resmi RW.', 'ditanggapi_pada' => '2026-10-05 15:35:00'],
        ]);
    }
}
