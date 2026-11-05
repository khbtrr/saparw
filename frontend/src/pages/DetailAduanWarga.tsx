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
} from 'lucide-react';
import { apiFetch } from '../lib/api';
import type { Pengaduan } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { formatTanggal } from '../lib/utils';

export const DetailAduanWarga: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery<{ data: Pengaduan }>({
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
      <div className="py-20 flex justify-center">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !data?.data) {
    return (
      <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-center space-y-2 text-rose-700 text-xs">
        <AlertCircle className="w-6 h-6 mx-auto" />
        <p>Aduan tidak ditemukan atau Anda tidak memiliki akses.</p>
        <Link to="/warga/aduan" className="text-emerald-700 font-bold underline inline-block">
          Kembali ke Aduan Saya
        </Link>
      </div>
    );
  }

  const aduan = data.data;

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <Link to="/warga/aduan" className="p-1 -ml-1 text-slate-600 hover:text-slate-900">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="text-base font-bold text-slate-900">{aduan.nomor_pengaduan}</h2>
            <p className="text-[11px] text-slate-500">{formatTanggal(aduan.diajukan_pada)}</p>
          </div>
        </div>
        <StatusBadge status={aduan.status_terkini} />
      </div>

      {/* Main Detail Card */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
        <div>
          <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
            {aduan.kategori?.nama_kategori}
          </span>
          <h3 className="font-bold text-sm text-slate-900 mt-2 leading-snug">
            {aduan.judul}
          </h3>
        </div>

        <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-2 border border-slate-100">
          <div className="flex items-start gap-2 text-slate-700">
            <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <span><strong>Lokasi:</strong> {aduan.lokasi}</span>
          </div>
          {aduan.diteruskan_kepada && (
            <div className="flex items-start gap-2 text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200">
              <Building2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span><strong>Diteruskan kepada:</strong> {aduan.diteruskan_kepada}</span>
            </div>
          )}
        </div>

        <div>
          <h4 className="text-xs font-semibold text-slate-500 mb-1">Uraian Aduan:</h4>
          <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed bg-white border border-slate-200 p-3 rounded-xl">
            {aduan.isi_pengaduan}
          </p>
        </div>

        {/* Lampiran Foto */}
        {aduan.lampiran_foto && aduan.lampiran_foto.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-slate-500 mb-2">Lampiran Foto:</h4>
            <div className="grid grid-cols-2 gap-2">
              {aduan.lampiran_foto.map((foto) => (
                <div key={foto.id_lampiran} className="rounded-xl overflow-hidden border border-slate-200 aspect-video bg-slate-100">
                  <img
                    src={foto.path_foto}
                    alt="Lampiran aduan"
                    className="w-full h-full object-cover cursor-pointer hover:scale-105 transition"
                    onClick={() => window.open(foto.path_foto, '_blank')}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tombol Batalkan (hanya jika Diajukan) */}
        {aduan.status_terkini === 'Diajukan' && (
          <div className="pt-2 border-t border-slate-100 flex justify-end">
            <button
              onClick={() => {
                if (confirm('Yakin ingin membatalkan dan menghapus pengaduan ini?')) {
                  deleteMutation.mutate();
                }
              }}
              disabled={deleteMutation.isPending}
              className="text-xs font-semibold text-rose-600 hover:text-rose-800 p-2 rounded-lg hover:bg-rose-50 flex items-center gap-1.5 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Batalkan Aduan</span>
            </button>
          </div>
        )}
      </div>

      {/* Tanggapan Pengurus RW */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
        <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
          <MessageSquare className="w-4 h-4 text-emerald-600" />
          <span>Tanggapan Pengurus RW</span>
        </h4>

        {aduan.tanggapan && aduan.tanggapan.length > 0 ? (
          <div className="space-y-2">
            {aduan.tanggapan.map((t) => (
              <div key={t.id_tanggapan} className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-emerald-900 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    {t.nama_pengurus || 'Pengurus RW'}
                  </span>
                  <span className="text-slate-400">{formatTanggal(t.ditanggapi_pada)}</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">{t.isi_tanggapan}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic bg-slate-50 p-3 rounded-xl">
            Belum ada tanggapan tertulis dari pengurus.
          </p>
        )}
      </div>

      {/* Timeline Riwayat Status */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
        <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-slate-500" />
          <span>Riwayat Status & Waktu</span>
        </h4>

        <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
          {aduan.riwayat_status?.map((item) => (
            <div key={item.id_riwayat} className="relative text-xs">
              <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-emerald-600 ring-4 ring-white" />
              <div className="flex items-center gap-2">
                <StatusBadge status={item.status_baru} />
                <span className="text-[11px] text-slate-400">{formatTanggal(item.dicatat_pada)}</span>
              </div>
              {item.catatan && (
                <p className="text-slate-600 mt-1 text-[11px] bg-slate-50 p-2 rounded-lg border border-slate-100">
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
