<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RiwayatStatus extends Model
{
    use HasFactory;

    protected $table = 'riwayat_status';
    protected $primaryKey = 'id_riwayat';
    public $timestamps = false;

    protected $fillable = [
        'id_pengaduan',
        'id_pencatat',
        'status_sebelumnya',
        'status_baru',
        'catatan',
        'dicatat_pada',
    ];

    protected $casts = [
        'dicatat_pada' => 'datetime',
    ];

    protected $appends = [
        'nama_pencatat',
    ];

    public function getNamaPencatatAttribute(): ?string
    {
        return $this->relationLoaded('pencatat') ? $this->pencatat?->nama : null;
    }

    public function pencatat()
    {
        return $this->belongsTo(Pengguna::class, 'id_pencatat', 'id_pengguna');
    }

    public function pengaduan()
    {
        return $this->belongsTo(Pengaduan::class, 'id_pengaduan', 'id_pengaduan');
    }
}
