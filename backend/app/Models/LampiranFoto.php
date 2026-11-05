<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LampiranFoto extends Model
{
    use HasFactory;

    protected $table = 'lampiran_foto';
    protected $primaryKey = 'id_lampiran';
    public $timestamps = false;

    protected $fillable = [
        'id_pengaduan',
        'path_foto',
        'keterangan',
        'diunggah_pada',
    ];

    protected $casts = [
        'diunggah_pada' => 'datetime',
    ];

    public function pengaduan()
    {
        return $this->belongsTo(Pengaduan::class, 'id_pengaduan', 'id_pengaduan');
    }
}
