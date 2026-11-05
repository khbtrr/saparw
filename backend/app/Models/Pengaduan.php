<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Pengaduan extends Model
{
    use HasFactory;

    protected $table = 'pengaduan';
    protected $primaryKey = 'id_pengaduan';
    public $timestamps = false;

    protected $fillable = [
        'nomor_pengaduan',
        'id_pelapor',
        'id_kategori',
        'judul',
        'isi_pengaduan',
        'lokasi',
        'status_terkini',
        'diteruskan_kepada',
        'diajukan_pada',
        'diperbarui_pada',
        'dilihat_pelapor_pada',
    ];

    protected $casts = [
        'diajukan_pada' => 'datetime',
        'diperbarui_pada' => 'datetime',
        'dilihat_pelapor_pada' => 'datetime',
    ];

    public function pelapor()
    {
        return $this->belongsTo(Pengguna::class, 'id_pelapor', 'id_pengguna');
    }

    public function kategori()
    {
        return $this->belongsTo(KategoriFasilitas::class, 'id_kategori', 'id_kategori');
    }

    public function lampiran_foto()
    {
        return $this->hasMany(LampiranFoto::class, 'id_pengaduan', 'id_pengaduan');
    }

    public function tanggapan()
    {
        return $this->hasMany(Tanggapan::class, 'id_pengaduan', 'id_pengaduan')->orderBy('ditanggapi_pada', 'asc');
    }

    public function riwayat_status()
    {
        return $this->hasMany(RiwayatStatus::class, 'id_pengaduan', 'id_pengaduan')->orderBy('dicatat_pada', 'asc');
    }
}
