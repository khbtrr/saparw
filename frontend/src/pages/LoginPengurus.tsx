import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiFetch, ApiError } from '../lib/api';
import type { Pengguna } from '../types';

export const LoginPengurus: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const res = await apiFetch<{ data: { user: Pengguna } }>('/api/auth/login', {
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
      {/* Desktop Card style matching wireframe 1: Login Pengurus RW */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Browser Mockup Top Bar */}
        <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
          <span className="text-[11px] text-slate-400 font-mono ml-2">pengaduan-rw05 / admin / login</span>
        </div>

        <div className="p-8">
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 text-emerald-800 font-bold text-sm mb-1">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>RW 05 DESA KARANGRAHARJA</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Login Pengurus RW</h2>
            <p className="text-xs text-slate-500 mt-0.5">Khusus pengurus RW 05 untuk verifikasi dan tindak lanjut aduan.</p>
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
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-3.5 pr-10 py-2.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 px-4 rounded-lg font-bold text-sm text-white bg-slate-900 hover:bg-slate-800 active:scale-[0.99] transition shadow flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Masuk</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <Link to="/masuk" className="hover:text-emerald-700">
              ← Masuk sebagai Warga
            </Link>
            <span className="text-[11px] text-slate-400">Versi 1.0</span>
          </div>

          <div className="mt-4 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-600">
            <p className="font-bold text-slate-700">Akun Demo Pengurus:</p>
            <p>Username: <code className="bg-slate-200 px-1 rounded">admin</code> | Pass: <code className="bg-slate-200 px-1 rounded">admin123</code></p>
          </div>
        </div>
      </div>
    </div>
  );
};
