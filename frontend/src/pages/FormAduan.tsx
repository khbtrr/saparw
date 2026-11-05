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
  RefreshCw,
} from 'lucide-react';
import { apiFetch, ApiError } from '../lib/api';
import type { KategoriFasilitas, Pengaduan } from '../types';

interface SelectedFoto {
  file: File;
  previewUrl: string;
}

export const FormAduan: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [idKategori, setIdKategori] = useState<string>('');
  const [lokasi, setLokasi] = useState<string>('');
  const [uraian, setUraian] = useState<string>('');
  const [fotos, setFotos] = useState<SelectedFoto[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [suksesAduan, setSuksesAduan] = useState<Pengaduan | null>(null);

  const {
    data: catData,
    isLoading: isLoadingCat,
    isError: isErrorCat,
    refetch: refetchCat,
  } = useQuery<{ data: KategoriFasilitas[] }>({
    queryKey: ['kategori'],
    queryFn: () => apiFetch('/api/kategori'),
  });

  const mutation = useMutation({
    mutationFn: async (payload: {
      id_kategori: number;
      lokasi: string;
      isi_pengaduan: string;
      fotos: SelectedFoto[];
    }) => {
      if (import.meta.env.VITE_USE_MOCKS === 'true') {
        return apiFetch<{ message: string; data: Pengaduan }>('/api/aduan', {
          method: 'POST',
          body: JSON.stringify({
            id_kategori: payload.id_kategori,
            lokasi: payload.lokasi,
            isi_pengaduan: payload.isi_pengaduan,
            fotos: payload.fotos.map((f) => f.previewUrl),
          }),
        });
      }

      const formData = new FormData();
      formData.append('id_kategori', String(payload.id_kategori));
      formData.append('lokasi', payload.lokasi);
      formData.append('isi_pengaduan', payload.isi_pengaduan);
      payload.fotos.forEach((f) => {
        formData.append('fotos[]', f.file);
      });

      return apiFetch<{ message: string; data: Pengaduan }>('/api/aduan', {
        method: 'POST',
        body: formData,
      });
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['aduan-saya'] });
      queryClient.invalidateQueries({ queryKey: ['statistik-publik'] });
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);

    if (fotos.length + files.length > 3) {
      setErrorMsg('Maksimal lampiran adalah 3 foto.');
      e.target.value = '';
      return;
    }

    files.forEach((file) => {
      if (file.size > 2 * 1024 * 1024) {
        setErrorMsg(`File ${file.name} melebihi batas 2 MB.`);
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setFotos((prev) => [...prev, { file, previewUrl: reader.result as string }]);
        }
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
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
      setErrorMsg('Masukkan informasi lokasi (mis. RT 02, depan pos ronda).');
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

  if (suksesAduan) {
    return (
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 text-center space-y-4 shadow-elev-1">
        <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Pengaduan Berhasil Terkirim</h2>
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-600">Nomor Aduan:</span>
            <span className="font-mono font-bold text-emerald-800 text-sm">{suksesAduan.nomor_pengaduan}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-600">Status Awal:</span>
            <span className="bg-amber-100 text-amber-800 border border-amber-300 px-2.5 py-0.5 rounded-full font-semibold text-xs">
              Diajukan
            </span>
          </div>
          <p className="text-xs text-slate-700 pt-2 border-t border-slate-200">
            Pengurus RW 05 akan segera memeriksa dan memverifikasi laporan fasilitas Anda.
          </p>
        </div>

        <div className="pt-2 space-y-2.5">
          <button
            type="button"
            onClick={() => navigate(`/warga/aduan/${suksesAduan.id_pengaduan}`)}
            className="w-full min-h-[44px] py-2.5 px-4 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary-dark transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Lihat Rincian &amp; Status Aduan
          </button>
          <button
            type="button"
            onClick={() => navigate('/warga/aduan')}
            className="w-full min-h-[44px] py-2.5 px-4 bg-slate-100 text-slate-800 rounded-xl text-xs font-semibold hover:bg-slate-200 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Kembali ke Daftar Aduan Saya
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
        <Link
          to="/warga/aduan"
          aria-label="Kembali ke daftar aduan saya"
          className="min-h-[44px] min-w-[44px] -ml-2 inline-flex items-center justify-center rounded-lg text-slate-700 hover:bg-slate-200 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">Formulir Pengaduan Baru</h2>
      </div>

      {errorMsg && (
        <div
          role="alert"
          className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-start gap-2"
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {isErrorCat && (
        <div
          role="alert"
          className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center justify-between gap-2"
        >
          <span>Gagal memuat daftar kategori fasilitas.</span>
          <button
            type="button"
            onClick={() => refetchCat()}
            className="min-h-[44px] px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-800 font-semibold inline-flex items-center gap-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Muat Ulang</span>
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-elev-1 space-y-4">
        <div>
          <label htmlFor="form-kategori" className="block text-xs font-semibold text-slate-700 mb-1.5">
            Kategori Fasilitas
          </label>
          <select
            id="form-kategori"
            value={idKategori}
            onChange={(e) => setIdKategori(e.target.value)}
            required
            disabled={isLoadingCat}
            className="w-full min-h-[44px] px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 text-slate-900 bg-slate-50/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <option value="">
              {isLoadingCat ? 'Memuat kategori fasilitas...' : 'Pilih kategori fasilitas'}
            </option>
            {catData?.data?.map((cat) => (
              <option key={cat.id_kategori} value={cat.id_kategori}>
                {cat.nama_kategori}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="form-lokasi" className="block text-xs font-semibold text-slate-700 mb-1.5">
            Lokasi di Lingkungan RW 05
          </label>
          <input
            id="form-lokasi"
            type="text"
            required
            placeholder="Contoh: RT 02, dekat patokan lokasi"
            value={lokasi}
            onChange={(e) => setLokasi(e.target.value)}
            className="w-full min-h-[44px] px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 text-slate-900 bg-slate-50/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          />
        </div>

        <div>
          <label htmlFor="form-uraian" className="block text-xs font-semibold text-slate-700 mb-1.5">
            Uraian Masalah
          </label>
          <textarea
            id="form-uraian"
            required
            rows={4}
            placeholder="Jelaskan kondisi kerusakan fasilitas dan dampaknya..."
            value={uraian}
            onChange={(e) => setUraian(e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 text-slate-900 bg-slate-50/50 resize-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          />
        </div>

        <div>
          <span className="block text-xs font-semibold text-slate-700 mb-1.5">
            Lampiran Foto Bukti (Opsional, Maksimal 3 Foto)
          </span>

          {fotos.length > 0 && (
            <div className="grid grid-cols-3 gap-2.5 mb-2.5">
              {fotos.map((item, idx) => (
                <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200">
                  <img src={item.previewUrl} alt={`Lampiran ${idx + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeFoto(idx)}
                    aria-label={`Hapus foto ${idx + 1}`}
                    className="absolute top-1 right-1 min-h-[36px] min-w-[36px] inline-flex items-center justify-center bg-slate-900/80 text-white rounded-full hover:bg-rose-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {fotos.length < 3 && (
            <label
              htmlFor="form-upload-foto"
              className="border-2 border-dashed border-slate-300 hover:border-primary rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer bg-slate-50 hover:bg-primary-soft/40 transition-colors text-center focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-primary"
            >
              <Upload className="w-5 h-5 text-slate-600 mb-1" />
              <span className="text-xs font-semibold text-slate-800">Tambah Foto Kondisi Lapangan</span>
              <span className="text-xs text-slate-600 mt-0.5">Format JPG, PNG, atau WebP (Maksimal 2 MB)</span>
              <input
                id="form-upload-foto"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={handleFileChange}
                className="sr-only"
              />
            </label>
          )}
        </div>

        <button
          type="submit"
          disabled={mutation.isPending}
          className="w-full min-h-[44px] mt-4 py-3 px-4 rounded-xl font-bold text-sm text-white bg-primary hover:bg-primary-dark transition-colors shadow-elev-1 flex items-center justify-center gap-2 disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          {mutation.isPending ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Mengirim Pengaduan...</span>
            </>
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
