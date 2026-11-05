import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ChevronRight, Plus, MapPin, Calendar, AlertCircle } from 'lucide-react';
import { apiFetch } from '../lib/api';
import type { Pengaduan } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { formatTanggal } from '../lib/utils';

export const DaftarAduanSaya: React.FC = () => {
  const [filterStatus, setFilterStatus] = useState<string>('Semua');

  const { data, isLoading, error } = useQuery<{ data: Pengaduan[] }>({
    queryKey: ['aduan-saya', filterStatus],
    queryFn: () => apiFetch(`/api/aduan?status=${filterStatus}`),
  });

  const statuses = ['Semua', 'Diajukan', 'Diverifikasi', 'Diproses', 'Selesai', 'Ditolak'];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Daftar Aduan Saya</h2>
          <p className="text-xs text-slate-600">Pantau perkembangan tindak lanjut fasilitas</p>
        </div>
        <Link
          to="/warga/aduan/baru"
          className="min-h-[40px] inline-flex items-center gap-1.5 bg-emerald-700 text-white text-xs font-semibold px-3.5 py-2 rounded-lg hover:bg-emerald-800 transition shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-800"
        >
          <Plus className="w-4 h-4" />
          <span>Aduan Baru</span>
        </Link>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
        {statuses.map((st) => (
          <button
            key={st}
            type="button"
            onClick={() => setFilterStatus(st)}
            className={`min-h-[36px] px-3.5 py-1.5 rounded-full font-medium whitespace-nowrap transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600 ${
              filterStatus === st
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="py-12 flex flex-col items-center justify-center gap-2">
          <div className="w-7 h-7 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-600">Memuat aduan...</p>
        </div>
      ) : error ? (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>Gagal memuat data aduan.</span>
        </div>
      ) : !data?.data || data.data.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center space-y-3">
          <p className="text-xs text-slate-600">Belum ada aduan pada status ini.</p>
          <Link
            to="/warga/aduan/baru"
            className="inline-block text-xs font-semibold text-emerald-700 hover:underline py-1"
          >
            + Buat Pengaduan Fasilitas Sekarang
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {data.data.map((item) => (
            <Link
              key={item.id_pengaduan}
              to={`/warga/aduan/${item.id_pengaduan}`}
              className="block bg-white rounded-2xl p-4 border border-slate-200 shadow-sm hover:shadow-md transition relative overflow-hidden group focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600"
            >
              {item.ada_pembaruan && (
                <span className="absolute top-0 right-0 w-3 h-3 bg-rose-500 rounded-bl-lg" title="Pembaruan Baru" />
              )}

              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="text-[11px] font-bold text-slate-500 font-mono">
                    {item.nomor_pengaduan}
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 group-hover:text-emerald-700 transition line-clamp-1">
                    {item.kategori?.nama_kategori || 'Fasilitas Lingkungan'}
                  </h3>
                </div>
                <StatusBadge status={item.status_terkini} />
              </div>

              <p className="text-xs text-slate-700 line-clamp-2 mb-3 leading-relaxed">
                {item.isi_pengaduan}
              </p>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-1 truncate max-w-[170px]">
                  <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-500" />
                  <span className="truncate">{item.lokasi}</span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>{formatTanggal(item.diajukan_pada)}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 ml-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
