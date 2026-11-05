import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  MapPin,
  Clock,
  Trash2,
  AlertCircle,
  MessageSquare,
  ShieldCheck,
  Building2,
  RefreshCw,
} from 'lucide-react';
import { apiFetch } from '../lib/api';
import type { Pengaduan } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { formatTanggal } from '../lib/utils';

export const DetailAduanWarga: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery<{ data: Pengaduan }>({
    queryKey: ['aduan-detail', id],
    queryFn: () => apiFetch(`/api/aduan/${id}`),
  });

  const deleteMutation = useMutation({
    mutationFn: () => apiFetch(`/api/aduan/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aduan-saya'] });
      alert('Pengaduan berhasil dibatalkan.');
      navigate('/warga/aduan');
    },
    onError: (err: any) => {
      alert(err.message || 'Gagal membatalkan pengaduan.');
    },
  });

  if (isLoading) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="py-16 flex flex-col items-center justify-center gap-2"
      >
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-600 font-medium">Memuat rincian pengaduan...</p>
      </div>
    );
  }

  if (error || !data?.data) {
    return (
      <div
        role="alert"
        className="p-5 bg-rose-50 border border-rose-200 rounded-2xl text-center space-y-3 text-rose-800 text-xs"
      >
        <AlertCircle className="w-6 h-6 mx-auto" />
        <p className="font-semibold">Aduan tidak ditemukan atau Anda tidak memiliki akses.</p>
        <div className="flex items-center justify-center gap-2 pt-1">
          <button
            type="button"
            onClick={() => refetch()}
            className="min-h-[44px] px-4 py-2 rounded-lg bg-white text-slate-800 border border-slate-300 font-semibold inline-flex items-center gap-1.5 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Coba Lagi</span>
          </button>
          <Link
            to="/warga/aduan"
            className="min-h-[44px] px-4 py-2 rounded-lg bg-primary text-white font-semibold inline-flex items-center hover:bg-primary-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
          >
            Kembali ke Aduan Saya
          </Link>
        </div>
      </div>
    );
  }

  const aduan = data.data;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <Link
            to="/warga/aduan"
            aria-label="Kembali ke daftar aduan saya"
            className="min-h-[44px] min-w-[44px] -ml-2 inline-flex items-center justify-center rounded-lg text-slate-700 hover:bg-slate-200 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="text-base font-bold text-slate-900 font-mono">{aduan.nomor_pengaduan}</h2>
            <p className="text-xs text-slate-600">{formatTanggal(aduan.diajukan_pada)}</p>
          </div>
        </div>
        <StatusBadge status={aduan.status_terkini} />
      </div>

      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-elev-1 space-y-4">
        <div>
          <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-md">
            {aduan.kategori?.nama_kategori}
          </span>
          <h3 className="font-bold text-sm text-slate-900 mt-2 leading-snug">
            {aduan.judul}
          </h3>
        </div>

        <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-2 border border-slate-200">
          <div className="flex items-start gap-2 text-slate-700">
            <MapPin className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
            <span><strong>Lokasi:</strong> {aduan.lokasi}</span>
          </div>
          {aduan.diteruskan_kepada && (
            <div className="flex items-start gap-2 text-amber-800 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
              <Building2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span><strong>Diteruskan kepada:</strong> {aduan.diteruskan_kepada}</span>
            </div>
          )}
        </div>

        <div>
          <h4 className="text-xs font-semibold text-slate-700 mb-1.5">Uraian Aduan:</h4>
          <p className="text-xs text-slate-800 whitespace-pre-line leading-relaxed bg-white border border-slate-200 p-3 rounded-xl">
            {aduan.isi_pengaduan}
          </p>
        </div>

        {aduan.lampiran_foto && aduan.lampiran_foto.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-slate-700 mb-2">Lampiran Foto:</h4>
            <div className="grid grid-cols-2 gap-2.5">
              {aduan.lampiran_foto.map((foto, idx) => (
                <a
                  key={foto.id_lampiran}
                  href={foto.path_foto}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-xl overflow-hidden border border-slate-200 aspect-video bg-slate-100 hover:opacity-95 transition-opacity focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  <img
                    src={foto.path_foto}
                    alt={foto.keterangan || `Lampiran foto ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </a>
              ))}
            </div>
          </div>
        )}

        {aduan.status_terkini === 'Diajukan' && (
          <div className="pt-2 border-t border-slate-100 flex justify-end">
            <button
              type="button"
              onClick={() => {
                if (confirm('Yakin ingin membatalkan dan menghapus pengaduan ini?')) {
                  deleteMutation.mutate();
                }
              }}
              disabled={deleteMutation.isPending}
              className="min-h-[44px] px-3.5 py-2 text-xs font-semibold text-rose-700 hover:text-rose-800 rounded-lg hover:bg-rose-50 border border-rose-200 flex items-center gap-1.5 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-700"
            >
              <Trash2 className="w-4 h-4" />
              <span>Batalkan Aduan</span>
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-elev-1 space-y-3">
        <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
          <MessageSquare className="w-4 h-4 text-primary" />
          <span>Tanggapan Pengurus RW</span>
        </h4>

        {aduan.tanggapan && aduan.tanggapan.length > 0 ? (
          <div className="space-y-2.5">
            {aduan.tanggapan.map((t) => (
              <div key={t.id_tanggapan} className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-emerald-900 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                    {t.nama_pengurus || 'Pengurus RW'}
                  </span>
                  <span className="text-slate-600">{formatTanggal(t.ditanggapi_pada)}</span>
                </div>
                <p className="text-xs text-slate-800 leading-relaxed">{t.isi_tanggapan}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-600 bg-slate-50 border border-slate-200 p-3 rounded-xl">
            Pengurus RW 05 belum memberikan tanggapan tertulis pada laporan ini.
          </p>
        )}
      </div>

      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-elev-1 space-y-3">
        <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-slate-600" />
          <span>Riwayat Status &amp; Waktu</span>
        </h4>

        <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
          {aduan.riwayat_status?.map((item) => (
            <div key={item.id_riwayat} className="relative text-xs">
              <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-white" />
              <div className="flex items-center gap-2 flex-wrap">
                <StatusBadge status={item.status_baru} />
                <span className="text-xs text-slate-600">{formatTanggal(item.dicatat_pada)}</span>
              </div>
              {item.catatan && (
                <p className="text-slate-700 mt-1.5 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  {item.catatan}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
