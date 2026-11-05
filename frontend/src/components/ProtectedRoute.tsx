import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { PeranPengguna } from '../types';

interface ProtectedRouteProps {
  requiredRole?: PeranPengguna;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requiredRole }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-slate-500 font-medium">Memuat data...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate
        to={requiredRole === 'admin' ? '/admin/masuk' : '/masuk'}
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  if (requiredRole && user.peran !== requiredRole) {
    return <Navigate to={user.peran === 'admin' ? '/admin/aduan' : '/warga/aduan'} replace />;
  }

  return <Outlet />;
};
