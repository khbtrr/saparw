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

    public function aduanSelesai()
    {
        // Strip reporter identity and house number for public privacy.
        $items = Pengaduan::with(['pelapor:id_pengguna,rt', 'kategori:id_kategori,nama_kategori', 'lampiran_foto', 'tanggapan'])
            ->where('status_terkini', 'Selesai')
            ->orderBy('diperbarui_pada', 'desc')
            ->limit(3)
            ->get()
            ->map(function ($aduan) {
                $foto = $aduan->lampiran_foto->first();
                $tanggapan = $aduan->tanggapan->last();

                return [
                    'id_pengaduan' => $aduan->id_pengaduan,
                    'nomor_pengaduan' => $aduan->nomor_pengaduan,
                    'judul' => $aduan->judul,
                    'nama_kategori' => $aduan->kategori ? $aduan->kategori->nama_kategori : 'Umum',
                    'rt' => $aduan->pelapor ? $aduan->pelapor->rt : null,
                    'diperbarui_pada' => $aduan->diperbarui_pada ? $aduan->diperbarui_pada->format('Y-m-d H:i:s') : null,
                    'foto_url' => $foto ? $foto->path_foto : null,
                    'tanggapan_terakhir' => $tanggapan ? $tanggapan->isi_tanggapan : null,
                ];
            });

        return response()->json([
            'data' => $items,
        ]);
    }
}
