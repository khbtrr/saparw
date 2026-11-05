<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Tanggapan extends Model
{
    use HasFactory;

    protected $table = 'tanggapan';
    protected $primaryKey = 'id_tanggapan';
    public $timestamps = false;

    protected $fillable = [
        'id_pengaduan',
        'id_pengurus',
        'isi_tanggapan',
        'ditanggapi_pada',
    ];

    protected $casts = [
        'ditanggapi_pada' => 'datetime',
    ];

    protected $appends = [
        'nama_pengurus',
    ];

    public function getNamaPengurusAttribute(): ?string
    {
        return $this->relationLoaded('pengurus') ? $this->pengurus?->nama : null;
    }

    public function pengurus()
    {
        return $this->belongsTo(Pengguna::class, 'id_pengurus', 'id_pengguna');
    }

    public function pengaduan()
    {
        return $this->belongsTo(Pengaduan::class, 'id_pengaduan', 'id_pengaduan');
    }
}
