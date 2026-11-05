import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, Plus, MapPin, Calendar, AlertCircle } from 'lucide-react';
import { apiFetch } from '../lib/api';
import type { Pengaduan } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { formatTanggal } from '../lib/utils';

export const DaftarAduanSaya: React.FC = () => {
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState<string>('Semua');

  const { data, isLoading, error } = useQuery<{ data: Pengaduan[] }>({
    queryKey: ['aduan-saya', filterStatus],
    queryFn: () => apiFetch(`/api/aduan?status=${filterStatus}`),
  });

  const statuses = ['Semua', 'Diajukan', 'Diverifikasi', 'Diproses', 'Selesai', 'Ditolak'];

  return (
    <div className="space-y-4">
      {/* Header bar sesuai wireframe 3: Daftar Aduan Saya */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Daftar Aduan Saya</h2>
          <p className="text-xs text-slate-500">Pantau perkembangan tindak lanjut fasilitas</p>
        </div>
        <Link
          to="/warga/aduan/baru"
          className="inline-flex items-center gap-1 bg-emerald-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-emerald-800 transition shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Aduan Baru</span>
        </Link>
      </div>

      {/* Filter Tabs Status */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
        {statuses.map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition ${
              filterStatus === st
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Content List */}
      {isLoading ? (
        <div className="py-12 flex flex-col items-center justify-center gap-2">
          <div className="w-7 h-7 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500">Memuat aduan...</p>
        </div>
      ) : error ? (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>Gagal memuat data aduan.</span>
        </div>
      ) : !data?.data || data.data.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center space-y-3">
          <p className="text-xs text-slate-500">Belum ada aduan pada kategori ini.</p>
          <Link
            to="/warga/aduan/baru"
            className="inline-block text-xs font-semibold text-emerald-700 hover:underline"
          >
            + Buat Pengaduan Fasilitas Sekarang
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {data.data.map((item) => (
            <div
              key={item.id_pengaduan}
              onClick={() => navigate(`/warga/aduan/${item.id_pengaduan}`)}
              className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm hover:shadow-md transition cursor-pointer relative overflow-hidden group"
            >
              {/* Badge jika ada tanggapan/pembaruan baru */}
              {item.ada_pembaruan && (
                <span className="absolute top-0 right-0 w-3 h-3 bg-rose-500 rounded-bl-lg" title="Pembaruan Baru" />
              )}

              {/* Format Card sesuai wireframe 3 */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="text-[11px] font-bold text-slate-400 font-mono">
                    {item.nomor_pengaduan}
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 group-hover:text-emerald-700 transition line-clamp-1">
                    {item.kategori?.nama_kategori || 'Fasilitas Lingkungan'}
                  </h3>
                </div>
                <StatusBadge status={item.status_terkini} />
              </div>

              <p className="text-xs text-slate-600 line-clamp-2 mb-3 leading-relaxed">
                {item.isi_pengaduan}
              </p>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-1 truncate max-w-[170px]">
                  <MapPin className="w-3 h-3 shrink-0 text-slate-400" />
                  <span className="truncate">{item.lokasi}</span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Calendar className="w-3 h-3" />
                  <span>{formatTanggal(item.diajukan_pada)}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 ml-1" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
