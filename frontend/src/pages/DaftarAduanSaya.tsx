import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ChevronRight, Plus, MapPin, Calendar, AlertCircle, RefreshCw } from 'lucide-react';
import { apiFetch } from '../lib/api';
import type { Pengaduan } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { formatTanggal } from '../lib/utils';

export const DaftarAduanSaya: React.FC = () => {
  const [filterStatus, setFilterStatus] = useState<string>('Semua');

  const { data, isLoading, error, refetch } = useQuery<{ data: Pengaduan[] }>({
    queryKey: ['aduan-saya', filterStatus],
    queryFn: () => apiFetch(`/api/aduan?status=${filterStatus}`),
  });

  const statuses = ['Semua', 'Diajukan', 'Diverifikasi', 'Diproses', 'Selesai', 'Ditolak'];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Daftar Aduan Saya</h2>
          <p className="text-xs text-slate-600">Pantau perkembangan tindak lanjut fasilitas</p>
        </div>
        <Link
          to="/warga/aduan/baru"
          className="min-h-[44px] inline-flex items-center gap-1.5 bg-primary text-white text-xs font-semibold px-3.5 py-2 rounded-lg hover:bg-primary-dark transition-colors shadow-elev-1 shrink-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <Plus className="w-4 h-4" />
          <span>Aduan Baru</span>
        </Link>
      </div>

      <div
        role="group"
        aria-label="Filter status pengaduan"
        className="flex items-center gap-2 overflow-x-auto pb-1 text-xs"
      >
        {statuses.map((st) => (
          <button
            key={st}
            type="button"
            aria-pressed={filterStatus === st}
            onClick={() => setFilterStatus(st)}
            className={`min-h-[44px] px-3.5 py-2 rounded-full font-semibold whitespace-nowrap transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
              filterStatus === st
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div
          role="status"
          aria-live="polite"
          className="py-12 flex flex-col items-center justify-center gap-2"
        >
          <div className="w-7 h-7 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-600 font-medium">Memuat daftar pengaduan Anda...</p>
        </div>
      ) : error ? (
        <div
          role="alert"
          className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
        >
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>Gagal memuat daftar pengaduan. Periksa jaringan lalu coba lagi.</span>
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            className="min-h-[44px] px-3.5 py-2 bg-white text-slate-800 border border-slate-300 rounded-lg font-semibold inline-flex items-center gap-1.5 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Muat Ulang</span>
          </button>
        </div>
      ) : !data?.data || data.data.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
          <p className="text-sm font-bold text-slate-900">
            {filterStatus === 'Semua'
              ? 'Anda belum mengajukan pengaduan fasilitas'
              : `Tidak ada pengaduan dengan status ${filterStatus}`}
          </p>
          <p className="text-xs text-slate-600">
            Laporkan kerusakan lampu jalan, saluran got, atau fasilitas umum lainnya di lingkungan RT Anda.
          </p>
          <Link
            to="/warga/aduan/baru"
            className="min-h-[44px] inline-flex items-center justify-center px-4 py-2 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary-dark transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Buat Pengaduan Fasilitas Sekarang
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {data.data.map((item) => (
            <Link
              key={item.id_pengaduan}
              to={`/warga/aduan/${item.id_pengaduan}`}
              className="block bg-white rounded-2xl p-4 border border-slate-200 shadow-elev-1 hover:border-slate-300 transition-colors group focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-slate-600 font-mono">
                      {item.nomor_pengaduan}
                    </span>
                    {item.ada_pembaruan && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                        Pembaruan Baru
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 group-hover:text-primary transition-colors line-clamp-1 mt-0.5">
                    {item.kategori?.nama_kategori || 'Fasilitas Lingkungan'}
                  </h3>
                </div>
                <StatusBadge status={item.status_terkini} />
              </div>

              <p className="text-xs text-slate-700 line-clamp-2 mb-3 leading-relaxed">
                {item.isi_pengaduan}
              </p>

              <div className="flex items-center justify-between text-xs text-slate-600 pt-2.5 border-t border-slate-100 gap-2">
                <div className="flex items-center gap-1.5 truncate">
                  <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-600" />
                  <span className="truncate">{item.lokasi}</span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Calendar className="w-3.5 h-3.5 text-slate-600" />
                  <span>{formatTanggal(item.diajukan_pada)}</span>
                  <ChevronRight className="w-4 h-4 text-slate-600 ml-0.5" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
