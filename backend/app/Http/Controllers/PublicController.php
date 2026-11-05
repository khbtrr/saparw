<?php

namespace App\Http\Controllers;

use App\Models\KategoriFasilitas;
use App\Models\Pengaduan;
use Illuminate\Http\Request;

class PublicController extends Controller
{
    public function statistik()
    {
        $all = Pengaduan::all();

        return response()->json([
            'data' => [
                'total_aduan' => $all->count(),
                'selesai' => $all->where('status_terkini', 'Selesai')->count(),
                'diproses' => $all->where('status_terkini', 'Diproses')->count(),
                'diverifikasi' => $all->where('status_terkini', 'Diverifikasi')->count(),
                'diajukan' => $all->where('status_terkini', 'Diajukan')->count(),
            ],
        ]);
    }

    public function kategori()
    {
        $kategori = KategoriFasilitas::where('aktif', true)->get();

        return response()->json([
            'data' => $kategori,
        ]);
    }
}
