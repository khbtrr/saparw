import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Search, Eye, AlertCircle, RefreshCw } from 'lucide-react';
import { apiFetch } from '../../lib/api';
import type { Pengaduan, RingkasanAduan } from '../../types';
import { StatusBadge } from '../../components/StatusBadge';

export const AdminDaftarAduan: React.FC = () => {
  const navigate = useNavigate();
  const [cari, setCari] = useState('');
  const [status, setStatus] = useState('Semua');

  const { data, isLoading, error, refetch } = useQuery<{
    data: Pengaduan[];
    ringkasan: RingkasanAduan;
  }>({
    queryKey: ['admin-aduan', cari, status],
    queryFn: () => {
      const q = new URLSearchParams();
      if (cari) q.set('cari', cari);
      if (status !== 'Semua') q.set('status', status);
      return apiFetch(`/api/admin/aduan?${q.toString()}`);
    },
  });

  const ringkasan = data?.ringkasan || {
    total: 0,
    diajukan: 0,
    diverifikasi: 0,
    diproses: 0,
    selesai: 0,
    ditolak: 0,
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Daftar Aduan</h2>
          <p className="text-xs text-slate-500">Kelola dan tinjau aduan warga secara terpusat</p>
        </div>
        <button
          type="button"
          onClick={() => refetch()}
          className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600"
          title="Segarkan data"
          aria-label="Segarkan data pengaduan"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <button
          type="button"
          onClick={() => setStatus('Semua')}
          aria-pressed={status === 'Semua'}
          className={`text-left bg-white p-3.5 rounded-xl border transition shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-slate-900 ${
            status === 'Semua' ? 'border-slate-900 ring-2 ring-slate-900/10' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="text-2xl font-black text-slate-900">{ringkasan.total}</div>
          <div className="text-[11px] font-semibold text-slate-500 mt-0.5">Total Aduan</div>
        </button>

        <button
          type="button"
          onClick={() => setStatus('Diajukan')}
          aria-pressed={status === 'Diajukan'}
          className={`text-left bg-white p-3.5 rounded-xl border transition shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-600 ${
            status === 'Diajukan' ? 'border-amber-500 ring-2 ring-amber-500/10' : 'border-slate-200 hover:border-amber-300'
          }`}
        >
          <div className="text-2xl font-black text-amber-600">{ringkasan.diajukan}</div>
          <div className="text-[11px] font-semibold text-slate-500 mt-0.5">Diajukan</div>
        </button>

        <button
          type="button"
          onClick={() => setStatus('Diverifikasi')}
          aria-pressed={status === 'Diverifikasi'}
          className={`text-left bg-white p-3.5 rounded-xl border transition shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600 ${
            status === 'Diverifikasi' ? 'border-blue-500 ring-2 ring-blue-500/10' : 'border-slate-200 hover:border-blue-300'
          }`}
        >
          <div className="text-2xl font-black text-blue-600">{ringkasan.diverifikasi}</div>
          <div className="text-[11px] font-semibold text-slate-500 mt-0.5">Diverifikasi</div>
        </button>

        <button
          type="button"
          onClick={() => setStatus('Diproses')}
          aria-pressed={status === 'Diproses'}
          className={`text-left bg-white p-3.5 rounded-xl border transition shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-purple-600 ${
            status === 'Diproses' ? 'border-purple-500 ring-2 ring-purple-500/10' : 'border-slate-200 hover:border-purple-300'
          }`}
        >
          <div className="text-2xl font-black text-purple-600">{ringkasan.diproses}</div>
          <div className="text-[11px] font-semibold text-slate-500 mt-0.5">Diproses</div>
        </button>

        <button
          type="button"
          onClick={() => setStatus('Selesai')}
          aria-pressed={status === 'Selesai'}
          className={`text-left bg-white p-3.5 rounded-xl border transition shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600 ${
            status === 'Selesai' ? 'border-emerald-500 ring-2 ring-emerald-500/10' : 'border-slate-200 hover:border-emerald-300'
          }`}
        >
          <div className="text-2xl font-black text-emerald-600">{ringkasan.selesai}</div>
          <div className="text-[11px] font-semibold text-slate-500 mt-0.5">Selesai</div>
        </button>

        <button
          type="button"
          onClick={() => setStatus('Ditolak')}
          aria-pressed={status === 'Ditolak'}
          className={`text-left bg-white p-3.5 rounded-xl border transition shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-rose-600 ${
            status === 'Ditolak' ? 'border-rose-500 ring-2 ring-rose-500/10' : 'border-slate-200 hover:border-rose-300'
          }`}
        >
          <div className="text-2xl font-black text-rose-600">{ringkasan.ditolak}</div>
          <div className="text-[11px] font-semibold text-slate-500 mt-0.5">Ditolak</div>
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="md:col-span-2">
          <label className="block text-[11px] font-bold text-slate-600 mb-1">Cari</label>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari nomor / uraian / lokasi..."
              value={cari}
              onChange={(e) => setCari(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 transition"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-600 mb-1">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 transition bg-white"
          >
            <option value="Semua">Semua Status</option>
            <option value="Diajukan">Diajukan</option>
            <option value="Diverifikasi">Diverifikasi</option>
            <option value="Diproses">Diproses</option>
            <option value="Selesai">Selesai</option>
            <option value="Ditolak">Ditolak</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-slate-500">Memuat data aduan...</div>
        ) : error ? (
          <div className="p-4 bg-rose-50 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>Gagal mengambil data pengaduan.</span>
          </div>
        ) : !data?.data || data.data.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            Tidak ada data aduan yang sesuai dengan kriteria pencarian/filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                  <th className="py-3 px-4">No. Aduan</th>
                  <th className="py-3 px-4">Kategori</th>
                  <th className="py-3 px-4">Lokasi</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.data.map((item) => (
                  <tr key={item.id_pengaduan} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                      {item.nomor_pengaduan}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">
                      {item.kategori?.nama_kategori || 'Fasilitas'}
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate" title={item.lokasi}>
                      {item.lokasi}
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <StatusBadge status={item.status_terkini} />
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <button
                        onClick={() => navigate(`/admin/aduan/${item.id_pengaduan}`)}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-slate-900 text-white rounded-md hover:bg-slate-800 transition font-medium text-[11px]"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Lihat</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
