import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search,
  UserCheck,
  AlertCircle,
  RefreshCw,
  UserPlus,
  ShieldCheck,
  Users,
  KeyRound,
  X,
  CheckCircle2,
  Lock,
  Pencil,
} from 'lucide-react';
import { apiFetch } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { useDialog } from '../../context/DialogContext';
import type { Pengguna } from '../../types';

export const AdminVerifikasiAkun: React.FC = () => {
  const { user: currentAdmin } = useAuth();
  const { showAlert, showConfirm } = useDialog();
  const queryClient = useQueryClient();

  // Navigation tab: 'warga' | 'admin'
  const [peranTab, setPeranTab] = useState<'warga' | 'admin'>('warga');
  // Status sub-tab
  const [tabWarga, setTabWarga] = useState<'belum_aktif' | 'aktif' | 'semua'>('belum_aktif');
  const [tabAdmin, setTabAdmin] = useState<'semua' | 'aktif' | 'nonaktif'>('semua');
  const [cari, setCari] = useState('');

  // Modals state
  const [showTambahModal, setShowTambahModal] = useState(false);
  const [userToResetPassword, setUserToResetPassword] = useState<Pengguna | null>(null);
  const [userToEdit, setUserToEdit] = useState<Pengguna | null>(null);

  // Form states for Tambah Pengguna
  const [formData, setFormData] = useState({
    nama: '',
    username: '',
    password: '',
    rt: '01',
    no_rumah: '',
    no_hp: '',
  });
  const [formError, setFormError] = useState<string | null>(null);

  // Form states for Edit Pengguna
  const [editFormData, setEditFormData] = useState<{
    nama: string;
    username: string;
    peran: 'warga' | 'admin';
    rt: string;
    no_rumah: string;
    no_hp: string;
  }>({
    nama: '',
    username: '',
    peran: 'warga',
    rt: '01',
    no_rumah: '',
    no_hp: '',
  });
  const [editFormError, setEditFormError] = useState<string | null>(null);

  // Form state for Reset Password
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetError, setResetError] = useState<string | null>(null);

  // Active status tab based on current role
  const activeStatusTab = peranTab === 'warga' ? tabWarga : tabAdmin;

  // Query users
  const { data, isLoading, error, refetch } = useQuery<{
    data: Pengguna[];
    counts: { belum_aktif: number; aktif: number; semua: number };
  }>({
    queryKey: ['admin-pengguna', peranTab, activeStatusTab, cari],
    queryFn: () => {
      const q = new URLSearchParams();
      q.set('peran', peranTab);
      q.set('tab', activeStatusTab);
      if (cari.trim()) q.set('cari', cari.trim());
      return apiFetch(`/api/admin/pengguna?${q.toString()}`);
    },
  });

  // Mutation: Toggle Active status
  const mutationAktif = useMutation({
    mutationFn: ({ id, aktif }: { id: number; aktif: boolean }) =>
      apiFetch(`/api/admin/pengguna/${id}/aktif`, {
        method: 'PATCH',
        body: JSON.stringify({ aktif }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pengguna'] });
    },
    onError: (err: any) => {
      showAlert({
        title: 'Gagal Mengubah Status',
        message: err.message || 'Gagal mengubah status aktivasi akun.',
        type: 'danger',
      });
    },
  });

  // Mutation: Create User
  const mutationTambah = useMutation({
    mutationFn: (payload: {
      nama: string;
      username: string;
      password: string;
      peran: 'warga' | 'admin';
      rt?: string;
      no_rumah?: string;
      no_hp?: string;
    }) =>
      apiFetch('/api/admin/pengguna', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      setShowTambahModal(false);
      resetForm();
      showAlert({
        title: 'Berhasil Dibuat',
        message: 'Akun baru berhasil didaftarkan dan langsung aktif.',
        type: 'success',
      });
      queryClient.invalidateQueries({ queryKey: ['admin-pengguna'] });
    },
    onError: (err: any) => {
      setFormError(err.message || 'Gagal menambahkan akun.');
    },
  });

  // Mutation: Edit User
  const mutationEdit = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: {
        nama: string;
        username: string;
        peran: 'warga' | 'admin';
        rt?: string;
        no_rumah?: string;
        no_hp?: string;
      };
    }) =>
      apiFetch(`/api/admin/pengguna/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      setUserToEdit(null);
      setEditFormError(null);
      showAlert({
        title: 'Berhasil Diperbarui',
        message: 'Data akun berhasil diperbarui.',
        type: 'success',
      });
      queryClient.invalidateQueries({ queryKey: ['admin-pengguna'] });
    },
    onError: (err: any) => {
      setEditFormError(err.message || 'Gagal memperbarui data akun.');
    },
  });

  // Mutation: Reset Password
  const mutationResetPassword = useMutation({
    mutationFn: ({ id, password }: { id: number; password: string }) =>
      apiFetch(`/api/admin/pengguna/${id}/reset-password`, {
        method: 'POST',
        body: JSON.stringify({ password }),
      }),
    onSuccess: () => {
      setUserToResetPassword(null);
      setNewPassword('');
      setConfirmPassword('');
      setResetError(null);
      showAlert({
        title: 'Berhasil Reset Sandi',
        message: 'Kata sandi pengguna berhasil diperbarui.',
        type: 'success',
      });
      queryClient.invalidateQueries({ queryKey: ['admin-pengguna'] });
    },
    onError: (err: any) => {
      setResetError(err.message || 'Gagal mereset kata sandi.');
    },
  });

  const resetForm = () => {
    setFormData({
      nama: '',
      username: '',
      password: peranTab === 'warga' ? 'warga123' : 'pengurus123',
      rt: '01',
      no_rumah: '',
      no_hp: '',
    });
    setFormError(null);
  };

  const handleOpenTambahModal = () => {
    resetForm();
    setShowTambahModal(true);
  };

  const handleOpenEditModal = (user: Pengguna) => {
    setUserToEdit(user);
    setEditFormData({
      nama: user.nama,
      username: user.username,
      peran: user.peran,
      rt: user.rt || '01',
      no_rumah: user.no_rumah || '',
      no_hp: user.no_hp || '',
    });
    setEditFormError(null);
  };

  const handleSubmitTambah = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.nama.trim() || !formData.username.trim() || !formData.password.trim()) {
      setFormError('Nama, username, dan kata sandi wajib diisi.');
      return;
    }

    if (formData.password.length < 5) {
      setFormError('Kata sandi minimal 5 karakter.');
      return;
    }

    mutationTambah.mutate({
      nama: formData.nama.trim(),
      username: formData.username.trim().toLowerCase(),
      password: formData.password,
      peran: peranTab,
      rt: peranTab === 'warga' ? formData.rt : undefined,
      no_rumah: peranTab === 'warga' && formData.no_rumah ? formData.no_rumah.trim() : undefined,
      no_hp: formData.no_hp ? formData.no_hp.trim() : undefined,
    });
  };

  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    setEditFormError(null);

    if (!editFormData.nama.trim() || !editFormData.username.trim()) {
      setEditFormError('Nama lengkap dan username wajib diisi.');
      return;
    }

    if (!userToEdit) return;

    mutationEdit.mutate({
      id: userToEdit.id_pengguna,
      payload: {
        nama: editFormData.nama.trim(),
        username: editFormData.username.trim().toLowerCase(),
        peran: editFormData.peran,
        rt: editFormData.peran === 'warga' ? editFormData.rt : undefined,
        no_rumah: editFormData.peran === 'warga' && editFormData.no_rumah ? editFormData.no_rumah.trim() : undefined,
        no_hp: editFormData.no_hp ? editFormData.no_hp.trim() : undefined,
      },
    });
  };

  const handleSubmitResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);

    if (!newPassword || newPassword.length < 5) {
      setResetError('Kata sandi baru minimal 5 karakter.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setResetError('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    if (userToResetPassword) {
      mutationResetPassword.mutate({
        id: userToResetPassword.id_pengguna,
        password: newPassword,
      });
    }
  };

  const counts = data?.counts || { belum_aktif: 0, aktif: 0, semua: 0 };

  return (
    <div className="space-y-6">
      {/* Header Halaman */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600" />
            <span>Kelola Pengguna & Akun</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manajemen verifikasi akun warga, pembuatan akun manual, dan penambahan pengurus RW 05
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleOpenTambahModal}
            className="min-h-[44px] px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-2 shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600"
          >
            <UserPlus className="w-4 h-4" />
            <span>{peranTab === 'warga' ? 'Tambah Warga Manual' : 'Tambah Pengurus RW'}</span>
          </button>

          <button
            type="button"
            onClick={() => refetch()}
            className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600"
            title="Segarkan data"
            aria-label="Segarkan data pengguna"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Role Tabs: Warga vs Pengurus RW */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          type="button"
          onClick={() => {
            setPeranTab('warga');
            setCari('');
          }}
          className={`min-h-[44px] px-5 py-2.5 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
            peranTab === 'warga'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Akun Warga</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setPeranTab('admin');
            setCari('');
          }}
          className={`min-h-[44px] px-5 py-2.5 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
            peranTab === 'admin'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Pengurus RW</span>
        </button>
      </div>

      {/* Filter Status Sub-tabs & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {peranTab === 'warga' ? (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <button
              type="button"
              onClick={() => setTabWarga('belum_aktif')}
              className={`min-h-[38px] px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                tabWarga === 'belum_aktif'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>Belum Aktif (Perlu Verifikasi)</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  tabWarga === 'belum_aktif' ? 'bg-amber-400 text-slate-950 font-black' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {counts.belum_aktif}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setTabWarga('aktif')}
              className={`min-h-[38px] px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                tabWarga === 'aktif'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>Aktif</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  tabWarga === 'aktif' ? 'bg-emerald-500 text-white font-black' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {counts.aktif}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setTabWarga('semua')}
              className={`min-h-[38px] px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                tabWarga === 'semua'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>Semua</span>
              <span className="text-[10px] text-slate-400">({counts.semua})</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <button
              type="button"
              onClick={() => setTabAdmin('semua')}
              className={`min-h-[38px] px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                tabAdmin === 'semua'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>Semua Pengurus</span>
              <span className="text-[10px] text-slate-400">({counts.semua})</span>
            </button>

            <button
              type="button"
              onClick={() => setTabAdmin('aktif')}
              className={`min-h-[38px] px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                tabAdmin === 'aktif'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>Aktif</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  tabAdmin === 'aktif' ? 'bg-emerald-500 text-white font-black' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {counts.aktif}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setTabAdmin('nonaktif')}
              className={`min-h-[38px] px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                tabAdmin === 'nonaktif'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>Nonaktif</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  tabAdmin === 'nonaktif' ? 'bg-rose-500 text-white font-black' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {counts.belum_aktif}
              </span>
            </button>
          </div>
        )}

        <div className="w-full sm:w-72 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder={peranTab === 'warga' ? 'Cari nama, RT, atau username...' : 'Cari pengurus RW...'}
            value={cari}
            onChange={(e) => setCari(e.target.value)}
            className="w-full pl-9 pr-3.5 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
        </div>
      </div>

      {/* Tabel Pengguna */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-slate-500">Memuat data pengguna...</div>
        ) : error ? (
          <div className="p-4 bg-rose-50 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>Gagal mengambil data pengguna.</span>
          </div>
        ) : !data?.data || data.data.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            {peranTab === 'warga' ? 'Tidak ada data akun warga.' : 'Tidak ada data pengurus RW.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                  <th className="py-3 px-4">Nama Lengkap</th>
                  <th className="py-3 px-4">Username</th>
                  {peranTab === 'warga' ? (
                    <th className="py-3 px-4">Domisili</th>
                  ) : (
                    <th className="py-3 px-4">Peran</th>
                  )}
                  <th className="py-3 px-4">Kontak (HP/WA)</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.data.map((user) => {
                  const isCurrentAdmin = currentAdmin?.id_pengguna === user.id_pengguna;

                  return (
                    <tr key={user.id_pengguna} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        <div className="flex items-center gap-1.5">
                          <span>{user.nama}</span>
                          {isCurrentAdmin && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              Anda
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">@{user.username}</td>
                      {peranTab === 'warga' ? (
                        <td className="py-3 px-4 text-slate-600">
                          RT {user.rt || '-'} {user.no_rumah ? `• No. ${user.no_rumah}` : ''}
                        </td>
                      ) : (
                        <td className="py-3 px-4 text-slate-600">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-800 border border-slate-200">
                            Pengurus RW 05
                          </span>
                        </td>
                      )}
                      <td className="py-3 px-4 text-slate-600 font-mono">
                        {user.no_hp || '-'}
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        {user.aktif ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            Aktif
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                            {peranTab === 'warga' ? 'Belum aktif' : 'Nonaktif'}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Tombol Edit Profil & Peran */}
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(user)}
                            title="Edit data akun & alih peran"
                            className="px-2 py-1 bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-md text-[11px] font-medium transition shadow-sm flex items-center gap-1"
                          >
                            <Pencil className="w-3 h-3 text-sky-600" />
                            <span className="hidden sm:inline">Edit</span>
                          </button>

                          {/* Tombol Toggle Aktif / Nonaktif */}
                          {user.aktif ? (
                            <button
                              type="button"
                              onClick={() => {
                                showConfirm({
                                  title: 'Konfirmasi Penonaktifan Akun',
                                  message: `Apakah Anda yakin ingin menonaktifkan akun ${user.peran === 'admin' ? 'pengurus' : 'warga'} "${user.nama}"? Pengguna tidak akan dapat masuk kembali sampai diaktifkan lagi.`,
                                  confirmText: 'Ya, Nonaktifkan',
                                  type: 'danger',
                                  onConfirm: () => mutationAktif.mutate({ id: user.id_pengguna, aktif: false }),
                                });
                              }}
                              disabled={mutationAktif.isPending || isCurrentAdmin}
                              title={
                                isCurrentAdmin
                                  ? 'Anda tidak dapat menonaktifkan akun Anda sendiri'
                                  : 'Nonaktifkan akun'
                              }
                              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition shadow-sm border ${
                                isCurrentAdmin
                                  ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                                  : 'bg-white border-slate-300 text-slate-700 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300'
                              }`}
                            >
                              Nonaktifkan
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => mutationAktif.mutate({ id: user.id_pengguna, aktif: true })}
                              disabled={mutationAktif.isPending}
                              className="px-2.5 py-1 bg-slate-900 text-white hover:bg-emerald-700 rounded-md transition font-bold text-[11px] shadow-sm flex items-center gap-1"
                            >
                              <UserCheck className="w-3 h-3" />
                              <span>Aktifkan</span>
                            </button>
                          )}

                          {/* Tombol Reset Password */}
                          <button
                            type="button"
                            onClick={() => {
                              setUserToResetPassword(user);
                              setNewPassword('');
                              setConfirmPassword('');
                              setResetError(null);
                            }}
                            title="Reset kata sandi"
                            className="px-2 py-1 bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-md text-[11px] font-medium transition shadow-sm flex items-center gap-1"
                          >
                            <KeyRound className="w-3 h-3 text-amber-600" />
                            <span className="hidden sm:inline">Reset Sandi</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="text-[11px] text-slate-400 italic">
        *Semua akun yang didaftarkan manual oleh pengurus berstatus langsung aktif. Penonaktifan akun akan otomatis mencabut seluruh sesi login aktif.
      </p>

      {/* Modal Tambah Pengguna (Warga / Pengurus) */}
      {showTambahModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-emerald-600" />
                  <span>{peranTab === 'warga' ? 'Tambah Akun Warga Manual' : 'Tambah Akun Pengurus RW'}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {peranTab === 'warga'
                    ? 'Buat akun untuk warga RW 05 (langsung berstatus aktif)'
                    : 'Tambah pengurus RW dengan akses administrasi'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowTambahModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitTambah} className="p-5 space-y-4">
              {formError && (
                <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {peranTab === 'warga' ? 'Nama Lengkap Warga *' : 'Nama Lengkap & Jabatan *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={peranTab === 'warga' ? 'Contoh: Bapak Joko Susanto' : 'Contoh: Bambang S. (Seksi Keamanan)'}
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Username *</label>
                  <input
                    type="text"
                    required
                    placeholder="misal: jokorw05"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/\s+/g, '') })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">No. HP / WA</label>
                  <input
                    type="tel"
                    placeholder="08xxxxxxxxxx"
                    value={formData.no_hp}
                    onChange={(e) => setFormData({ ...formData, no_hp: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              {peranTab === 'warga' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">RT *</label>
                    <select
                      value={formData.rt}
                      onChange={(e) => setFormData({ ...formData, rt: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white"
                    >
                      {['01', '02', '03', '04', '05', '06', '07', '08'].map((rtNum) => (
                        <option key={rtNum} value={rtNum}>
                          RT {rtNum}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">No. Rumah / Blok</label>
                    <input
                      type="text"
                      placeholder="Contoh: Blok B2 No. 10"
                      value={formData.no_rumah}
                      onChange={(e) => setFormData({ ...formData, no_rumah: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">Kata Sandi Awal *</label>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        password: peranTab === 'warga' ? 'warga123' : 'pengurus123',
                      })
                    }
                    className="text-[11px] text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    Gunakan default ({peranTab === 'warga' ? 'warga123' : 'pengurus123'})
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Informasikan username dan kata sandi ini kepada pemilik akun.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowTambahModal(false)}
                  className="min-h-[40px] px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-medium transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={mutationTambah.isPending}
                  className="min-h-[40px] px-4 py-2 bg-slate-900 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{mutationTambah.isPending ? 'Menyimpan...' : 'Simpan & Aktifkan'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit Data Pengguna & Alih Peran */}
      {userToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Pencil className="w-4 h-4 text-sky-600" />
                  <span>Edit Data Pengguna</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Perbarui identitas profil dan alih peran akun pengguna
                </p>
              </div>
              <button
                type="button"
                onClick={() => setUserToEdit(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitEdit} className="p-5 space-y-4">
              {editFormError && (
                <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{editFormError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Lengkap / Jabatan *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nama lengkap pengguna"
                  value={editFormData.nama}
                  onChange={(e) => setEditFormData({ ...editFormData, nama: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Username *</label>
                  <input
                    type="text"
                    required
                    placeholder="username"
                    value={editFormData.username}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        username: e.target.value.toLowerCase().replace(/\s+/g, ''),
                      })
                    }
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Peran Akses *</label>
                  <select
                    value={editFormData.peran}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        peran: e.target.value as 'warga' | 'admin',
                      })
                    }
                    disabled={userToEdit.id_pengguna === currentAdmin?.id_pengguna}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white disabled:bg-slate-100 disabled:text-slate-500"
                  >
                    <option value="warga">Warga</option>
                    <option value="admin">Pengurus RW (Admin)</option>
                  </select>
                </div>
              </div>

              {userToEdit.id_pengguna === currentAdmin?.id_pengguna && (
                <p className="text-[11px] text-amber-600">
                  *Anda tidak dapat menurunkan peran akun Anda sendiri yang sedang aktif digunakan.
                </p>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">No. HP / WA</label>
                <input
                  type="tel"
                  placeholder="08xxxxxxxxxx"
                  value={editFormData.no_hp}
                  onChange={(e) => setEditFormData({ ...editFormData, no_hp: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              {editFormData.peran === 'warga' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">RT</label>
                    <select
                      value={editFormData.rt}
                      onChange={(e) => setEditFormData({ ...editFormData, rt: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white"
                    >
                      {['01', '02', '03', '04', '05', '06', '07', '08'].map((rtNum) => (
                        <option key={rtNum} value={rtNum}>
                          RT {rtNum}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">No. Rumah / Blok</label>
                    <input
                      type="text"
                      placeholder="Contoh: Blok B2 No. 10"
                      value={editFormData.no_rumah}
                      onChange={(e) => setEditFormData({ ...editFormData, no_rumah: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                </div>
              )}

              <p className="text-[11px] text-slate-400 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                Catatan: Jika Username atau Peran akun diubah, sesi login aktif pengguna terkait akan otomatis dicabut demi keamanan.
              </p>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setUserToEdit(null)}
                  className="min-h-[40px] px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-medium transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={mutationEdit.isPending}
                  className="min-h-[40px] px-4 py-2 bg-slate-900 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{mutationEdit.isPending ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Reset Password */}
      {userToResetPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full border border-slate-200 shadow-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-amber-600" />
                  <span>Reset Kata Sandi</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Akun: <strong className="text-slate-800">@{userToResetPassword.username}</strong> ({userToResetPassword.nama})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setUserToResetPassword(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitResetPassword} className="p-5 space-y-4">
              {resetError && (
                <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{resetError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Kata Sandi Baru *</label>
                <input
                  type="password"
                  required
                  placeholder="Minimal 5 karakter"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Ulangi Kata Sandi Baru *</label>
                <input
                  type="password"
                  required
                  placeholder="Masukkan ulang kata sandi baru"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setUserToResetPassword(null)}
                  className="min-h-[40px] px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-medium transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={mutationResetPassword.isPending}
                  className="min-h-[40px] px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                >
                  <Lock className="w-4 h-4" />
                  <span>{mutationResetPassword.isPending ? 'Menyimpan...' : 'Perbarui Sandi'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
