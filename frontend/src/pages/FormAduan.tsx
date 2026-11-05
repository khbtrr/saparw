import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Upload,
  X,
  AlertCircle,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import { apiFetch, ApiError } from '../lib/api';
import type { KategoriFasilitas, Pengaduan } from '../types';

export const FormAduan: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [idKategori, setIdKategori] = useState<string>('');
  const [lokasi, setLokasi] = useState<string>('');
  const [uraian, setUraian] = useState<string>('');
  const [fotos, setFotos] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [suksesAduan, setSuksesAduan] = useState<Pengaduan | null>(null);

  // Ambil list kategori aktif
  const { data: catData } = useQuery<{ data: KategoriFasilitas[] }>({
    queryKey: ['kategori'],
    queryFn: () => apiFetch('/api/kategori'),
  });

  const mutation = useMutation({
    mutationFn: (payload: { id_kategori: number; lokasi: string; isi_pengaduan: string; fotos: string[] }) =>
      apiFetch<{ message: string; data: Pengaduan }>('/api/aduan', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['aduan-saya'] });
      setSuksesAduan(res.data);
    },
    onError: (err) => {
      if (err instanceof ApiError) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('Gagal mengirim aduan. Coba beberapa saat lagi.');
      }
    },
  });

  // Handle upload foto (simulasi FileReader data URL dengan kompresi sederhana)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);

    if (fotos.length + files.length > 3) {
      alert('Maksimal lampiran adalah 3 foto.');
      return;
    }

    files.forEach((file) => {
      if (file.size > 2 * 1024 * 1024) {
        alert(`File ${file.name} melebihi batas 2 MB.`);
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setFotos((prev) => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFoto = (index: number) => {
    setFotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!idKategori) {
      setErrorMsg('Pilih kategori fasilitas.');
      return;
    }
    if (!lokasi.trim()) {
      setErrorMsg('Masukkan informasi lokasi (mis. RT 02, depan pos).');
      return;
    }
    if (!uraian.trim()) {
      setErrorMsg('Tulis uraian aduan secara lengkap.');
      return;
    }

    mutation.mutate({
      id_kategori: Number(idKategori),
      lokasi: lokasi.trim(),
      isi_pengaduan: uraian.trim(),
      fotos,
    });
  };

  // Tampilan Konfirmasi Sukses (sesuai diagram alir: gnerate nomor aduan unik -> Tampilkan konfirmasi)
  if (suksesAduan) {
    return (
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 text-center space-y-4 shadow-sm">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Pengaduan Berhasil Terkirim!</h2>
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500">Nomor Aduan:</span>
            <span className="font-mono font-bold text-emerald-800 text-sm">{suksesAduan.nomor_pengaduan}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500">Status Awal:</span>
            <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-semibold text-[11px]">
              Diajukan
            </span>
          </div>
          <p className="text-xs text-slate-600 pt-2 border-t border-slate-200">
            Pengurus RW 05 akan segera memeriksa dan memverifikasi laporan fasilitas Anda.
          </p>
        </div>

        <div className="pt-2 space-y-2">
          <button
            onClick={() => navigate(`/warga/aduan/${suksesAduan.id_pengaduan}`)}
            className="w-full py-2.5 px-4 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition"
          >
            Lihat Status Aduan
          </button>
          <button
            onClick={() => navigate('/warga/aduan')}
            className="w-full py-2.5 px-4 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-200 transition"
          >
            Kembali ke Daftar Aduan
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Top Bar Form sesuai wireframe 2: Form Aduan */}
      <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
        <Link to="/warga/aduan" className="p-1 -ml-1 text-slate-600 hover:text-slate-900">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">Form Aduan</h2>
      </div>

      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Form Card sesuai wireframe 2 */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
        {/* 1. Kategori */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Kategori
          </label>
          <select
            value={idKategori}
            onChange={(e) => setIdKategori(e.target.value)}
            required
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-slate-50/50"
          >
            <option value="">Pilih Kategori ▾</option>
            {catData?.data?.map((cat) => (
              <option key={cat.id_kategori} value={cat.id_kategori}>
                {cat.nama_kategori}
              </option>
            ))}
          </select>
        </div>

        {/* 2. Lokasi RT */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Lokasi RT
          </label>
          <input
            type="text"
            required
            placeholder="Masukkan Lokasi RT (contoh: RT 02, samping Pos Ronda)"
            value={lokasi}
            onChange={(e) => setLokasi(e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-slate-50/50"
          />
        </div>

        {/* 3. Uraian */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Uraian
          </label>
          <textarea
            required
            rows={4}
            placeholder="Tulis uraian aduan secara jelas..."
            value={uraian}
            onChange={(e) => setUraian(e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-slate-50/50 resize-none"
          />
        </div>

        {/* 4. Foto (Opsional) */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Foto (Opsional, Maks 3 Foto)
          </label>

          {/* Preview thumbnails */}
          {fotos.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mb-2">
              {fotos.map((src, idx) => (
                <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200">
                  <img src={src} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeFoto(idx)}
                    className="absolute top-1 right-1 bg-black/60 text-white p-1 rounded-full hover:bg-rose-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {fotos.length < 3 && (
            <label className="border-2 border-dashed border-slate-300 hover:border-emerald-600 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer bg-slate-50 hover:bg-emerald-50/30 transition text-center">
              <Upload className="w-5 h-5 text-slate-400 mb-1" />
              <span className="text-xs font-semibold text-slate-700">+ Upload Foto</span>
              <span className="text-[10px] text-slate-400 mt-0.5">JPG, PNG, atau WebP (Maks 2 MB)</span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* Tombol Kirim */}
        <button
          type="submit"
          disabled={mutation.isPending}
          className="w-full mt-4 py-3 px-4 rounded-xl font-bold text-sm text-white bg-slate-900 hover:bg-slate-800 active:scale-[0.99] transition shadow flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {mutation.isPending ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <FileText className="w-4 h-4" />
              <span>Kirim Pengaduan</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
