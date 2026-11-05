import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, UserCheck, AlertCircle, RefreshCw } from 'lucide-react';
import { apiFetch } from '../../lib/api';
import type { Pengguna } from '../../types';

export const AdminVerifikasiAkun: React.FC = () => {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<'belum_aktif' | 'aktif' | 'semua'>('belum_aktif');
  const [cari, setCari] = useState('');

  const { data, isLoading, error, refetch } = useQuery<{
    data: Pengguna[];
    counts: { belum_aktif: number; aktif: number; semua: number };
  }>({
    queryKey: ['admin-pengguna', tab, cari],
    queryFn: () => {
      const q = new URLSearchParams();
      q.set('tab', tab);
      if (cari) q.set('cari', cari);
      return apiFetch(`/api/admin/pengguna?${q.toString()}`);
    },
  });

  const mutationAktif = useMutation({
    mutationFn: ({ id, aktif }: { id: number; aktif: boolean }) =>
      apiFetch(`/api/admin/pengguna/${id}/aktif`, {
        method: 'PATCH',
        body: JSON.stringify({ aktif }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pengguna'] });
    },
    onError: (err: any) => {
      alert(err.message || 'Gagal mengubah status aktivasi akun.');
    },
  });

  const counts = data?.counts || { belum_aktif: 0, aktif: 0, semua: 0 };

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Verifikasi Akun Warga</h2>
          <p className="text-xs text-slate-500">Aktivasi akun warga baru yang mendaftar di sistem</p>
        </div>
        <button
          onClick={() => refetch()}
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
          title="Segarkan data"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs Filter sesuai Wireframe 4: Belum aktif (2) | Aktif (3) | Semua */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setTab('belum_aktif')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
            tab === 'belum_aktif'
              ? 'bg-slate-900 text-white shadow'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <span>Belum aktif</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${tab === 'belum_aktif' ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-200 text-slate-700'}`}>
            {counts.belum_aktif}
          </span>
        </button>

        <button
          onClick={() => setTab('aktif')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
            tab === 'aktif'
              ? 'bg-slate-900 text-white shadow'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <span>Aktif</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${tab === 'aktif' ? 'bg-emerald-500 text-white font-black' : 'bg-slate-200 text-slate-700'}`}>
            {counts.aktif}
          </span>
        </button>

        <button
          onClick={() => setTab('semua')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
            tab === 'semua'
              ? 'bg-slate-900 text-white shadow'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <span>Semua</span>
          <span className="text-[10px] text-slate-400">({counts.semua})</span>
        </button>
      </div>

      {/* Pencarian sesuai Wireframe 4: Cari nama atau username */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari nama atau username..."
            value={cari}
            onChange={(e) => setCari(e.target.value)}
            className="w-full pl-9 pr-3.5 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
        </div>
      </div>

      {/* Tabel Warga Sesuai Wireframe 4: Nama, Username, Status, Aksi (Aktifkan / Nonaktifkan) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-slate-500">Memuat data akun warga...</div>
        ) : error ? (
          <div className="p-4 bg-rose-50 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>Gagal mengambil data akun.</span>
          </div>
        ) : !data?.data || data.data.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            Tidak ada akun warga pada kategori ini.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                  <th className="py-3 px-4">Nama</th>
                  <th className="py-3 px-4">Username</th>
                  <th className="py-3 px-4">Domisili</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.data.map((user) => (
                  <tr key={user.id_pengguna} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4 font-semibold text-slate-900">{user.nama}</td>
                    <td className="py-3 px-4 font-mono text-slate-600">@{user.username}</td>
                    <td className="py-3 px-4 text-slate-600">
                      RT {user.rt || '-'} {user.no_rumah ? `• No. ${user.no_rumah}` : ''}
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      {user.aktif ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                          Belum aktif
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      {user.aktif ? (
                        <button
                          onClick={() => mutationAktif.mutate({ id: user.id_pengguna, aktif: false })}
                          disabled={mutationAktif.isPending}
                          className="px-3 py-1 bg-white border border-slate-300 text-slate-700 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 rounded-md transition font-medium text-[11px] shadow-sm"
                        >
                          Nonaktifkan
                        </button>
                      ) : (
                        <button
                          onClick={() => mutationAktif.mutate({ id: user.id_pengguna, aktif: true })}
                          disabled={mutationAktif.isPending}
                          className="px-3 py-1 bg-slate-900 text-white hover:bg-emerald-700 rounded-md transition font-bold text-[11px] shadow-sm flex items-center gap-1 mx-auto"
                        >
                          <UserCheck className="w-3 h-3" />
                          <span>Aktifkan</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="text-[11px] text-slate-400 italic">
        *Akun tidak dapat masuk sebelum diaktifkan pengurus. Data pada tabel di atas tersinkronisasi langsung dengan database pengguna.
      </p>
    </div>
  );
};
