import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  FileText,
  UserCheck,
  Tags,
  BarChart3,
  LogOut,
  Menu,
  X,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/admin/masuk');
  };

  const navItems = [
    { label: 'Daftar Aduan', path: '/admin/aduan', icon: FileText },
    { label: 'Verifikasi Akun', path: '/admin/akun', icon: UserCheck },
    { label: 'Kelola Kategori', path: '/admin/kategori', icon: Tags },
    { label: 'Rekap & Laporan', path: '/admin/rekap', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      <header className="md:hidden bg-slate-900 text-white px-4 py-2 flex items-center justify-between sticky top-0 z-40 shadow-sm no-print">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-emerald-400" />
          <span className="font-bold text-sm">Pengaduan RW 05 - Panel Pengurus</span>
        </div>
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? 'Tutup navigasi pengurus' : 'Buka navigasi pengurus'}
          aria-expanded={mobileMenuOpen}
          className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-400 transition"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      <aside
        className={`fixed md:sticky top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 text-slate-200 flex flex-col justify-between transition-transform duration-200 no-print ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          <div className="p-5 border-b border-slate-800">
            <h2 className="font-bold text-lg text-white tracking-tight">Pengaduan RW 05</h2>
            <p className="text-xs text-emerald-400 font-medium mt-0.5">Panel Pengurus</p>
          </div>

          <nav aria-label="Navigasi admin" className="p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `min-h-[44px] flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-400 ${
                      isActive
                        ? 'bg-emerald-700 text-white shadow-sm'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-800 flex items-center justify-between">
          <div className="overflow-hidden pr-2">
            <p className="text-xs font-semibold text-white truncate">{user?.nama || 'Pengurus RW'}</p>
            <p className="text-[11px] text-slate-400 truncate">@{user?.username}</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            title="Keluar"
            aria-label="Keluar dari akun pengurus"
            className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-rose-400"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/50 z-30 md:hidden no-print"
        />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <div className="hidden md:flex items-center justify-end px-8 py-3 bg-white border-b border-slate-200 no-print">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Pengurus RW 05</span>
          </div>
        </div>

        <main className="p-4 md:p-8 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
