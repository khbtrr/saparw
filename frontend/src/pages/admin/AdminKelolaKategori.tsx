import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, AlertCircle } from 'lucide-react';
import { apiFetch } from '../../lib/api';
import type { KategoriFasilitas } from '../../types';

export const AdminKelolaKategori: React.FC = () => {
  const queryClient = useQueryClient();

  const [editingId, setEditingId] = useState<number | null>(null);
  const [namaKategori, setNamaKategori] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const { data, isLoading, error } = useQuery<{ data: KategoriFasilitas[] }>({
    queryKey: ['admin-kategori'],
    queryFn: () => apiFetch('/api/admin/kategori'),
  });

  const mutationSimpan = useMutation({
    mutationFn: (payload: { id?: number | null; nama_kategori: string; deskripsi: string }) => {
      if (payload.id) {
        return apiFetch(`/api/admin/kategori/${payload.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            nama_kategori: payload.nama_kategori,
            deskripsi: payload.deskripsi,
          }),
        });
      }
      return apiFetch('/api/admin/kategori', {
        method: 'POST',
        body: JSON.stringify({
          nama_kategori: payload.nama_kategori,
          deskripsi: payload.deskripsi,
        }),
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-kategori'] });
      queryClient.invalidateQueries({ queryKey: ['kategori'] });
      queryClient.invalidateQueries({ queryKey: ['kategori-publik'] });
      setEditingId(null);
      setNamaKategori('');
      setDeskripsi('');
      setMsg({
        type: 'ok',
        text: variables.id
          ? 'Kategori fasilitas berhasil diperbarui!'
          : 'Kategori fasilitas berhasil ditambahkan!',
      });
    },
    onError: (err: any) => {
      setMsg({ type: 'err', text: err.message || 'Gagal menyimpan kategori.' });
    },
  });

  const mutationToggle = useMutation({
    mutationFn: ({ id, aktif }: { id: number; aktif: boolean }) =>
      apiFetch(`/api/admin/kategori/${id}/aktif`, {
        method: 'PATCH',
        body: JSON.stringify({ aktif }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-kategori'] });
      queryClient.invalidateQueries({ queryKey: ['kategori'] });
      queryClient.invalidateQueries({ queryKey: ['kategori-publik'] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    if (!namaKategori.trim()) return;
    mutationSimpan.mutate({
      id: editingId,
      nama_kategori: namaKategori.trim(),
      deskripsi: deskripsi.trim(),
    });
  };

  const handleMulaiUbah = (cat: KategoriFasilitas) => {
    setMsg(null);
    setEditingId(cat.id_kategori);
    setNamaKategori(cat.nama_kategori);
    setDeskripsi(cat.deskripsi || '');
  };

  const handleBatal = () => {
    setEditingId(null);
    setNamaKategori('');
    setDeskripsi('');
    setMsg(null);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Kelola Kategori</h2>
        <p className="text-xs text-slate-500">Atur kategori fasilitas lingkungan yang dapat dipilih warga</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-slate-500">Memuat kategori...</div>
        ) : error ? (
          <div className="p-4 bg-rose-50 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>Gagal memuat daftar kategori fasilitas.</span>
          </div>
        ) : !data?.data || data.data.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            Belum ada kategori fasilitas yang terdaftar. Tambahkan kategori melalui formulir di bawah.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                  <th className="py-3 px-4">Nama</th>
                  <th className="py-3 px-4">Deskripsi</th>
                  <th className="py-3 px-4 text-center">Aktif</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.data.map((cat) => (
                  <tr
                    key={cat.id_kategori}
                    className={`hover:bg-slate-50/70 transition ${
                      editingId === cat.id_kategori ? 'bg-emerald-50/40' : ''
                    }`}
                  >
                    <td className="py-3 px-4 font-bold text-slate-900">{cat.nama_kategori}</td>
                    <td className="py-3 px-4 text-slate-600">{cat.deskripsi || '-'}</td>
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        role="switch"
                        aria-checked={cat.aktif}
                        aria-label={`Status aktif kategori ${cat.nama_kategori}`}
                        onClick={() =>
                          mutationToggle.mutate({ id: cat.id_kategori, aktif: !cat.aktif })
                        }
                        title={cat.aktif ? 'Klik untuk nonaktifkan' : 'Klik untuk aktifkan'}
                        className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center text-emerald-600 hover:text-emerald-800 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600 rounded-lg"
                      >
                        {cat.aktif ? (
                          <div className="w-9 h-5 bg-emerald-600 rounded-full relative p-0.5">
                            <div className="w-4 h-4 bg-white rounded-full ml-auto shadow-sm" />
                          </div>
                        ) : (
                          <div className="w-9 h-5 bg-slate-300 rounded-full relative p-0.5">
                            <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
                          </div>
                        )}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleMulaiUbah(cat)}
                        className="min-h-[36px] px-3.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 rounded-md font-medium text-xs focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600"
                      >
                        Ubah
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-4 max-w-xl">
        <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">
          {editingId ? 'Ubah Kategori Fasilitas' : 'Tambah Kategori'}
        </h3>

        {msg && (
          <div className={`p-3 rounded-lg text-xs flex items-center gap-2 ${msg.type === 'ok' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'}`}>
            {msg.type === 'ok' ? <Check className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{msg.text}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Nama kategori</label>
          <input
            type="text"
            required
            placeholder="Contoh: Lampu Jalan"
            value={namaKategori}
            onChange={(e) => setNamaKategori(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-600 bg-slate-50/50"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Deskripsi (opsional)</label>
          <textarea
            rows={2}
            placeholder="Keterangan cakupan masalah fasilitas..."
            value={deskripsi}
            onChange={(e) => setDeskripsi(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-600 resize-none bg-slate-50/50"
          />
        </div>

        <div className="flex items-center gap-2 pt-1">
          <button
            type="submit"
            disabled={mutationSimpan.isPending}
            className="py-2 px-5 rounded-lg font-bold text-xs text-white bg-slate-900 hover:bg-slate-800 transition shadow"
          >
            {mutationSimpan.isPending ? 'Menyimpan...' : editingId ? 'Simpan Perubahan' : 'Simpan'}
          </button>
          <button
            type="button"
            onClick={handleBatal}
            className="py-2 px-4 rounded-lg font-semibold text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 transition"
          >
            Batal
          </button>
        </div>
      </form>
    </div>
  );
};
