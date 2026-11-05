<?php

namespace App\Http\Controllers;

use App\Models\KategoriFasilitas;
use App\Models\Pengaduan;
use App\Models\Pengguna;
use App\Models\RiwayatStatus;
use App\Models\Tanggapan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    // 1. Daftar Aduan Admin + 6 Kartu Ringkasan
    public function daftarAduan(Request $request)
    {
        $all = Pengaduan::all();
        $ringkasan = [
            'total' => $all->count(),
            'diajukan' => $all->where('status_terkini', 'Diajukan')->count(),
            'diverifikasi' => $all->where('status_terkini', 'Diverifikasi')->count(),
            'diproses' => $all->where('status_terkini', 'Diproses')->count(),
            'selesai' => $all->where('status_terkini', 'Selesai')->count(),
            'ditolak' => $all->where('status_terkini', 'Ditolak')->count(),
        ];

        $query = Pengaduan::with(['kategori', 'pelapor', 'lampiran_foto']);

        if ($request->has('status') && $request->status !== 'Semua') {
            $query->where('status_terkini', $request->status);
        }

        if ($request->has('cari') && ! empty($request->cari)) {
            $c = $request->cari;
            $query->where(function ($q) use ($c) {
                $q->where('nomor_pengaduan', 'like', "%{$c}%")
                  ->orWhere('lokasi', 'like', "%{$c}%")
                  ->orWhere('isi_pengaduan', 'like', "%{$c}%");
            });
        }

        $list = $query->orderBy('diajukan_pada', 'desc')->get();

        return response()->json([
            'data' => $list,
            'ringkasan' => $ringkasan,
        ]);
    }

    // 2. Update Status Verifikasi & Tindak Lanjut Aduan
    public function updateStatus(Request $request, $id)
    {
        $admin = $request->user();
        $aduan = Pengaduan::find($id);

        if (! $aduan) {
            return response()->json(['message' => 'Aduan tidak ditemukan.'], 404);
        }

        $request->validate([
            'status_baru' => 'required|in:Diverifikasi,Diproses,Selesai,Ditolak',
            'catatan' => 'nullable|string',
            'di_luar_kewenangan' => 'nullable|boolean',
            'diteruskan_kepada' => 'nullable|string|max:150',
        ]);

        if ($request->status_baru === 'Ditolak' && empty(trim($request->catatan ?? ''))) {
            return response()->json([
                'message' => 'Alasan penolakan wajib diisi.',
                'errors' => ['catatan' => ['Alasan penolakan wajib diisi jika laporan ditolak.']],
            ], 422);
        }

        if ($request->di_luar_kewenangan && empty(trim($request->diteruskan_kepada ?? ''))) {
            return response()->json([
                'message' => 'Tujuan penerusan wajib diisi.',
                'errors' => ['diteruskan_kepada' => ['Pihak penerusan wajib diisi jika di luar kewenangan RW.']],
            ], 422);
        }

        return DB::transaction(function () use ($request, $admin, $aduan) {
            $prevStatus = $aduan->status_terkini;
            $aduan->status_terkini = $request->status_baru;
            $aduan->diperbarui_pada = now();

            if ($request->di_luar_kewenangan) {
                $aduan->diteruskan_kepada = trim($request->diteruskan_kepada);
            }

            $aduan->save();

            $catatan = $request->di_luar_kewenangan
                ? "[Diteruskan kepada {$request->diteruskan_kepada}] " . ($request->catatan ?? '')
                : ($request->catatan ?? "Status diperbarui menjadi {$request->status_baru}");

            RiwayatStatus::create([
                'id_pengaduan' => $aduan->id_pengaduan,
                'id_pencatat' => $admin->id_pengguna,
                'status_sebelumnya' => $prevStatus,
                'status_baru' => $request->status_baru,
                'catatan' => trim($catatan),
                'dicatat_pada' => now(),
            ]);

            return response()->json([
                'message' => 'Status berhasil diperbarui.',
                'data' => $aduan->load(['riwayat_status.pencatat', 'tanggapan']),
            ]);
        });
    }

    // 3. Kirim Tanggapan Resmi Pengurus RW
    public function kirimTanggapan(Request $request, $id)
    {
        $admin = $request->user();
        $aduan = Pengaduan::find($id);

        if (! $aduan) {
            return response()->json(['message' => 'Aduan tidak ditemukan.'], 404);
        }

        $request->validate([
            'isi_tanggapan' => 'required|string',
        ]);

        $tanggapan = Tanggapan::create([
            'id_pengaduan' => $aduan->id_pengaduan,
            'id_pengurus' => $admin->id_pengguna,
            'isi_tanggapan' => trim($request->isi_tanggapan),
            'ditanggapi_pada' => now(),
        ]);

        $aduan->diperbarui_pada = now();
        $aduan->save();

        return response()->json([
            'message' => 'Tanggapan berhasil dikirim.',
            'data' => $tanggapan->load('pengurus'),
        ]);
    }

    // 4. Verifikasi & Kelola Akun Warga
    public function daftarPengguna(Request $request)
    {
        $tab = $request->tab ?? 'belum_aktif';
        $query = Pengguna::where('peran', 'warga');

        if ($tab === 'belum_aktif') {
            $query->where('aktif', false);
        } elseif ($tab === 'aktif') {
            $query->where('aktif', true);
        }

        if ($request->has('cari') && ! empty($request->cari)) {
            $c = $request->cari;
            $query->where(function ($q) use ($c) {
                $q->where('nama', 'like', "%{$c}%")
                  ->orWhere('username', 'like', "%{$c}%");
            });
        }

        $allWarga = Pengguna::where('peran', 'warga')->get();

        return response()->json([
            'data' => $query->orderBy('dibuat_pada', 'desc')->get(),
            'counts' => [
                'belum_aktif' => $allWarga->where('aktif', false)->count(),
                'aktif' => $allWarga->where('aktif', true)->count(),
                'semua' => $allWarga->count(),
            ],
        ]);
    }

    public function toggleAktifPengguna(Request $request, $id)
    {
        $user = Pengguna::find($id);

        if (! $user) {
            return response()->json(['message' => 'Pengguna tidak ditemukan.'], 404);
        }

        $request->validate([
            'aktif' => 'required|boolean',
        ]);

        $user->aktif = $request->aktif;
        $user->save();

        return response()->json([
            'message' => 'Status akun warga berhasil diperbarui.',
            'data' => $user,
        ]);
    }

    // 5. Kelola Kategori Fasilitas
    public function indexKategori()
    {
        return response()->json([
            'data' => KategoriFasilitas::all(),
        ]);
    }

    public function storeKategori(Request $request)
    {
        $request->validate([
            'nama_kategori' => 'required|string|max:100|unique:kategori_fasilitas,nama_kategori',
            'deskripsi' => 'nullable|string',
        ]);

        $cat = KategoriFasilitas::create([
            'nama_kategori' => trim($request->nama_kategori),
            'deskripsi' => trim($request->deskripsi ?? ''),
            'aktif' => true,
        ]);

        return response()->json([
            'message' => 'Kategori berhasil ditambahkan.',
            'data' => $cat,
        ], 201);
    }

    public function toggleAktifKategori(Request $request, $id)
    {
        $cat = KategoriFasilitas::find($id);

        if (! $cat) {
            return response()->json(['message' => 'Kategori tidak ditemukan.'], 404);
        }

        $request->validate(['aktif' => 'required|boolean']);

        $cat->aktif = $request->aktif;
        $cat->save();

        return response()->json([
            'message' => 'Status kategori berhasil diperbarui.',
            'data' => $cat,
        ]);
    }

    // 6. Rekapitulasi & Laporan Matriks Kategori x Status
    public function rekap(Request $request)
    {
        $categories = KategoriFasilitas::all();
        $query = Pengaduan::query();

        if ($request->has('dari') && ! empty($request->dari)) {
            $query->where('diajukan_pada', '>=', $request->dari . ' 00:00:00');
        }

        if ($request->has('sampai') && ! empty($request->sampai)) {
            $query->where('diajukan_pada', '<=', $request->sampai . ' 23:59:59');
        }

        if ($request->has('kategori') && $request->kategori !== 'semua') {
            $query->where('id_kategori', $request->kategori);
        }

        if ($request->has('status') && $request->status !== 'semua') {
            $query->where('status_terkini', $request->status);
        }

        $items = $query->get();

        $matrix = $categories->map(function ($cat) use ($items) {
            $catItems = $items->where('id_kategori', $cat->id_kategori);
            $dj = $catItems->where('status_terkini', 'Diajukan')->count();
            $dv = $catItems->where('status_terkini', 'Diverifikasi')->count();
            $dp = $catItems->where('status_terkini', 'Diproses')->count();
            $sl = $catItems->where('status_terkini', 'Selesai')->count();
            $dt = $catItems->where('status_terkini', 'Ditolak')->count();

            return [
                'id_kategori' => $cat->id_kategori,
                'nama_kategori' => $cat->nama_kategori,
                'dj' => $dj,
                'dv' => $dv,
                'dp' => $dp,
                'sl' => $sl,
                'dt' => $dt,
                'total' => $dj + $dv + $dp + $sl + $dt,
            ];
        });

        $totalRow = [
            'dj' => $matrix->sum('dj'),
            'dv' => $matrix->sum('dv'),
            'dp' => $matrix->sum('dp'),
            'sl' => $matrix->sum('sl'),
            'dt' => $matrix->sum('dt'),
            'total' => $matrix->sum('total'),
        ];

        return response()->json([
            'data' => [
                'matrix' => $matrix,
                'totalRow' => $totalRow,
                'list' => $items,
            ],
        ]);
    }
}
