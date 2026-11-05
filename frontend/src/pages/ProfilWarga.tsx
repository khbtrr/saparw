import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiFetch, ApiError } from '../lib/api';
import { User, Lock, CheckCircle2, AlertCircle } from 'lucide-react';

export const ProfilWarga: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [nama, setNama] = useState(user?.nama || '');
  const [noHp, setNoHp] = useState(user?.no_hp || '');
  const [noRumah, setNoRumah] = useState(user?.no_rumah || '');
  const [savingProfil, setSavingProfil] = useState(false);
  const [msgProfil, setMsgProfil] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const [passwordLama, setPasswordLama] = useState('');
  const [passwordBaru, setPasswordBaru] = useState('');
  const [savingPass, setSavingPass] = useState(false);
  const [msgPass, setMsgPass] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const handleUpdateProfil = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfil(true);
    setMsgProfil(null);
    try {
      await apiFetch('/api/auth/profil', {
        method: 'PUT',
        body: JSON.stringify({ nama, no_hp: noHp, no_rumah: noRumah }),
      });
      await refreshUser();
      setMsgProfil({ type: 'ok', text: 'Profil berhasil diperbarui!' });
    } catch (err) {
      setMsgProfil({ type: 'err', text: err instanceof ApiError ? err.message : 'Gagal memperbarui profil.' });
    } finally {
      setSavingProfil(false);
    }
  };

  const handleUpdatePass = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPass(true);
    setMsgPass(null);
    try {
      await apiFetch('/api/auth/password', {
        method: 'PUT',
        body: JSON.stringify({
          password_lama: passwordLama,
          password_baru: passwordBaru,
        }),
      });
      setPasswordLama('');
      setPasswordBaru('');
      setMsgPass({ type: 'ok', text: 'Kata sandi berhasil diubah!' });
    } catch (err) {
      setMsgPass({ type: 'err', text: err instanceof ApiError ? err.message : 'Gagal mengubah kata sandi.' });
    } finally {
      setSavingPass(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="pb-2 border-b border-slate-200">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">Profil Pengguna</h2>
        <p className="text-xs text-slate-500">Kelola identitas domisili dan kata sandi Anda</p>
      </div>

      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xl">
          {user?.nama?.charAt(0) || 'W'}
        </div>
        <div>
          <h3 className="font-bold text-sm text-slate-900">{user?.nama}</h3>
          <p className="text-xs text-slate-500">@{user?.username} • Warga RT {user?.rt || '00'}</p>
          <span className="inline-block mt-1 text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
            Akun Aktif Terverifikasi
          </span>
        </div>
      </div>

      <form onSubmit={handleUpdateProfil} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3.5">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <User className="w-4 h-4 text-emerald-700" />
          <h4 className="text-xs font-bold text-slate-900">Ubah Data Domisili</h4>
        </div>

        {msgProfil && (
          <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${msgProfil.type === 'ok' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'}`}>
            {msgProfil.type === 'ok' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{msgProfil.text}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Lengkap</label>
          <input
            type="text"
            required
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-600 bg-slate-50/50"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">No. Rumah</label>
            <input
              type="text"
              value={noRumah}
              onChange={(e) => setNoRumah(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-600 bg-slate-50/50"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">No. WhatsApp</label>
            <input
              type="tel"
              value={noHp}
              onChange={(e) => setNoHp(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-600 bg-slate-50/50"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={savingProfil}
          className="w-full min-h-[44px] py-2.5 px-4 rounded-xl font-bold text-xs text-white bg-slate-900 hover:bg-slate-800 transition disabled:opacity-50"
        >
          {savingProfil ? 'Menyimpan...' : 'Simpan Data Domisili'}
        </button>
      </form>

      <form onSubmit={handleUpdatePass} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3.5">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <Lock className="w-4 h-4 text-emerald-700" />
          <h4 className="text-xs font-bold text-slate-900">Ganti Kata Sandi</h4>
        </div>

        {msgPass && (
          <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${msgPass.type === 'ok' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'}`}>
            {msgPass.type === 'ok' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{msgPass.text}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Kata Sandi Saat Ini</label>
          <input
            type="password"
            required
            placeholder="Masukkan kata sandi saat ini"
            value={passwordLama}
            onChange={(e) => setPasswordLama(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-600 bg-slate-50/50"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Kata Sandi Baru</label>
          <input
            type="password"
            required
            minLength={8}
            placeholder="Minimal 8 karakter"
            value={passwordBaru}
            onChange={(e) => setPasswordBaru(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-600 bg-slate-50/50"
          />
        </div>

        <button
          type="submit"
          disabled={savingPass}
          className="w-full min-h-[44px] py-2.5 px-4 rounded-xl font-bold text-xs text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition disabled:opacity-50"
        >
          {savingPass ? 'Mengubah...' : 'Perbarui Kata Sandi'}
        </button>
      </form>
    </div>
  );
};
