<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Tabel pengguna
        Schema::create('pengguna', function (Blueprint $table) {
            $table->id('id_pengguna');
            $table->string('nama', 100);
            $table->string('username', 50)->unique();
            $table->string('password', 255);
            $table->enum('peran', ['warga', 'admin']);
            $table->boolean('aktif')->default(true);
            $table->string('rt', 3)->nullable();
            $table->string('no_rumah', 10)->nullable();
            $table->string('no_hp', 20)->nullable();
            $table->timestamp('dibuat_pada')->useCurrent();
        });

        // 2. Tabel kategori_fasilitas
        Schema::create('kategori_fasilitas', function (Blueprint $table) {
            $table->id('id_kategori');
            $table->string('nama_kategori', 100)->unique();
            $table->text('deskripsi')->nullable();
            $table->boolean('aktif')->default(true);
        });

        // 3. Tabel pengaduan
        Schema::create('pengaduan', function (Blueprint $table) {
            $table->id('id_pengaduan');
            $table->string('nomor_pengaduan', 30)->unique();
            $table->unsignedBigInteger('id_pelapor');
            $table->unsignedBigInteger('id_kategori');
            $table->string('judul', 200);
            $table->text('isi_pengaduan');
            $table->text('lokasi');
            $table->enum('status_terkini', ['Diajukan', 'Diverifikasi', 'Diproses', 'Selesai', 'Ditolak'])->default('Diajukan');
            $table->string('diteruskan_kepada', 150)->nullable();
            $table->timestamp('diajukan_pada')->useCurrent();
            $table->timestamp('diperbarui_pada')->useCurrent()->useCurrentOnUpdate();
            $table->timestamp('dilihat_pelapor_pada')->nullable();

            $table->foreign('id_pelapor')->references('id_pengguna')->on('pengguna')->onDelete('cascade');
            $table->foreign('id_kategori')->references('id_kategori')->on('kategori_fasilitas')->onDelete('restrict');
        });

        // 4. Tabel lampiran_foto
        Schema::create('lampiran_foto', function (Blueprint $table) {
            $table->id('id_lampiran');
            $table->unsignedBigInteger('id_pengaduan');
            $table->string('path_foto', 255);
            $table->string('keterangan', 255)->nullable();
            $table->timestamp('diunggah_pada')->useCurrent();

            $table->foreign('id_pengaduan')->references('id_pengaduan')->on('pengaduan')->onDelete('cascade');
        });

        // 5. Tabel tanggapan
        Schema::create('tanggapan', function (Blueprint $table) {
            $table->id('id_tanggapan');
            $table->unsignedBigInteger('id_pengaduan');
            $table->unsignedBigInteger('id_pengurus');
            $table->text('isi_tanggapan');
            $table->timestamp('ditanggapi_pada')->useCurrent();

            $table->foreign('id_pengaduan')->references('id_pengaduan')->on('pengaduan')->onDelete('cascade');
            $table->foreign('id_pengurus')->references('id_pengguna')->on('pengguna')->onDelete('cascade');
        });

        // 6. Tabel riwayat_status
        Schema::create('riwayat_status', function (Blueprint $table) {
            $table->id('id_riwayat');
            $table->unsignedBigInteger('id_pengaduan');
            $table->unsignedBigInteger('id_pencatat');
            $table->enum('status_sebelumnya', ['Diajukan', 'Diverifikasi', 'Diproses', 'Selesai', 'Ditolak'])->nullable();
            $table->enum('status_baru', ['Diajukan', 'Diverifikasi', 'Diproses', 'Selesai', 'Ditolak']);
            $table->text('catatan')->nullable();
            $table->timestamp('dicatat_pada')->useCurrent();

            $table->foreign('id_pengaduan')->references('id_pengaduan')->on('pengaduan')->onDelete('cascade');
            $table->foreign('id_pencatat')->references('id_pengguna')->on('pengguna')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('riwayat_status');
        Schema::dropIfExists('tanggapan');
        Schema::dropIfExists('lampiran_foto');
        Schema::dropIfExists('pengaduan');
        Schema::dropIfExists('kategori_fasilitas');
        Schema::dropIfExists('pengguna');
    }
};
