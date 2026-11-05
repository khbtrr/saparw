import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { ListFilter, PlusCircle, User, LogOut, Megaphone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const WargaLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/masuk');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between max-w-md mx-auto sm:max-w-xl shadow-elev-2 border-x border-slate-200">
      <header className="bg-emerald-800 text-white px-4 py-2.5 sticky top-0 z-30 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="bg-emerald-900/60 p-2 rounded-lg text-emerald-100">
            <Megaphone className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-base leading-tight">SapaRW 05</h1>
            <p className="text-[11px] text-emerald-100">Desa Karangraharja</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="bg-emerald-900/70 px-2.5 py-1 rounded-md text-emerald-100 font-semibold">
            RT {user?.rt || '00'}
          </span>
          <button
            type="button"
            onClick={handleLogout}
            aria-label="Keluar dari akun warga"
            title="Keluar"
            className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center text-emerald-100 hover:text-white rounded-lg hover:bg-emerald-700/60 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <main className="flex-1 p-4 pb-24">
        <Outlet />
      </main>

      <nav
        aria-label="Navigasi warga"
        className="fixed bottom-0 left-0 right-0 max-w-md sm:max-w-xl mx-auto bg-white border-t border-slate-200 px-4 py-1.5 flex justify-around items-center gap-2 z-30 shadow-elev-2"
      >
        <NavLink
          to="/warga/aduan"
          end
          className={({ isActive }) =>
            `min-h-[44px] px-3 py-1 rounded-lg flex flex-col items-center justify-center gap-1 text-xs font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
              isActive ? 'text-primary font-bold' : 'text-slate-600 hover:text-slate-900'
            }`
          }
        >
          <ListFilter className="w-5 h-5" />
          <span>Aduan Saya</span>
        </NavLink>

        <NavLink
          to="/warga/aduan/baru"
          className={({ isActive }) =>
            `min-h-[44px] px-3 py-1 rounded-lg flex flex-col items-center justify-center gap-1 text-xs font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
              isActive ? 'text-primary font-bold' : 'text-slate-600 hover:text-slate-900'
            }`
          }
        >
          <div className="bg-primary text-white p-2 rounded-full -mt-5 shadow-elev-2 border-2 border-white">
            <PlusCircle className="w-6 h-6" />
          </div>
          <span className="-mt-0.5">Buat Aduan</span>
        </NavLink>

        <NavLink
          to="/warga/profil"
          className={({ isActive }) =>
            `min-h-[44px] px-3 py-1 rounded-lg flex flex-col items-center justify-center gap-1 text-xs font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
              isActive ? 'text-primary font-bold' : 'text-slate-600 hover:text-slate-900'
            }`
          }
        >
          <User className="w-5 h-5" />
          <span>Profil</span>
        </NavLink>
      </nav>
    </div>
  );
};
