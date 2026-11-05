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
      setMsgProfil({ type: 'ok', text: 'Profil berhasil diperbarui.' });
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
        body: JSON.stringify({ password_baru: passwordBaru }),
      });
      setPasswordBaru('');
      setMsgPass({ type: 'ok', text: 'Kata sandi berhasil diubah.' });
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
        <p className="text-xs text-slate-600">Kelola identitas domisili dan kata sandi Anda</p>
      </div>

      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-elev-1 flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xl shrink-0">
          {user?.nama?.charAt(0) || 'W'}
        </div>
        <div>
          <h3 className="font-bold text-sm text-slate-900">{user?.nama}</h3>
          <p className="text-xs text-slate-600">@{user?.username} • Warga RT {user?.rt || '00'}</p>
          <span className="inline-block mt-1.5 text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-0.5 rounded-full">
            Akun Aktif Terverifikasi
          </span>
        </div>
      </div>

      <form onSubmit={handleUpdateProfil} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-elev-1 space-y-3.5">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <User className="w-4 h-4 text-primary" />
          <h4 className="text-xs font-bold text-slate-900">Ubah Data Domisili</h4>
        </div>

        {msgProfil && (
          <div
            role={msgProfil.type === 'err' ? 'alert' : 'status'}
            className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
              msgProfil.type === 'ok'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {msgProfil.type === 'ok' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{msgProfil.text}</span>
          </div>
        )}

        <div>
          <label htmlFor="profil-nama" className="block text-xs font-semibold text-slate-700 mb-1">
            Nama Lengkap
          </label>
          <input
            id="profil-nama"
            type="text"
            required
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            className="w-full min-h-[44px] px-3 py-2 text-sm rounded-xl border border-slate-300 text-slate-900 bg-slate-50/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="profil-norumah" className="block text-xs font-semibold text-slate-700 mb-1">
              No. Rumah
            </label>
            <input
              id="profil-norumah"
              type="text"
              placeholder="Nomor rumah"
              value={noRumah}
              onChange={(e) => setNoRumah(e.target.value)}
              className="w-full min-h-[44px] px-3 py-2 text-sm rounded-xl border border-slate-300 text-slate-900 bg-slate-50/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            />
          </div>
          <div>
            <label htmlFor="profil-nohp" className="block text-xs font-semibold text-slate-700 mb-1">
              No. WhatsApp
            </label>
            <input
              id="profil-nohp"
              type="tel"
              placeholder="Nomor HP aktif"
              value={noHp}
              onChange={(e) => setNoHp(e.target.value)}
              className="w-full min-h-[44px] px-3 py-2 text-sm rounded-xl border border-slate-300 text-slate-900 bg-slate-50/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={savingProfil}
          className="w-full min-h-[44px] py-2.5 px-4 rounded-xl font-bold text-xs text-white bg-primary hover:bg-primary-dark transition-colors disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          {savingProfil ? 'Menyimpan...' : 'Simpan Data Domisili'}
        </button>
      </form>

      <form onSubmit={handleUpdatePass} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-elev-1 space-y-3.5">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <Lock className="w-4 h-4 text-primary" />
          <h4 className="text-xs font-bold text-slate-900">Ganti Kata Sandi</h4>
        </div>

        {msgPass && (
          <div
            role={msgPass.type === 'err' ? 'alert' : 'status'}
            className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
              msgPass.type === 'ok'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {msgPass.type === 'ok' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{msgPass.text}</span>
          </div>
        )}

        <div>
          <label htmlFor="profil-password-baru" className="block text-xs font-semibold text-slate-700 mb-1">
            Kata Sandi Baru
          </label>
          <input
            id="profil-password-baru"
            type="password"
            required
            placeholder="Minimal 5 karakter"
            value={passwordBaru}
            onChange={(e) => setPasswordBaru(e.target.value)}
            className="w-full min-h-[44px] px-3 py-2 text-sm rounded-xl border border-slate-300 text-slate-900 bg-slate-50/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          />
        </div>

        <button
          type="submit"
          disabled={savingPass}
          className="w-full min-h-[44px] py-2.5 px-4 rounded-xl font-bold text-xs text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 transition-colors disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          {savingPass ? 'Mengubah...' : 'Perbarui Kata Sandi'}
        </button>
      </form>
    </div>
  );
};
