<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Pengguna extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 'pengguna';
    protected $primaryKey = 'id_pengguna';
    public $timestamps = false;

    protected $fillable = [
        'nama',
        'username',
        'password',
        'peran',
        'aktif',
        'rt',
        'no_rumah',
        'no_hp',
        'dibuat_pada',
    ];

    protected $hidden = [
        'password',
    ];

    protected function casts(): array
    {
        return [
            'aktif' => 'boolean',
            'password' => 'hashed',
            'dibuat_pada' => 'datetime',
        ];
    }

    public function pengaduan()
    {
        return $this->hasMany(Pengaduan::class, 'id_pelapor', 'id_pengguna');
    }
}
