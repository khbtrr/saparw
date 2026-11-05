import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Printer } from 'lucide-react';
import { apiFetch } from '../../lib/api';
import type { KategoriFasilitas } from '../../types';

interface RekapMatrixRow {
  id_kategori: number;
  nama_kategori: string;
  dj: number; // Diajukan
  dv: number; // Diverifikasi
  dp: number; // Diproses
  sl: number; // Selesai
  dt: number; // Ditolak
  total: number;
}

interface RekapResponse {
  data: {
    matrix: RekapMatrixRow[];
    totalRow: {
      dj: number;
      dv: number;
      dp: number;
      sl: number;
      dt: number;
      total: number;
    };
    list: any[];
  };
}

export const AdminRekap: React.FC = () => {
  const [dariTanggal, setDariTanggal] = useState('2026-10-01');
  const [sampaiTanggal, setSampaiTanggal] = useState('2026-11-30');
  const [kategori, setKategori] = useState('semua');
  const [status, setStatus] = useState('semua');

  const { data: catData } = useQuery<{ data: KategoriFasilitas[] }>({
    queryKey: ['kategori'],
    queryFn: () => apiFetch('/api/kategori'),
  });

  const { data, isLoading, refetch } = useQuery<RekapResponse>({
    queryKey: ['admin-rekap', dariTanggal, sampaiTanggal, kategori, status],
    queryFn: () => {
      const q = new URLSearchParams();
      if (dariTanggal) q.set('dari', dariTanggal);
      if (sampaiTanggal) q.set('sampai', sampaiTanggal);
      if (kategori !== 'semua') q.set('kategori', kategori);
      if (status !== 'semua') q.set('status', status);
      return apiFetch(`/api/admin/rekap?${q.toString()}`);
    },
  });

  const handleCetak = () => {
    window.print();
  };

  const matrix = data?.data?.matrix || [];
  const totalRow = data?.data?.totalRow || { dj: 0, dv: 0, dp: 0, sl: 0, dt: 0, total: 0 };

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between no-print">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Rekap Pengaduan</h2>
          <p className="text-xs text-slate-500">Rekapitulasi dan cetak laporan pengaduan fasilitas lingkungan</p>
        </div>
        <button
          type="button"
          onClick={handleCetak}
          className="min-h-[44px] inline-flex items-center gap-1.5 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition shadow focus-visible:outline focus-visible:outline-2 focus-visible:outline-slate-900"
        >
          <Printer className="w-4 h-4" />
          <span>Cetak Laporan</span>
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm no-print space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Dari</label>
            <input
              type="date"
              value={dariTanggal}
              onChange={(e) => setDariTanggal(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Sampai</label>
            <input
              type="date"
              value={sampaiTanggal}
              onChange={(e) => setSampaiTanggal(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Kategori</label>
            <select
              value={kategori}
              onChange={(e) => setKategori(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-600 bg-white"
            >
              <option value="semua">Semua</option>
              {catData?.data?.map((c) => (
                <option key={c.id_kategori} value={c.id_kategori}>
                  {c.nama_kategori}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-600 bg-white"
            >
              <option value="semua">Semua</option>
              <option value="Diajukan">Diajukan</option>
              <option value="Diverifikasi">Diverifikasi</option>
              <option value="Diproses">Diproses</option>
              <option value="Selesai">Selesai</option>
              <option value="Ditolak">Ditolak</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <button
            onClick={() => refetch()}
            className="py-1.5 px-5 rounded-lg font-bold text-xs text-white bg-slate-900 hover:bg-slate-800 transition"
          >
            Tampilkan
          </button>
        </div>
      </div>

      <div className="hidden print:block text-center border-b-2 border-slate-800 pb-3 mb-4">
        <h1 className="text-xl font-black uppercase tracking-wider text-slate-900">
          RUKUN WARGA 05 DESA KARANGRAHARJA
        </h1>
        <h2 className="text-sm font-bold text-slate-800">
          LAPORAN REKAPITULASI PENGADUAN FASILITAS LINGKUNGAN
        </h2>
        <p className="text-xs text-slate-600">
          Periode: {dariTanggal} s/d {sampaiTanggal}
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-300 text-slate-700 font-bold">
                <th className="py-3 px-4">Kategori</th>
                <th className="py-3 px-3 text-center">Dj</th>
                <th className="py-3 px-3 text-center">Dv</th>
                <th className="py-3 px-3 text-center">Dp</th>
                <th className="py-3 px-3 text-center">Sl</th>
                <th className="py-3 px-3 text-center">Dt</th>
                <th className="py-3 px-4 text-center font-black">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Memuat matriks rekapitulasi...
                  </td>
                </tr>
              ) : matrix.map((row) => (
                <tr key={row.id_kategori} className="hover:bg-slate-50 transition">
                  <td className="py-2.5 px-4 font-semibold text-slate-800">{row.nama_kategori}</td>
                  <td className="py-2.5 px-3 text-center text-slate-700">{row.dj}</td>
                  <td className="py-2.5 px-3 text-center text-slate-700">{row.dv}</td>
                  <td className="py-2.5 px-3 text-center text-slate-700">{row.dp}</td>
                  <td className="py-2.5 px-3 text-center text-slate-700 font-semibold text-emerald-700">{row.sl}</td>
                  <td className="py-2.5 px-3 text-center text-slate-700">{row.dt}</td>
                  <td className="py-2.5 px-4 text-center font-bold text-slate-900 bg-slate-50/50">{row.total}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-100 font-black text-slate-900 border-t-2 border-slate-300">
                <td className="py-3 px-4">Total</td>
                <td className="py-3 px-3 text-center">{totalRow.dj}</td>
                <td className="py-3 px-3 text-center">{totalRow.dv}</td>
                <td className="py-3 px-3 text-center">{totalRow.dp}</td>
                <td className="py-3 px-3 text-center text-emerald-800">{totalRow.sl}</td>
                <td className="py-3 px-3 text-center">{totalRow.dt}</td>
                <td className="py-3 px-4 text-center bg-slate-200">{totalRow.total}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div className="text-[11px] text-slate-500 space-y-1">
        <p className="font-semibold text-slate-700">Keterangan Status:</p>
        <p>
          <strong>Dj</strong>: Diajukan | <strong>Dv</strong>: Diverifikasi | <strong>Dp</strong>: Diproses | <strong>Sl</strong>: Selesai | <strong>Dt</strong>: Ditolak
        </p>
      </div>

      <div className="flex justify-end pt-2 no-print">
        <button
          type="button"
          onClick={handleCetak}
          className="min-h-[44px] py-2 px-6 rounded-lg font-bold text-xs text-white bg-slate-900 hover:bg-slate-800 transition shadow flex items-center gap-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-slate-900"
        >
          <Printer className="w-4 h-4" />
          <span>Cetak Laporan</span>
        </button>
      </div>

      <div className="hidden print:flex justify-between items-end pt-12 text-xs">
        <div>
          <p>Mengetahui,</p>
          <p className="font-bold pt-16">Pengurus RW 05</p>
        </div>
        <div className="text-right">
          <p>Karangraharja, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          <p className="font-bold pt-16">Ketua RW 05</p>
        </div>
      </div>
    </div>
  );
};
