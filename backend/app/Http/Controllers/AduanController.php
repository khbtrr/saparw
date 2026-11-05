<?php

namespace App\Http\Controllers;

use App\Models\KategoriFasilitas;
use App\Models\LampiranFoto;
use App\Models\Pengaduan;
use App\Models\RiwayatStatus;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class AduanController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $query = Pengaduan::with(['kategori', 'lampiran_foto', 'tanggapan.pengurus', 'riwayat_status.pencatat'])
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
            return response()->json(['message' => 'Anda tidak memiliki akses ke aduan ini.'], 403);
        }

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

        $rules = [
            'id_kategori' => 'required|exists:kategori_fasilitas,id_kategori',
            'lokasi' => 'required|string|max:500',
            'isi_pengaduan' => 'required|string',
            'fotos' => 'nullable|array|max:3',
        ];

        if ($request->hasFile('fotos')) {
            $rules['fotos.*'] = 'file|image|mimes:jpg,jpeg,png,webp|max:2048';
        } else {
            $rules['fotos.*'] = 'nullable|string';
        }

        $request->validate($rules, [
            'fotos.max' => 'Maksimal lampiran adalah 3 foto.',
            'fotos.*.image' => 'Lampiran harus berupa gambar (JPG, PNG, atau WebP).',
            'fotos.*.max' => 'Ukuran setiap foto maksimal 2 MB.',
        ]);

        return DB::transaction(function () use ($request, $user) {
            $year = date('Y');
            $prefix = "ADU-{$year}-";

            // Derive next sequence from the highest existing number so deleted rows never cause collisions.
            $existingNumbers = Pengaduan::where('nomor_pengaduan', 'like', "{$prefix}%")
                ->lockForUpdate()
                ->pluck('nomor_pengaduan');

            $maxSeq = 0;
            foreach ($existingNumbers as $num) {
                $parts = explode('-', $num);
                $seqNum = isset($parts[2]) ? (int) $parts[2] : 0;
                if ($seqNum > $maxSeq) {
                    $maxSeq = $seqNum;
                }
            }

            $seq = str_pad($maxSeq + 1, 3, '0', STR_PAD_LEFT);
            $nomor = "{$prefix}{$seq}";

            $kategori = KategoriFasilitas::find($request->id_kategori);
            $namaKat = $kategori ? $kategori->nama_kategori : 'Fasilitas';

            $cleanUraian = preg_replace('/\s+/', ' ', trim($request->isi_pengaduan));
            $judul = "{$namaKat}: " . mb_substr($cleanUraian, 0, 40) . (mb_strlen($cleanUraian) > 40 ? '...' : '');

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

            $savedPaths = $this->storeUploadedFotos($request, $aduan->id_pengaduan);

            foreach ($savedPaths as $idx => $pathFoto) {
                LampiranFoto::create([
                    'id_pengaduan' => $aduan->id_pengaduan,
                    'path_foto' => $pathFoto,
                    'keterangan' => 'Foto ' . ($idx + 1),
                    'diunggah_pada' => now(),
                ]);
            }

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
                'data' => $aduan->load(['kategori', 'lampiran_foto', 'riwayat_status.pencatat']),
            ], 201);
        });
    }

    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        $aduan = Pengaduan::with('lampiran_foto')->find($id);

        if (! $aduan) {
            return response()->json(['message' => 'Aduan tidak ditemukan.'], 404);
        }

        if ($aduan->id_pelapor !== $user->id_pengguna) {
            return response()->json(['message' => 'Anda tidak memiliki akses untuk membatalkan aduan ini.'], 403);
        }

        if ($aduan->status_terkini !== 'Diajukan') {
            return response()->json([
                'message' => 'Hanya aduan dengan status Diajukan yang dapat dibatalkan.',
            ], 400);
        }

        foreach ($aduan->lampiran_foto as $foto) {
            if ($foto->path_foto && str_starts_with($foto->path_foto, '/storage/')) {
                $relativePath = substr($foto->path_foto, strlen('/storage/'));
                Storage::disk('public')->delete($relativePath);
            }
        }

        $aduan->delete();

        return response()->json([
            'message' => 'Pengaduan berhasil dibatalkan.',
        ]);
    }

    private function storeUploadedFotos(Request $request, int $idPengaduan): array
    {
        $paths = [];

        if ($request->hasFile('fotos')) {
            foreach ($request->file('fotos') as $idx => $file) {
                if ($file instanceof UploadedFile && $file->isValid()) {
                    $ext = strtolower($file->getClientOriginalExtension() ?: 'jpg');
                    $filename = "aduan_{$idPengaduan}_" . ($idx + 1) . '_' . Str::random(8) . ".{$ext}";
                    $stored = $file->storeAs('aduan', $filename, 'public');
                    $paths[] = '/storage/' . $stored;
                }
            }

            return $paths;
        }

        if (is_array($request->fotos)) {
            foreach ($request->fotos as $idx => $fotoData) {
                if (empty($fotoData) || ! is_string($fotoData)) {
                    continue;
                }

                if (preg_match('/^data:image\/(jpeg|jpg|png|webp);base64,(.+)$/i', $fotoData, $matches)) {
                    $ext = strtolower($matches[1]) === 'jpeg' ? 'jpg' : strtolower($matches[1]);
                    $binary = base64_decode($matches[2], true);
                    if ($binary !== false) {
                        $filename = "aduan/aduan_{$idPengaduan}_" . ($idx + 1) . '_' . Str::random(8) . ".{$ext}";
                        Storage::disk('public')->put($filename, $binary);
                        $paths[] = '/storage/' . $filename;
                    }
                } elseif (mb_strlen($fotoData) <= 255) {
                    $paths[] = $fotoData;
                }
            }
        }

        return $paths;
    }
}
