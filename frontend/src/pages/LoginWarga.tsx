import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Megaphone, Lock, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiFetch, ApiError } from '../lib/api';
import type { Pengguna } from '../types';

export const LoginWarga: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fromPath = (location.state as { from?: string } | null)?.from;
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
          peran_target: 'warga',
        }),
      });

      login(res.data);
      const target = fromPath && fromPath.startsWith('/warga') ? fromPath : '/warga/aduan';
      navigate(target, { replace: true });
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
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-elev-2 border border-slate-200 overflow-hidden p-6 sm:p-8">
        <div className="text-center mb-7">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary-soft text-primary mb-3">
            <Megaphone className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Masuk Akun Warga</h1>
          <p className="text-xs text-slate-600 mt-1">SapaRW 05 Desa Karangraharja</p>
        </div>

        {errorMessage && (
          <div
            role="alert"
            className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="warga-username" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Username
            </label>
            <input
              id="warga-username"
              type="text"
              required
              placeholder="Masukkan username warga"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full min-h-[44px] px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 bg-slate-50/50 text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-colors"
            />
          </div>

          <div>
            <label htmlFor="warga-password" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Kata Sandi
            </label>
            <div className="relative">
              <input
                id="warga-password"
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Masukkan kata sandi"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full min-h-[44px] pl-3.5 pr-12 py-2.5 text-sm rounded-xl border border-slate-300 bg-slate-50/50 text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                className="absolute right-1 top-1/2 -translate-y-1/2 min-h-[40px] min-w-[40px] inline-flex items-center justify-center rounded-lg text-slate-600 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full min-h-[44px] mt-2 py-2.5 px-4 rounded-xl font-bold text-sm text-white bg-primary hover:bg-primary-dark transition-colors shadow-elev-1 flex items-center justify-center gap-2 disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Memeriksa...</span>
              </>
            ) : (
              <span>Masuk ke Akun Warga</span>
            )}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-200 text-center space-y-2">
          <p className="text-xs text-slate-700">
            Belum punya akun warga?{' '}
            <Link
              to="/daftar"
              className="min-h-[44px] inline-flex items-center px-1 font-semibold text-primary hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary rounded"
            >
              Daftar Akun Warga
            </Link>
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              to="/"
              className="min-h-[44px] inline-flex items-center px-2 text-xs text-slate-600 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary rounded"
            >
              Beranda Publik
            </Link>
            <span className="text-slate-400">•</span>
            <Link
              to="/admin/masuk"
              className="min-h-[44px] inline-flex items-center gap-1 px-2 text-xs text-slate-600 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary rounded"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Panel Pengurus RW</span>
            </Link>
          </div>
        </div>

        {showDemoHint && (
          <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700">
            <p className="font-bold text-slate-800 mb-0.5">Akun Demo Warga:</p>
            <p>Username: <code className="bg-slate-200 px-1 rounded">warga01</code> (Aktif)</p>
            <p>Kata Sandi: <code className="bg-slate-200 px-1 rounded">warga123</code></p>
          </div>
        )}
      </div>
    </div>
  );
};
