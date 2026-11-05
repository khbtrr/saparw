import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react';
import { apiFetch, ApiError } from '../lib/api';

export const DaftarWarga: React.FC = () => {
  const [nama, setNama] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rt, setRt] = useState('02');
  const [noRumah, setNoRumah] = useState('');
  const [noHp, setNoHp] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      await apiFetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          nama,
          username,
          password,
          rt,
          no_rumah: noRumah,
          no_hp: noHp,
        }),
      });

      setSuccess(true);
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Gagal mendaftar. Silakan coba beberapa saat lagi.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center px-4 py-8">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-elev-2 border border-slate-200 overflow-hidden p-6 sm:p-8">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary-soft text-primary mb-2">
            <UserPlus className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Daftar Akun Warga</h1>
          <p className="text-xs text-slate-600 mt-1">Lengkapi data domisili warga RW 05 Desa Karangraharja</p>
        </div>

        {success ? (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-700 mx-auto" />
            <h2 className="font-bold text-sm text-emerald-900">Pendaftaran Berhasil Terkirim</h2>
            <p className="text-xs text-emerald-800 leading-relaxed">
              Akun Anda berstatus <strong>Menunggu Verifikasi</strong>. Pengurus RW 05 akan memeriksa dan mengaktifkan akun Anda sebelum dapat digunakan untuk masuk.
            </p>
            <div className="pt-2">
              <Link
                to="/masuk"
                className="min-h-[44px] inline-flex items-center justify-center w-full py-2.5 px-4 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary-dark transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                Kembali ke Halaman Masuk
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {errorMessage && (
              <div
                role="alert"
                className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div>
              <label htmlFor="daftar-nama" className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Lengkap
              </label>
              <input
                id="daftar-nama"
                type="text"
                required
                placeholder="Masukkan nama lengkap sesuai KTP"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                className="w-full min-h-[44px] px-3 py-2 text-sm rounded-xl border border-slate-300 text-slate-900 bg-slate-50/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="daftar-username" className="block text-xs font-semibold text-slate-700 mb-1">
                  Username
                </label>
                <input
                  id="daftar-username"
                  type="text"
                  required
                  placeholder="Buat username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full min-h-[44px] px-3 py-2 text-sm rounded-xl border border-slate-300 text-slate-900 bg-slate-50/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-colors"
                />
              </div>
              <div>
                <label htmlFor="daftar-rt" className="block text-xs font-semibold text-slate-700 mb-1">
                  RT Domisili
                </label>
                <select
                  id="daftar-rt"
                  value={rt}
                  onChange={(e) => setRt(e.target.value)}
                  className="w-full min-h-[44px] px-3 py-2 text-sm rounded-xl border border-slate-300 text-slate-900 bg-slate-50/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-colors"
                >
                  <option value="01">RT 01</option>
                  <option value="02">RT 02</option>
                  <option value="03">RT 03</option>
                  <option value="04">RT 04</option>
                  <option value="05">RT 05</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="daftar-norumah" className="block text-xs font-semibold text-slate-700 mb-1">
                  No. Rumah
                </label>
                <input
                  id="daftar-norumah"
                  type="text"
                  placeholder="Nomor rumah"
                  value={noRumah}
                  onChange={(e) => setNoRumah(e.target.value)}
                  className="w-full min-h-[44px] px-3 py-2 text-sm rounded-xl border border-slate-300 text-slate-900 bg-slate-50/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-colors"
                />
              </div>
              <div>
                <label htmlFor="daftar-nohp" className="block text-xs font-semibold text-slate-700 mb-1">
                  No. WhatsApp
                </label>
                <input
                  id="daftar-nohp"
                  type="tel"
                  placeholder="Nomor HP aktif"
                  value={noHp}
                  onChange={(e) => setNoHp(e.target.value)}
                  className="w-full min-h-[44px] px-3 py-2 text-sm rounded-xl border border-slate-300 text-slate-900 bg-slate-50/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-colors"
                />
              </div>
            </div>

            <div>
              <label htmlFor="daftar-password" className="block text-xs font-semibold text-slate-700 mb-1">
                Kata Sandi
              </label>
              <input
                id="daftar-password"
                type="password"
                required
                placeholder="Minimal 5 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full min-h-[44px] px-3 py-2 text-sm rounded-xl border border-slate-300 text-slate-900 bg-slate-50/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full min-h-[44px] mt-3 py-2.5 px-4 rounded-xl font-bold text-sm text-white bg-primary hover:bg-primary-dark transition-colors shadow-elev-1 flex items-center justify-center gap-2 disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Mendaftarkan...</span>
                </>
              ) : (
                <span>Kirim Pendaftaran Akun</span>
              )}
            </button>

            <div className="text-center pt-2">
              <Link
                to="/masuk"
                className="min-h-[44px] inline-flex items-center px-2 text-xs text-slate-600 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary rounded"
              >
                Sudah punya akun? <span className="text-primary font-semibold underline ml-1">Masuk</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
