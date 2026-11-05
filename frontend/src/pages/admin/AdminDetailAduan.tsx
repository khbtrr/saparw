import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Send,
  Clock,
} from 'lucide-react';
import { apiFetch, ApiError } from '../../lib/api';
import type { Pengaduan, StatusAduan } from '../../types';
import { StatusBadge } from '../../components/StatusBadge';
import { formatTanggal } from '../../lib/utils';

export const AdminDetailAduan: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const [statusBaru, setStatusBaru] = useState<StatusAduan>('Diverifikasi');
  const [catatanStatus, setCatatanStatus] = useState('');
  const [diLuarKewenangan, setDiLuarKewenangan] = useState(false);
  const [diteruskanKepada, setDiteruskanKepada] = useState('');
  const [statusMsg, setStatusMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const [isiTanggapan, setIsiTanggapan] = useState('');
  const [tanggapanMsg, setTanggapanMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const { data, isLoading, error } = useQuery<{ data: Pengaduan }>({
    queryKey: ['admin-aduan-detail', id],
    queryFn: () => apiFetch(`/api/aduan/${id}`),
  });

  const mutationStatus = useMutation({
    mutationFn: (payload: {
      status_baru: string;
      catatan?: string;
      di_luar_kewenangan?: boolean;
      diteruskan_kepada?: string;
    }) =>
      apiFetch(`/api/admin/aduan/${id}/status`, {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-aduan-detail', id] });
      queryClient.invalidateQueries({ queryKey: ['admin-aduan'] });
      setStatusMsg({ type: 'ok', text: 'Status berhasil diperbarui dan dicatat ke riwayat!' });
      setCatatanStatus('');
    },
    onError: (err: any) => {
      setStatusMsg({ type: 'err', text: err instanceof ApiError ? err.message : 'Gagal memperbarui status.' });
    },
  });

  const mutationTanggapan = useMutation({
    mutationFn: (payload: { isi_tanggapan: string }) =>
      apiFetch(`/api/admin/aduan/${id}/tanggapan`, {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-aduan-detail', id] });
      setTanggapanMsg({ type: 'ok', text: 'Tanggapan pengurus berhasil dikirim ke pelapor!' });
      setIsiTanggapan('');
    },
    onError: (err: any) => {
      setTanggapanMsg({ type: 'err', text: err instanceof ApiError ? err.message : 'Gagal mengirim tanggapan.' });
    },
  });

  if (isLoading) {
    return <div className="p-12 text-center text-xs text-slate-500">Memuat detail aduan...</div>;
  }

  if (error || !data?.data) {
    return (
      <div className="p-6 bg-rose-50 text-rose-700 text-xs rounded-xl flex items-center gap-2">
        <AlertCircle className="w-5 h-5" />
        <span>Aduan tidak ditemukan.</span>
      </div>
    );
  }

  const aduan = data.data;

  const handleSimpanStatus = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);
    mutationStatus.mutate({
      status_baru: statusBaru,
      catatan: catatanStatus,
      di_luar_kewenangan: diLuarKewenangan,
      diteruskan_kepada: diteruskanKepada,
    });
  };

  const handleKirimTanggapan = (e: React.FormEvent) => {
    e.preventDefault();
    setTanggapanMsg(null);
    if (!isiTanggapan.trim()) return;
    mutationTanggapan.mutate({ isi_tanggapan: isiTanggapan.trim() });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <Link
            to="/admin/aduan"
            aria-label="Kembali ke daftar aduan"
            className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-200 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Detail Aduan</h2>
            <p className="text-xs text-slate-500">Tinjau laporan, verifikasi status, dan berikan tanggapan resmi</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="font-mono font-bold text-slate-900 text-base">{aduan.nomor_pengaduan}</span>
                <span className="block text-xs text-slate-400 mt-0.5">
                  Tanggal: {formatTanggal(aduan.diajukan_pada)}
                </span>
              </div>
              <StatusBadge status={aduan.status_terkini} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-lg border border-slate-100">
              <div>
                <span className="text-slate-500 block">Pelapor:</span>
                <span className="font-semibold text-slate-800">{aduan.pelapor?.nama || 'Warga'} (RT {aduan.pelapor?.rt || '-'})</span>
              </div>
              <div>
                <span className="text-slate-500 block">Kategori:</span>
                <span className="font-semibold text-slate-800">{aduan.kategori?.nama_kategori}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-slate-500 block">Lokasi:</span>
                <span className="font-medium text-slate-700">{aduan.lokasi}</span>
              </div>
              {aduan.diteruskan_kepada && (
                <div className="sm:col-span-2 text-amber-800 bg-amber-50 p-2 rounded border border-amber-200">
                  <strong>Diteruskan kepada:</strong> {aduan.diteruskan_kepada}
                </div>
              )}
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-500 block mb-1">Uraian Pengaduan:</span>
              <p className="text-xs text-slate-800 bg-white border border-slate-200 p-3 rounded-lg leading-relaxed whitespace-pre-line">
                {aduan.isi_pengaduan}
              </p>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-500 block mb-2">Lampiran Foto:</span>
              {aduan.lampiran_foto && aduan.lampiran_foto.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {aduan.lampiran_foto.map((foto, idx) => (
                    <button
                      key={foto.id_lampiran}
                      type="button"
                      onClick={() => window.open(foto.path_foto, '_blank')}
                      className="border border-slate-200 rounded-lg overflow-hidden aspect-video relative group block text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600"
                    >
                      <img src={foto.path_foto} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover transition" />
                      <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">
                        Foto {idx + 1}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">Tidak ada lampiran foto pada aduan ini.</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-3">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-500" />
              <span>Riwayat Status</span>
            </h3>

            <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {aduan.riwayat_status?.map((item) => (
                <div key={item.id_riwayat} className="relative text-xs">
                  <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-emerald-600 ring-4 ring-white" />
                  <div className="flex items-center gap-2">
                    <StatusBadge status={item.status_baru} />
                    <span className="text-[11px] text-slate-400">{formatTanggal(item.dicatat_pada)}</span>
                    <span className="text-[11px] text-slate-500 font-medium">oleh {item.nama_pencatat || 'Sistem'}</span>
                  </div>
                  {item.catatan && (
                    <p className="text-slate-600 mt-1 text-[11px] bg-slate-50 p-2 rounded border border-slate-100">
                      {item.catatan}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <form onSubmit={handleSimpanStatus} className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">
              Verifikasi dan Status
            </h3>

            {statusMsg && (
              <div className={`p-3 rounded-lg text-xs flex items-center gap-2 ${statusMsg.type === 'ok' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'}`}>
                {statusMsg.type === 'ok' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                <span>{statusMsg.text}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Status baru</label>
              <select
                value={statusBaru}
                onChange={(e) => setStatusBaru(e.target.value as StatusAduan)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-600 bg-white"
              >
                <option value="Diverifikasi">Diverifikasi (Laporan Diterima)</option>
                <option value="Diproses">Diproses (Sedang Ditangani)</option>
                <option value="Selesai">Selesai (Penanganan Rampung)</option>
                <option value="Ditolak">Ditolak (Tidak Memenuhi Syarat)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Catatan / alasan {statusBaru === 'Ditolak' && <span className="text-rose-500">*wajib jika ditolak</span>}
              </label>
              <textarea
                rows={3}
                placeholder="Tulis catatan penanganan atau alasan penolakan..."
                value={catatanStatus}
                onChange={(e) => setCatatanStatus(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-600 resize-none bg-slate-50/50"
              />
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={diLuarKewenangan}
                  onChange={(e) => setDiLuarKewenangan(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span>Di luar kewenangan RW</span>
              </label>

              {diLuarKewenangan && (
                <div className="space-y-1 pl-5">
                  <label className="block text-[11px] font-semibold text-slate-600">Diteruskan kepada</label>
                  <input
                    type="text"
                    placeholder="Contoh: Pihak terkait / Desa Karangraharja / PLN"
                    value={diteruskanKepada}
                    onChange={(e) => setDiteruskanKepada(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-600 bg-amber-50/50"
                  />
                  <p className="text-[10px] text-slate-400 italic">
                    Catatan: Status tidak dapat langsung 'Selesai' hanya karena telah diteruskan.
                  </p>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={mutationStatus.isPending}
              className="w-full py-2.5 px-4 rounded-lg font-bold text-xs text-white bg-slate-900 hover:bg-slate-800 transition shadow flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {mutationStatus.isPending ? 'Menyimpan...' : 'Simpan Status'}
            </button>
          </form>

          <form onSubmit={handleKirimTanggapan} className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-3">
            <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">
              Tanggapan
            </h3>

            {tanggapanMsg && (
              <div className={`p-3 rounded-lg text-xs flex items-center gap-2 ${tanggapanMsg.type === 'ok' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'}`}>
                {tanggapanMsg.type === 'ok' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                <span>{tanggapanMsg.text}</span>
              </div>
            )}

            <div>
              <textarea
                rows={3}
                placeholder="Tulis tanggapan untuk warga pelapor..."
                value={isiTanggapan}
                onChange={(e) => setIsiTanggapan(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-600 resize-none bg-slate-50/50"
              />
            </div>

            <button
              type="submit"
              disabled={mutationTanggapan.isPending || !isiTanggapan.trim()}
              className="w-full py-2 px-4 rounded-lg font-bold text-xs text-white bg-emerald-700 hover:bg-emerald-800 transition shadow flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{mutationTanggapan.isPending ? 'Mengirim...' : 'Kirim Tanggapan'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
