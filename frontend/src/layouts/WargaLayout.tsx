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
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between max-w-md mx-auto sm:max-w-xl shadow-xl border-x border-slate-200">
      {/* Top Header Mobile */}
      <header className="bg-emerald-800 text-white px-4 py-3 sticky top-0 z-30 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2">
          <div className="bg-emerald-700 p-1.5 rounded-lg text-emerald-100">
            <Megaphone className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-base leading-tight">SapaRW 05</h1>
            <p className="text-[11px] text-emerald-200">Desa Karangraharja</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="hidden xs:inline bg-emerald-900/60 px-2 py-1 rounded text-emerald-100 font-medium">
            RT {user?.rt || '00'}
          </span>
          <button
            onClick={handleLogout}
            title="Keluar"
            className="p-1.5 text-emerald-200 hover:text-white rounded-md hover:bg-emerald-700/50 transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-4 pb-20">
        <Outlet />
      </main>

      {/* Bottom Navigation Warga (Mobile-First) */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md sm:max-w-xl mx-auto bg-white border-t border-slate-200 px-6 py-2 flex justify-around items-center z-30 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
        <NavLink
          to="/warga/aduan"
          end
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 text-xs font-medium transition ${
              isActive ? 'text-emerald-700 font-semibold' : 'text-slate-500 hover:text-slate-900'
            }`
          }
        >
          <ListFilter className="w-5 h-5" />
          <span>Aduan Saya</span>
        </NavLink>

        <NavLink
          to="/warga/aduan/baru"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 text-xs font-medium transition ${
              isActive ? 'text-emerald-700 font-semibold' : 'text-slate-500 hover:text-slate-900'
            }`
          }
        >
          <div className="bg-emerald-600 text-white p-2 rounded-full -mt-5 shadow-lg border-2 border-white">
            <PlusCircle className="w-6 h-6" />
          </div>
          <span className="-mt-1">Buat Aduan</span>
        </NavLink>

        <NavLink
          to="/warga/profil"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 text-xs font-medium transition ${
              isActive ? 'text-emerald-700 font-semibold' : 'text-slate-500 hover:text-slate-900'
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
