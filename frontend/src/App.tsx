import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { WargaLayout } from './layouts/WargaLayout';
import { AdminLayout } from './layouts/AdminLayout';

import { LandingPage } from './pages/LandingPage';
import { LoginWarga } from './pages/LoginWarga';
import { LoginPengurus } from './pages/LoginPengurus';
import { DaftarWarga } from './pages/DaftarWarga';

import { DaftarAduanSaya } from './pages/DaftarAduanSaya';
import { FormAduan } from './pages/FormAduan';
import { DetailAduanWarga } from './pages/DetailAduanWarga';
import { ProfilWarga } from './pages/ProfilWarga';

import { AdminDaftarAduan } from './pages/admin/AdminDaftarAduan';
import { AdminDetailAduan } from './pages/admin/AdminDetailAduan';
import { AdminVerifikasiAkun } from './pages/admin/AdminVerifikasiAkun';
import { AdminKelolaKategori } from './pages/admin/AdminKelolaKategori';
import { AdminRekap } from './pages/admin/AdminRekap';

export const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/masuk" element={<LoginWarga />} />
      <Route path="/daftar" element={<DaftarWarga />} />
      <Route path="/admin/masuk" element={<LoginPengurus />} />

      <Route element={<ProtectedRoute requiredRole="warga" />}>
        <Route path="/warga" element={<WargaLayout />}>
          <Route index element={<Navigate to="/warga/aduan" replace />} />
          <Route path="aduan" element={<DaftarAduanSaya />} />
          <Route path="aduan/baru" element={<FormAduan />} />
          <Route path="aduan/:id" element={<DetailAduanWarga />} />
          <Route path="profil" element={<ProfilWarga />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute requiredRole="admin" />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/aduan" replace />} />
          <Route path="aduan" element={<AdminDaftarAduan />} />
          <Route path="aduan/:id" element={<AdminDetailAduan />} />
          <Route path="akun" element={<Navigate to="/admin/pengguna" replace />} />
          <Route path="pengguna" element={<AdminVerifikasiAkun />} />
          <Route path="kategori" element={<AdminKelolaKategori />} />
          <Route path="rekap" element={<AdminRekap />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
