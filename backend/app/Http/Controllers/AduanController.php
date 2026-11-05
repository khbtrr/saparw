<?php

namespace App\Http\Controllers;

use App\Models\KategoriFasilitas;
use App\Models\LampiranFoto;
use App\Models\Pengaduan;
use App\Models\RiwayatStatus;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class AduanController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $query = Pengaduan::with(['kategori', 'lampiran_foto', 'tanggapan', 'riwayat_status'])
            ->where('id_pelapor', $user->id_pengguna);

        if ($request->has('status') && $request->status !== 'Semua') {
            $query->where('status_terkini', $request->status);
        }

        $items = $query->orderBy('diajukan_pada', 'desc')->get()->map(function ($item) {
            $item->ada_pembaruan = $item->dilihat_pelapor_pada
                ? $item->diperbarui_pada > $item->dilihat_pelapor_pada
                : false;
            return $item;
        });

        return response()->json([
            'data' => $items,
        ]);
    }

    public function show(Request $request, $id)
    {
        $user = $request->user();
        $aduan = Pengaduan::with([
            'kategori',
            'pelapor',
            'lampiran_foto',
            'tanggapan.pengurus',
            'riwayat_status.pencatat',
        ])->find($id);

        if (! $aduan) {
            return response()->json(['message' => 'Aduan tidak ditemukan.'], 404);
        }

        if ($user->peran === 'warga' && $aduan->id_pelapor !== $user->id_pengguna) {
            return response()->json(['message' => 'Unauthorized access.'], 403);
        }

        // Tandai sudah dilihat jika pelapor yang mengakses
        if ($user->peran === 'warga') {
            $aduan->dilihat_pelapor_pada = now();
            $aduan->save();
        }

        return response()->json([
            'data' => $aduan,
        ]);
    }

    public function store(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'id_kategori' => 'required|exists:kategori_fasilitas,id_kategori',
            'lokasi' => 'required|string|max:500',
            'isi_pengaduan' => 'required|string',
            'fotos' => 'nullable|array|max:3',
            'fotos.*' => 'nullable|string', // Support data URL / string path dari frontend
        ]);

        return DB::transaction(function () use ($request, $user) {
            $year = date('Y');
            $totalCount = Pengaduan::count();
            $seq = str_pad($totalCount + 1, 3, '0', STR_PAD_LEFT);
            $nomor = "ADU-{$year}-{$seq}";

            $kategori = KategoriFasilitas::find($request->id_kategori);
            $namaKat = $kategori ? $kategori->nama_kategori : 'Fasilitas';

            $cleanUraian = preg_replace('/\s+/', ' ', trim($request->isi_pengaduan));
            $judul = "{$namaKat} – " . mb_substr($cleanUraian, 0, 40) . (mb_strlen($cleanUraian) > 40 ? '…' : '');

            $aduan = Pengaduan::create([
                'nomor_pengaduan' => $nomor,
                'id_pelapor' => $user->id_pengguna,
                'id_kategori' => $request->id_kategori,
                'judul' => $judul,
                'isi_pengaduan' => trim($request->isi_pengaduan),
                'lokasi' => trim($request->lokasi),
                'status_terkini' => 'Diajukan',
                'diajukan_pada' => now(),
                'diperbarui_pada' => now(),
                'dilihat_pelapor_pada' => now(),
            ]);

            // Simpan foto lampiran jika ada
            if ($request->has('fotos') && is_array($request->fotos)) {
                foreach ($request->fotos as $idx => $fotoData) {
                    if (! empty($fotoData)) {
                        LampiranFoto::create([
                            'id_pengaduan' => $aduan->id_pengaduan,
                            'path_foto' => $fotoData,
                            'keterangan' => 'Foto ' . ($idx + 1),
                            'diunggah_pada' => now(),
                        ]);
                    }
                }
            }

            // Catat riwayat status awal
            RiwayatStatus::create([
                'id_pengaduan' => $aduan->id_pengaduan,
                'id_pencatat' => $user->id_pengguna,
                'status_sebelumnya' => null,
                'status_baru' => 'Diajukan',
                'catatan' => 'Aduan berhasil diajukan oleh pelapor.',
                'dicatat_pada' => now(),
            ]);

            return response()->json([
                'message' => 'Pengaduan berhasil diajukan.',
                'data' => $aduan->load(['kategori', 'lampiran_foto', 'riwayat_status']),
            ], 201);
        });
    }

    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        $aduan = Pengaduan::find($id);

        if (! $aduan) {
            return response()->json(['message' => 'Aduan tidak ditemukan.'], 404);
        }

        if ($aduan->id_pelapor !== $user->id_pengguna) {
            return response()->json(['message' => 'Unauthorized access.'], 403);
        }

        if ($aduan->status_terkini !== 'Diajukan') {
            return response()->json([
                'message' => 'Hanya aduan dengan status Diajukan yang dapat dibatalkan.',
            ], 400);
        }

        $aduan->delete();

        return response()->json([
            'message' => 'Pengaduan berhasil dibatalkan.',
        ]);
    }
}
