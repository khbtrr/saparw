<?php

namespace App\Http\Controllers;

use App\Models\KategoriFasilitas;
use App\Models\Pengaduan;
use App\Models\Pengguna;
use App\Models\RiwayatStatus;
use App\Models\Tanggapan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class AdminController extends Controller
{
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
                'data' => $aduan->load([
                    'riwayat_status.pencatat:id_pengguna,nama,peran',
                    'tanggapan.pengurus:id_pengguna,nama,peran',
                ]),
            ]);
        });
    }

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
            'data' => $tanggapan->load('pengurus:id_pengguna,nama,peran'),
        ]);
    }

    public function daftarPengguna(Request $request)
    {
        $peran = $request->peran ?? 'warga';
        $tab = $request->tab ?? ($peran === 'admin' ? 'semua' : 'belum_aktif');

        $query = Pengguna::query();

        if ($peran !== 'semua') {
            $query->where('peran', $peran);
        }

        if ($tab === 'belum_aktif' || $tab === 'nonaktif') {
            $query->where('aktif', false);
        } elseif ($tab === 'aktif') {
            $query->where('aktif', true);
        }

        if ($request->filled('cari')) {
            $c = $request->cari;
            $query->where(function ($q) use ($c) {
                $q->where('nama', 'like', "%{$c}%")
                  ->orWhere('username', 'like', "%{$c}%")
                  ->orWhere('no_hp', 'like', "%{$c}%")
                  ->orWhere('no_rumah', 'like', "%{$c}%");
            });
        }

        $allPeran = Pengguna::when($peran !== 'semua', fn ($q) => $q->where('peran', $peran))->get();

        return response()->json([
            'data' => $query->orderBy('dibuat_pada', 'desc')->get(),
            'counts' => [
                'belum_aktif' => $allPeran->where('aktif', false)->count(),
                'aktif' => $allPeran->where('aktif', true)->count(),
                'semua' => $allPeran->count(),
            ],
        ]);
    }

    public function storePengguna(Request $request)
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:100',
            'username' => 'required|string|max:50|unique:pengguna,username',
            'password' => 'required|string|min:8',
            'peran' => 'required|in:warga,admin',
            'rt' => 'nullable|string|max:3',
            'no_rumah' => 'nullable|string|max:10',
            'no_hp' => 'nullable|string|max:20',
        ], [
            'username.unique' => 'Username sudah digunakan akun lain.',
            'password.min' => 'Kata sandi minimal 8 karakter.',
            'peran.in' => 'Peran pengguna harus warga atau admin.',
        ]);

        $user = Pengguna::create([
            'nama' => trim($validated['nama']),
            'username' => trim($validated['username']),
            'password' => $validated['password'],
            'peran' => $validated['peran'],
            'aktif' => true,
            'rt' => $validated['rt'] ?? null,
            'no_rumah' => $validated['no_rumah'] ?? null,
            'no_hp' => $validated['no_hp'] ?? null,
            'dibuat_pada' => now(),
        ]);

        $peranLabel = $user->peran === 'admin' ? 'Pengurus RW' : 'Warga';

        return response()->json([
            'message' => "Akun {$peranLabel} berhasil dibuat dan langsung aktif.",
            'data' => $user,
        ], 201);
    }

    public function updatePengguna(Request $request, $id)
    {
        $currentAdmin = $request->user();
        $user = Pengguna::find($id);

        if (! $user) {
            return response()->json(['message' => 'Pengguna tidak ditemukan.'], 404);
        }

        $validated = $request->validate([
            'nama' => 'required|string|max:100',
            'username' => 'required|string|max:50|unique:pengguna,username,' . $user->id_pengguna . ',id_pengguna',
            'peran' => 'required|in:warga,admin',
            'rt' => 'nullable|string|max:3',
            'no_rumah' => 'nullable|string|max:10',
            'no_hp' => 'nullable|string|max:20',
        ], [
            'username.unique' => 'Username sudah digunakan akun lain.',
            'peran.in' => 'Peran pengguna harus warga atau admin.',
        ]);

        $newPeran = $validated['peran'];
        $newUsername = trim($validated['username']);

        // Guardrails jika menurunkan status pengurus (admin) menjadi warga
        if ($user->peran === 'admin' && $newPeran === 'warga') {
            if ($user->id_pengguna === $currentAdmin->id_pengguna) {
                return response()->json([
                    'message' => 'Anda tidak dapat menurunkan peran akun Anda sendiri menjadi warga.',
                ], 422);
            }

            $activeAdminCount = Pengguna::where('peran', 'admin')->where('aktif', true)->count();
            if ($activeAdminCount <= 1) {
                return response()->json([
                    'message' => 'Tidak dapat mengubah peran. Minimal harus ada satu akun pengurus RW yang berstatus aktif.',
                ], 422);
            }
        }

        // Cek apakah username atau peran berubah
        $credentialsOrRoleChanged = ($user->username !== $newUsername) || ($user->peran !== $newPeran);

        $user->nama = trim($validated['nama']);
        $user->username = $newUsername;
        $user->peran = $newPeran;
        $user->no_hp = ! empty($validated['no_hp']) ? trim($validated['no_hp']) : null;

        if ($newPeran === 'warga') {
            $user->rt = $validated['rt'] ?? null;
            $user->no_rumah = ! empty($validated['no_rumah']) ? trim($validated['no_rumah']) : null;
        }

        $user->save();

        // Cabut token aktif jika username atau peran diubah agar pengguna login ulang
        if ($credentialsOrRoleChanged) {
            $user->tokens()->delete();
        }

        $peranLabel = $user->peran === 'admin' ? 'Pengurus RW' : 'Warga';

        return response()->json([
            'message' => "Data akun {$peranLabel} ({$user->username}) berhasil diperbarui.",
            'data' => $user,
        ]);
    }

    public function toggleAktifPengguna(Request $request, $id)
    {
        $currentAdmin = $request->user();
        $user = Pengguna::find($id);

        if (! $user) {
            return response()->json(['message' => 'Pengguna tidak ditemukan.'], 404);
        }

        $request->validate([
            'aktif' => 'required|boolean',
        ]);

        $newAktif = (bool) $request->aktif;

        if ($user->peran === 'admin' && ! $newAktif) {
            if ($user->id_pengguna === $currentAdmin->id_pengguna) {
                return response()->json([
                    'message' => 'Anda tidak dapat menonaktifkan akun Anda sendiri yang sedang digunakan.',
                ], 422);
            }

            $activeAdminCount = Pengguna::where('peran', 'admin')->where('aktif', true)->count();
            if ($activeAdminCount <= 1) {
                return response()->json([
                    'message' => 'Tidak dapat menonaktifkan. Minimal harus ada satu akun pengurus RW yang berstatus aktif.',
                ], 422);
            }
        }

        $user->aktif = $newAktif;
        $user->save();

        // Revoke active Sanctum tokens immediately when an account is deactivated.
        if (! $user->aktif) {
            $user->tokens()->delete();
        }

        $peranLabel = $user->peran === 'admin' ? 'pengurus RW' : 'warga';

        return response()->json([
            'message' => "Status akun {$peranLabel} berhasil diperbarui.",
            'data' => $user,
        ]);
    }

    public function resetPasswordPengguna(Request $request, $id)
    {
        $user = Pengguna::find($id);

        if (! $user) {
            return response()->json(['message' => 'Pengguna tidak ditemukan.'], 404);
        }

        $request->validate([
            'password' => 'required|string|min:8',
        ], [
            'password.min' => 'Kata sandi baru minimal 8 karakter.',
        ]);

        $user->password = $request->password;
        $user->save();

        // Revoke all active tokens immediately when an account password is reset.
        $user->tokens()->delete();

        $peranLabel = $user->peran === 'admin' ? 'pengurus RW' : 'warga';

        return response()->json([
            'message' => "Kata sandi akun {$peranLabel} ({$user->username}) berhasil diubah.",
            'data' => $user,
        ]);
    }

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
        ], [
            'nama_kategori.unique' => 'Nama kategori fasilitas sudah terdaftar.',
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

    public function updateKategori(Request $request, $id)
    {
        $cat = KategoriFasilitas::find($id);

        if (! $cat) {
            return response()->json(['message' => 'Kategori tidak ditemukan.'], 404);
        }

        $request->validate([
            'nama_kategori' => [
                'required',
                'string',
                'max:100',
                Rule::unique('kategori_fasilitas', 'nama_kategori')->ignore($cat->id_kategori, 'id_kategori'),
            ],
            'deskripsi' => 'nullable|string',
        ], [
            'nama_kategori.unique' => 'Nama kategori fasilitas sudah terdaftar.',
        ]);

        $cat->nama_kategori = trim($request->nama_kategori);
        $cat->deskripsi = trim($request->deskripsi ?? '');
        $cat->save();

        return response()->json([
            'message' => 'Kategori berhasil diperbarui.',
            'data' => $cat,
        ]);
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
