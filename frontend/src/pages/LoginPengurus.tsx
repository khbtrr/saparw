import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiFetch, ApiError } from '../lib/api';
import type { Pengguna } from '../types';

export const LoginPengurus: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const showDemoHint = import.meta.env.VITE_SHOW_DEMO_HINT === 'true';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const res = await apiFetch<{ data: { user: Pengguna; token?: string } }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          username,
          password,
          peran_target: 'admin',
        }),
      });

      login(res.data);
      navigate('/admin/aduan');
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Terjadi kendala jaringan saat menghubungi server.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="p-8">
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 text-emerald-800 font-bold text-sm mb-1">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>RW 05 DESA KARANGRAHARJA</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Login Pengurus RW</h2>
            <p className="text-xs text-slate-600 mt-0.5">Khusus pengurus RW 05 untuk verifikasi dan tindak lanjut aduan.</p>
          </div>

          {errorMessage && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Username
              </label>
              <input
                type="text"
                required
                placeholder="Masukkan username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-3.5 pr-12 py-2.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                  className="absolute right-1 min-h-[44px] min-w-[44px] inline-flex items-center justify-center text-slate-500 hover:text-slate-800"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 min-h-[44px] py-2.5 px-4 rounded-lg font-bold text-sm text-white bg-slate-900 hover:bg-slate-800 transition shadow flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <span>Masuk</span>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <Link to="/masuk" className="hover:text-emerald-700 font-medium">
              Kembali ke Login Warga
            </Link>
            <span className="text-xs text-slate-500">Versi 1.0</span>
          </div>

          {showDemoHint && (
            <div className="mt-4 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700">
              <p className="font-bold text-slate-800">Akun Demo Pengurus:</p>
              <p className="mt-0.5">Username: <code className="bg-slate-200 px-1 py-0.5 rounded font-mono text-slate-900">admin</code> | Pass: <code className="bg-slate-200 px-1 py-0.5 rounded font-mono text-slate-900">admin123</code></p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
