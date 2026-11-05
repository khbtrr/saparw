import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Megaphone,
  UserPlus,
  SearchCheck,
  MapPin,
  Camera,
  ClipboardList,
  Inbox,
  FileSearch,
  Wrench,
  CheckCircle2,
  FileText,
  ShieldCheck,
  Hammer,
  MessageSquare,
  Lightbulb,
  Droplets,
  Construction,
  Shield,
  Trash2,
  Layers,
  Menu,
  X,
  AlertCircle,
  RefreshCw,
  Calendar,
} from 'lucide-react';
import { apiFetch } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import type { KategoriFasilitas, AduanSelesaiPublik } from '../types';

interface StatistikPublik {
  total_aduan: number;
  selesai: number;
  diproses: number;
  diverifikasi: number;
  diajukan: number;
}

function getKategoriIcon(nama: string) {
  const lower = nama.toLowerCase();
  if (lower.includes('lampu') || lower.includes('pju') || lower.includes('penerangan')) {
    return Lightbulb;
  }
  if (lower.includes('got') || lower.includes('drainase') || lower.includes('saluran') || lower.includes('air')) {
    return Droplets;
  }
  if (lower.includes('jalan') || lower.includes('aspal') || lower.includes('paving')) {
    return Construction;
  }
  if (lower.includes('ronda') || lower.includes('kamling') || lower.includes('keamanan')) {
    return Shield;
  }
  if (lower.includes('sampah') || lower.includes('kebersihan')) {
    return Trash2;
  }
  return Layers;
}

function formatTanggalSingkat(dateStr: string | null | undefined): string {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr.replace(' ', 'T'));
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(d);
  } catch {
    return dateStr;
  }
}

const NAV_LINKS = [
  { label: 'Statistik', href: '#statistik' },
  { label: 'Alur Pengaduan', href: '#alur' },
  { label: 'Kategori', href: '#kategori' },
  { label: 'Aduan Tuntas', href: '#aduan-tuntas' },
];

const FOCUS_RING =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';

const Navbar: React.FC = () => {
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close mobile menu when Escape is pressed so keyboard users are not trapped.
  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [menuOpen]);

  const dashboardHref = user?.peran === 'admin' ? '/admin/aduan' : '/warga/aduan';

  return (
    <header className="sticky top-0 z-40 bg-surface/95 backdrop-blur-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 h-16 lg:h-20 flex items-center justify-between gap-4">
        <Link
          to="/"
          className={`flex items-center gap-3 rounded-lg py-1 ${FOCUS_RING}`}
        >
          <div className="w-10 h-10 rounded-lg bg-primary text-white flex items-center justify-center shrink-0">
            <Megaphone className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-sans font-bold text-lg text-slate-900 tracking-tight leading-none">
              SapaRW 05
            </span>
            <span className="font-body text-xs font-medium text-slate-600 mt-1">
              Desa Karangraharja
            </span>
          </div>
        </Link>

        <nav aria-label="Navigasi bagian halaman" className="hidden lg:flex items-center gap-1">
          {NAV_LINKS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`px-3.5 py-2.5 min-h-[44px] inline-flex items-center rounded-lg font-body text-sm font-medium text-slate-700 hover:text-primary hover:bg-primary-soft transition-colors ${FOCUS_RING}`}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden sm:flex items-center gap-2.5">
          {user ? (
            <Link
              to={dashboardHref}
              className={`min-h-[44px] px-4 py-2.5 rounded-lg font-sans text-sm font-semibold bg-primary hover:bg-primary-dark text-white transition-colors inline-flex items-center justify-center ${FOCUS_RING}`}
            >
              <span>Ke Dasbor ({user.peran === 'admin' ? 'Pengurus' : 'Warga'})</span>
            </Link>
          ) : (
            <>
              <Link
                to="/admin/masuk"
                className={`min-h-[44px] px-3.5 py-2.5 rounded-lg font-body text-sm font-medium text-slate-700 bg-canvas hover:bg-slate-100 border border-slate-300 transition-colors inline-flex items-center ${FOCUS_RING}`}
              >
                Panel Pengurus
              </Link>
              <Link
                to="/masuk"
                className={`min-h-[44px] px-4 py-2.5 rounded-lg font-sans text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 transition-colors inline-flex items-center ${FOCUS_RING}`}
              >
                Masuk Warga
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          aria-expanded={menuOpen}
          aria-controls="mobile-nav-panel"
          aria-label={menuOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi'}
          onClick={() => setMenuOpen((prev) => !prev)}
          className={`lg:hidden min-h-[44px] px-3 py-2 rounded-lg border border-slate-300 bg-surface text-slate-800 hover:bg-slate-100 inline-flex items-center gap-2 font-body text-sm font-medium ${FOCUS_RING}`}
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          <span>Menu</span>
        </button>
      </div>

      {menuOpen && (
        <div
          id="mobile-nav-panel"
          className="lg:hidden border-t border-slate-200 bg-surface px-4 py-4 space-y-3 shadow-elev-2"
        >
          <nav aria-label="Navigasi mobile" className="flex flex-col gap-1">
            {NAV_LINKS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={`min-h-[44px] px-3 py-2.5 rounded-lg font-body text-sm font-medium text-slate-800 hover:bg-primary-soft hover:text-primary flex items-center ${FOCUS_RING}`}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="pt-3 border-t border-slate-200 flex flex-col sm:hidden gap-2">
            {user ? (
              <Link
                to={dashboardHref}
                onClick={() => setMenuOpen(false)}
                className={`min-h-[44px] px-4 py-2.5 rounded-lg font-sans text-sm font-semibold bg-primary hover:bg-primary-dark text-white flex items-center justify-center gap-2 ${FOCUS_RING}`}
              >
                <span>Ke Dasbor ({user.peran === 'admin' ? 'Pengurus' : 'Warga'})</span>
              </Link>
            ) : (
              <>
                <Link
                  to="/masuk"
                  onClick={() => setMenuOpen(false)}
                  className={`min-h-[44px] px-4 py-2.5 rounded-lg font-sans text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 flex items-center justify-center ${FOCUS_RING}`}
                >
                  Masuk Warga
                </Link>
                <Link
                  to="/admin/masuk"
                  onClick={() => setMenuOpen(false)}
                  className={`min-h-[44px] px-4 py-2.5 rounded-lg font-body text-sm font-medium text-slate-700 bg-canvas hover:bg-slate-100 border border-slate-300 flex items-center justify-center ${FOCUS_RING}`}
                >
                  Panel Pengurus
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

const HeroSection: React.FC = () => {
  return (
    <section className="w-full bg-gradient-to-b from-primary-soft/60 via-surface to-canvas py-10 lg:py-16 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-7 flex flex-col">
            <h1 className="font-sans text-[28px] leading-[36px] sm:text-4xl lg:text-[44px] lg:leading-[52px] font-extrabold text-slate-900 tracking-[-0.02em]">
              Laporkan Masalah Fasilitas,{' '}
              <span className="text-primary">Wujudkan Lingkungan RW</span> Lebih Baik.
            </h1>

            <p className="font-body text-[15px] leading-6 sm:text-lg sm:leading-7 text-slate-700 mt-4 max-w-2xl">
              Sistem pengaduan terpusat untuk lampu jalan padam, saluran got tersumbat, jalan berlubang, dan fasilitas umum lainnya. Transparan, terdata, dan mudah dipantau bersama di lingkungan RW 05 Desa Karangraharja.
            </p>

            <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 mt-7">
              <Link
                to="/warga/aduan/baru"
                className={`min-h-[48px] px-6 py-3 rounded-lg bg-primary hover:bg-primary-dark text-white font-sans text-base font-semibold transition-colors shadow-elev-1 inline-flex items-center justify-center gap-2 ${FOCUS_RING}`}
              >
                <span>Sampaikan Aduan Sekarang</span>
              </Link>

              <Link
                to="/daftar"
                className={`min-h-[48px] px-5 py-3 rounded-lg bg-surface hover:bg-slate-100 text-slate-900 border border-slate-300 font-sans text-base font-semibold transition-colors inline-flex items-center justify-center gap-2 ${FOCUS_RING}`}
              >
                <UserPlus className="w-4 h-4 text-slate-600 shrink-0" />
                <span>Daftar Akun Warga</span>
              </Link>

              <Link
                to="/warga/aduan"
                className={`min-h-[48px] px-3.5 py-2.5 rounded-lg font-body text-sm font-semibold text-primary hover:bg-primary-soft transition-colors inline-flex items-center justify-center gap-1.5 ${FOCUS_RING}`}
              >
                <SearchCheck className="w-4 h-4 shrink-0" />
                <span>Cek Status Aduan</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-8 p-4 rounded-2xl bg-surface border border-slate-200 shadow-elev-1">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary-soft text-primary flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="font-sans text-sm font-bold text-slate-900 leading-tight">
                    RT 01 s.d. RT 05
                  </p>
                  <p className="font-body text-xs text-slate-600 mt-0.5">
                    Cakupan wilayah RW 05
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-status-verify-bg text-status-verify-text flex items-center justify-center shrink-0">
                  <Camera className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="font-sans text-sm font-bold text-slate-900 leading-tight">
                    Lampiran Foto Bukti
                  </p>
                  <p className="font-body text-xs text-slate-600 mt-0.5">
                    Unggah kondisi langsung
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-status-done-bg text-status-done-text flex items-center justify-center shrink-0">
                  <ClipboardList className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="font-sans text-sm font-bold text-slate-900 leading-tight">
                    Status Terpantau
                  </p>
                  <p className="font-body text-xs text-slate-600 mt-0.5">
                    Riwayat tindak lanjut jelas
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-2xl bg-surface border border-slate-200 shadow-elev-2 p-2.5">
              <div className="w-full h-64 sm:h-80 rounded-xl overflow-hidden bg-slate-100">
                <img
                  src="/images/balai-warga-rw05.jpg"
                  alt="Balai Warga RW 05 Desa Karangraharja dan jalan lingkungan sekitar"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const StatistikSection: React.FC = () => {
  const { data, isLoading, isError, refetch } = useQuery<{ data: StatistikPublik }>({
    queryKey: ['statistik-publik'],
    queryFn: () => apiFetch('/api/publik/statistik'),
  });

  const stats = data?.data;
  const verifikasiCount = stats ? stats.diajukan + stats.diverifikasi : 0;
  const rasioSelesai =
    stats && stats.total_aduan > 0
      ? Math.round((stats.selesai / stats.total_aduan) * 100)
      : 0;

  return (
    <section id="statistik" className="w-full bg-surface py-10 border-b border-slate-200 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-2">
          <div>
            <h2 className="font-sans text-xl font-bold text-slate-900">
              Statistik Penanganan Aduan RW 05
            </h2>
            <p className="font-body text-xs text-slate-600 mt-0.5">
              Rekapitulasi langsung dari basis data pengaduan fasilitas lingkungan
            </p>
          </div>
          <span className="self-start sm:self-auto font-body text-xs font-semibold text-slate-700 bg-canvas border border-slate-200 px-3 py-1 rounded-full">
            Data Real-Time Sistem
          </span>
        </div>

        {isLoading && (
          <div
            role="status"
            aria-live="polite"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4"
          >
            {[1, 2, 3, 4, 5].map((n) => (
              <div
                key={n}
                className="p-4 rounded-2xl border border-slate-200 bg-canvas h-28 animate-pulse flex flex-col justify-between"
              >
                <div className="h-3.5 w-28 bg-slate-200 rounded" />
                <div className="h-8 w-14 bg-slate-200 rounded" />
                <div className="h-3 w-36 bg-slate-200 rounded" />
              </div>
            ))}
            <span className="sr-only">Memuat data statistik pengaduan...</span>
          </div>
        )}

        {isError && (
          <div
            role="alert"
            className="p-5 rounded-2xl border border-status-reject-text/30 bg-status-reject-bg text-status-reject-text flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-sans text-sm font-bold">
                  Gagal memuat statistik pengaduan
                </p>
                <p className="font-body text-xs mt-0.5">
                  Periksa sambungan jaringan Anda lalu muat ulang bagian ini.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => refetch()}
              className={`min-h-[44px] px-4 py-2 rounded-lg bg-surface text-slate-900 border border-slate-300 font-body text-xs font-semibold inline-flex items-center gap-2 hover:bg-slate-100 ${FOCUS_RING}`}
            >
              <RefreshCw className="w-4 h-4" />
              <span>Muat Ulang</span>
            </button>
          </div>
        )}

        {!isLoading && !isError && stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-surface p-4 rounded-2xl border border-slate-200 shadow-elev-1 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="font-body text-sm font-medium text-slate-700">
                  Total Masuk
                </span>
                <span className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                  <Inbox className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="font-sans text-3xl font-extrabold text-slate-900">
                  {stats.total_aduan}
                </span>
                <span className="font-body text-xs text-slate-600">laporan</span>
              </div>
              <span className="font-body text-xs text-slate-600 mt-1">
                Seluruh aduan tercatat
              </span>
            </div>

            <div className="bg-surface p-4 rounded-2xl border border-slate-200 shadow-elev-1 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="font-body text-sm font-medium text-slate-700">
                  Verifikasi
                </span>
                <span className="w-8 h-8 rounded-lg bg-status-verify-bg text-status-verify-text flex items-center justify-center">
                  <FileSearch className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="font-sans text-3xl font-extrabold text-slate-900">
                  {verifikasiCount}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-status-pending-bg text-status-pending-text font-body text-xs font-semibold">
                  Diajukan &amp; Cek
                </span>
              </div>
              <span className="font-body text-xs text-slate-600 mt-1">
                Menunggu &amp; terverifikasi RW
              </span>
            </div>

            <div className="bg-surface p-4 rounded-2xl border border-slate-200 shadow-elev-1 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="font-body text-sm font-medium text-slate-700">
                  Sedang Dikerjakan
                </span>
                <span className="w-8 h-8 rounded-lg bg-status-process-bg text-status-process-text flex items-center justify-center">
                  <Wrench className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="font-sans text-3xl font-extrabold text-slate-900">
                  {stats.diproses}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-status-process-bg text-status-process-text font-body text-xs font-semibold">
                  Diproses
                </span>
              </div>
              <span className="font-body text-xs text-slate-600 mt-1">
                Penanganan swadaya / desa
              </span>
            </div>

            <div className="bg-surface p-4 rounded-2xl border border-slate-200 shadow-elev-1 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="font-body text-sm font-medium text-slate-700">
                  Selesai Ditangani
                </span>
                <span className="w-8 h-8 rounded-lg bg-status-done-bg text-status-done-text flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="font-sans text-3xl font-extrabold text-primary">
                  {stats.selesai}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-status-done-bg text-status-done-text font-body text-xs font-semibold">
                  Selesai
                </span>
              </div>
              <span className="font-body text-xs text-slate-600 mt-1">
                Perbaikan telah tuntas
              </span>
            </div>

            <div className="bg-primary p-4 rounded-2xl text-white shadow-elev-1 flex flex-col justify-between sm:col-span-2 lg:col-span-1">
              <div className="flex items-center justify-between">
                <span className="font-body text-sm font-semibold text-white">
                  Tingkat Penyelesaian
                </span>
                <span className="w-8 h-8 rounded-lg bg-white/15 text-white flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="font-sans text-3xl font-extrabold leading-none">
                  {stats.total_aduan > 0 ? `${rasioSelesai}%` : '-'}
                </span>
                <span className="font-body text-xs text-primary-soft">
                  ({stats.selesai} dari {stats.total_aduan})
                </span>
              </div>
              <span className="font-body text-xs text-primary-soft mt-1">
                Proporsi aduan berstatus Selesai
              </span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

const ALUR_STEPS = [
  {
    nomor: 'Tahap 01',
    statusLabel: 'Diajukan',
    statusClass: 'bg-status-pending-bg text-status-pending-text',
    iconBg: 'bg-primary text-white',
    Icon: FileText,
    judul: '1. Kirim Aduan',
    deskripsi:
      'Warga memilih kategori fasilitas umum, mengisi lokasi di lingkungan RT, menulis uraian masalah, dan melampirkan foto kondisi lapangan.',
    catatanBawah: 'Dilengkapi lampiran foto bukti',
  },
  {
    nomor: 'Tahap 02',
    statusLabel: 'Diverifikasi',
    statusClass: 'bg-status-verify-bg text-status-verify-text',
    iconBg: 'bg-status-verify-bg text-status-verify-text',
    Icon: ShieldCheck,
    judul: '2. Verifikasi Pengurus',
    deskripsi:
      'Pengurus RW memeriksa kelengkapan laporan dan menentukan apakah perbaikan ditangani secara swadaya RW atau diteruskan ke pemerintah desa.',
    catatanBawah: 'Dicatat bersama keterangan pengurus',
  },
  {
    nomor: 'Tahap 03',
    statusLabel: 'Diproses',
    statusClass: 'bg-status-process-bg text-status-process-text',
    iconBg: 'bg-status-process-bg text-status-process-text',
    Icon: Hammer,
    judul: '3. Proses Pengerjaan',
    deskripsi:
      'Pengerjaan perbaikan dilakukan oleh warga/pengurus RW atau dikoordinasikan bersama pihak desa maupun instansi terkait.',
    catatanBawah: 'Perkembangan tercatat di riwayat status',
  },
  {
    nomor: 'Tahap 04',
    statusLabel: 'Selesai',
    statusClass: 'bg-status-done-bg text-status-done-text',
    iconBg: 'bg-status-done-bg text-status-done-text',
    Icon: MessageSquare,
    judul: '4. Selesai & Tanggapan',
    deskripsi:
      'Setelah perbaikan rampung, pengurus memperbarui status menjadi Selesai dan mengirimkan tanggapan resmi kepada warga pelapor.',
    catatanBawah: 'Tanggapan pengurus tampil di akun warga',
  },
];

const AlurSection: React.FC = () => {
  return (
    <section id="alur" className="w-full py-14 lg:py-16 bg-canvas border-b border-slate-200 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="max-w-2xl mx-auto text-center mb-10">
          <span className="inline-block font-body text-xs font-semibold text-primary bg-primary-soft px-3 py-1 rounded-full">
            Tahapan Penanganan Resmi
          </span>
          <h2 className="font-sans text-2xl lg:text-[32px] lg:leading-[40px] font-bold text-slate-900 tracking-[-0.02em] mt-2">
            Alur Penyampaian &amp; Tindak Lanjut
          </h2>
          <p className="font-body text-[15px] leading-6 text-slate-700 mt-2">
            Empat tahapan status yang dilalui setiap laporan warga hingga perbaikan fasilitas selesai ditangani.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {ALUR_STEPS.map((step) => {
            const IconComponent = step.Icon;
            return (
              <div
                key={step.nomor}
                className="bg-surface p-6 rounded-2xl border border-slate-200 shadow-elev-1 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center ${step.iconBg}`}
                    >
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <span
                      className={`font-body text-xs font-semibold px-2.5 py-1 rounded-full ${step.statusClass}`}
                    >
                      {step.statusLabel}
                    </span>
                  </div>
                  <h3 className="font-sans text-base font-bold text-slate-900">
                    {step.judul}
                  </h3>
                  <p className="font-body text-[13px] leading-5 text-slate-700 mt-2">
                    {step.deskripsi}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-body text-slate-600">
                  <span className="font-medium text-slate-700">{step.catatanBawah}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 bg-surface border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3">
            <span className="px-2.5 py-1 rounded-full bg-status-reject-bg text-status-reject-text font-body text-xs font-semibold shrink-0">
              Ditolak
            </span>
            <p className="font-body text-xs sm:text-sm text-slate-700">
              Apabila laporan bukan termasuk fasilitas umum lingkungan RW 05, pengurus akan mengubah status menjadi Ditolak disertai alasan penolakan yang dapat dibaca oleh pelapor.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

const KategoriSection: React.FC = () => {
  const { data, isLoading, isError, refetch } = useQuery<{ data: KategoriFasilitas[] }>({
    queryKey: ['kategori-publik'],
    queryFn: () => apiFetch('/api/kategori'),
  });

  const categories = data?.data || [];

  return (
    <section id="kategori" className="w-full py-14 lg:py-16 bg-surface border-b border-slate-200 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <span className="inline-block font-body text-xs font-semibold text-primary bg-primary-soft px-3 py-1 rounded-full">
              Cakupan Fasilitas Lingkungan
            </span>
            <h2 className="font-sans text-2xl lg:text-[32px] lg:leading-[40px] font-bold text-slate-900 tracking-[-0.02em] mt-2">
              Kategori Fasilitas yang Dilayani
            </h2>
          </div>
          <p className="font-body text-sm text-slate-700 max-w-md">
            Pilih kategori yang sesuai saat mengisi formulir pengaduan agar pengurus RW dapat segera menindaklanjuti.
          </p>
        </div>

        {isLoading && (
          <div
            role="status"
            aria-live="polite"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4"
          >
            {[1, 2, 3, 4, 5].map((n) => (
              <div
                key={n}
                className="p-5 rounded-2xl border border-slate-200 bg-canvas h-44 animate-pulse flex flex-col justify-between"
              >
                <div className="w-11 h-11 rounded-xl bg-slate-200" />
                <div className="space-y-2">
                  <div className="h-4 w-28 bg-slate-200 rounded" />
                  <div className="h-3 w-full bg-slate-200 rounded" />
                </div>
              </div>
            ))}
            <span className="sr-only">Memuat daftar kategori fasilitas...</span>
          </div>
        )}

        {isError && (
          <div
            role="alert"
            className="p-5 rounded-2xl border border-status-reject-text/30 bg-status-reject-bg text-status-reject-text flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-sans text-sm font-bold">
                  Gagal memuat daftar kategori fasilitas
                </p>
                <p className="font-body text-xs mt-0.5">
                  Silakan coba muat ulang untuk melihat kategori yang aktif.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => refetch()}
              className={`min-h-[44px] px-4 py-2 rounded-lg bg-surface text-slate-900 border border-slate-300 font-body text-xs font-semibold inline-flex items-center gap-2 hover:bg-slate-100 ${FOCUS_RING}`}
            >
              <RefreshCw className="w-4 h-4" />
              <span>Muat Ulang</span>
            </button>
          </div>
        )}

        {!isLoading && !isError && categories.length === 0 && (
          <div className="p-8 rounded-2xl border border-slate-200 bg-canvas text-center">
            <p className="font-sans text-base font-bold text-slate-900">
              Belum ada kategori fasilitas yang aktif
            </p>
            <p className="font-body text-sm text-slate-600 mt-1">
              Pengurus RW sedang menyiapkan kategori fasilitas umum yang dapat dilaporkan.
            </p>
          </div>
        )}

        {!isLoading && !isError && categories.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {categories.map((kat) => {
              const IconComponent = getKategoriIcon(kat.nama_kategori);
              return (
                <div
                  key={kat.id_kategori}
                  className="bg-surface p-5 rounded-2xl border border-slate-200 shadow-elev-1 hover:shadow-elev-2 transition-shadow flex flex-col justify-between"
                >
                  <div>
                    <div className="w-11 h-11 rounded-xl bg-primary-soft text-primary flex items-center justify-center mb-4">
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <h3 className="font-sans text-base font-bold text-slate-900">
                      {kat.nama_kategori}
                    </h3>
                    <p className="font-body text-[13px] leading-5 text-slate-700 mt-1.5">
                      {kat.deskripsi || 'Fasilitas lingkungan warga RW 05.'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

const AduanTuntasSection: React.FC = () => {
  const { data, isLoading, isError, refetch } = useQuery<{ data: AduanSelesaiPublik[] }>({
    queryKey: ['aduan-selesai-publik'],
    queryFn: () => apiFetch('/api/publik/aduan-selesai'),
  });

  const list = data?.data || [];

  return (
    <section id="aduan-tuntas" className="w-full py-14 lg:py-16 bg-canvas border-b border-slate-200 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-3">
          <div>
            <span className="inline-block font-body text-xs font-semibold text-primary bg-primary-soft px-3 py-1 rounded-full">
              Transparansi Tindak Lanjut
            </span>
            <h2 className="font-sans text-2xl lg:text-[32px] lg:leading-[40px] font-bold text-slate-900 tracking-[-0.02em] mt-2">
              Aduan Warga yang Telah Selesai
            </h2>
          </div>
          <p className="font-body text-xs sm:text-sm text-slate-700 max-w-md">
            Daftar laporan fasilitas terbaru yang telah rampung ditangani pengurus RW 05. Identitas pelapor tidak ditampilkan.
          </p>
        </div>

        {isLoading && (
          <div
            role="status"
            aria-live="polite"
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="bg-surface rounded-2xl border border-slate-200 overflow-hidden shadow-elev-1 animate-pulse"
              >
                <div className="h-44 bg-slate-200" />
                <div className="p-5 space-y-3">
                  <div className="h-4 w-3/4 bg-slate-200 rounded" />
                  <div className="h-3 w-full bg-slate-200 rounded" />
                  <div className="h-8 w-full bg-slate-100 rounded" />
                </div>
              </div>
            ))}
            <span className="sr-only">Memuat daftar aduan yang telah selesai...</span>
          </div>
        )}

        {isError && (
          <div
            role="alert"
            className="p-5 rounded-2xl border border-status-reject-text/30 bg-status-reject-bg text-status-reject-text flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-sans text-sm font-bold">
                  Gagal memuat daftar aduan selesai
                </p>
                <p className="font-body text-xs mt-0.5">
                  Silakan muat ulang untuk menampilkan riwayat aduan yang telah dituntaskan.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => refetch()}
              className={`min-h-[44px] px-4 py-2 rounded-lg bg-surface text-slate-900 border border-slate-300 font-body text-xs font-semibold inline-flex items-center gap-2 hover:bg-slate-100 ${FOCUS_RING}`}
            >
              <RefreshCw className="w-4 h-4" />
              <span>Muat Ulang</span>
            </button>
          </div>
        )}

        {!isLoading && !isError && list.length === 0 && (
          <div className="p-8 rounded-2xl border border-slate-200 bg-surface text-center max-w-xl mx-auto">
            <p className="font-sans text-base font-bold text-slate-900">
              Belum ada aduan berstatus Selesai
            </p>
            <p className="font-body text-sm text-slate-600 mt-1">
              Laporan yang telah rampung ditangani pengurus RW akan ditampilkan di bagian ini.
            </p>
            <Link
              to="/warga/aduan/baru"
              className={`mt-4 min-h-[44px] px-5 py-2.5 rounded-lg bg-primary hover:bg-primary-dark text-white font-sans text-sm font-semibold inline-flex items-center justify-center ${FOCUS_RING}`}
            >
              <span>Kirim Aduan Pertama</span>
            </Link>
          </div>
        )}

        {!isLoading && !isError && list.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {list.map((item) => {
              const KategoriIcon = getKategoriIcon(item.nama_kategori);
              return (
                <article
                  key={item.id_pengaduan}
                  className="bg-surface rounded-2xl border border-slate-200 overflow-hidden shadow-elev-1 flex flex-col"
                >
                  <div className="relative h-48 w-full bg-slate-100 border-b border-slate-200">
                    {item.foto_url ? (
                      <>
                        <img
                          src={item.foto_url}
                          alt={`Foto laporan: ${item.judul}`}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        <span className="absolute bottom-2.5 left-2.5 bg-slate-900/85 text-white px-2.5 py-1 rounded-md font-body text-[11px] font-medium">
                          Foto saat dilaporkan
                        </span>
                      </>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 p-4 text-center">
                        <div className="w-12 h-12 rounded-xl bg-primary-soft text-primary flex items-center justify-center mb-2">
                          <KategoriIcon className="w-6 h-6" />
                        </div>
                        <span className="font-body text-xs font-medium text-slate-600">
                          Kategori: {item.nama_kategori}
                        </span>
                      </div>
                    )}

                    {item.rt && (
                      <span className="absolute top-3 left-3 bg-surface text-slate-900 border border-slate-200 px-2.5 py-1 rounded-full font-body text-xs font-bold shadow-elev-1">
                        RT {item.rt} / RW 05
                      </span>
                    )}

                    <span className="absolute top-3 right-3 bg-status-done-bg text-status-done-text px-3 py-1 rounded-full font-body text-xs font-bold">
                      Selesai
                    </span>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-slate-600 font-body text-xs mb-2">
                        <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span>Selesai pada {formatTanggalSingkat(item.diperbarui_pada)}</span>
                        <span>•</span>
                        <span className="font-medium text-slate-700">{item.nama_kategori}</span>
                      </div>

                      <h3 className="font-sans text-base font-bold text-slate-900">
                        {item.judul}
                      </h3>

                      {item.tanggapan_terakhir && (
                        <div className="mt-3 p-3 rounded-xl bg-canvas border border-slate-200">
                          <p className="font-body text-[11px] font-semibold text-slate-700">
                            Tanggapan Pengurus RW:
                          </p>
                          <p className="font-body text-xs text-slate-700 mt-0.5 line-clamp-2">
                            {item.tanggapan_terakhir}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between font-body text-xs text-slate-600">
                      <span className="font-medium text-slate-800">
                        Tiket: {item.nomor_pengaduan}
                      </span>
                      <span className="text-primary font-semibold inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Tuntas</span>
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

const CtaSection: React.FC = () => {
  return (
    <section className="w-full py-14 lg:py-16 bg-surface">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="bg-primary rounded-2xl p-6 sm:p-10 lg:p-12 text-white shadow-elev-2">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7">
              <span className="inline-block bg-status-done-bg text-status-done-text font-body text-xs font-bold px-3 py-1 rounded-full mb-3">
                Layanan Pengaduan Warga RW 05
              </span>
              <h2 className="font-sans text-2xl sm:text-3xl lg:text-[32px] lg:leading-[40px] font-extrabold tracking-[-0.02em]">
                Ada fasilitas rusak di RT Anda? Laporkan sekarang.
              </h2>
              <p className="font-body text-[15px] leading-6 text-primary-soft mt-3 max-w-xl">
                Sampaikan lokasi dan kondisi kerusakan fasilitas melalui akun warga. Pengurus RW 05 akan memverifikasi dan mencatat setiap tahap tindak lanjutnya.
              </p>

              <div className="flex flex-wrap items-center gap-3 mt-6">
                <Link
                  to="/warga/aduan/baru"
                  className="min-h-[48px] bg-surface text-primary hover:bg-primary-soft font-sans text-base font-bold px-6 py-3 rounded-lg transition-colors shadow-elev-1 inline-flex items-center justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  <span>Buat Pengaduan Baru</span>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 bg-surface text-slate-900 p-6 rounded-2xl border border-slate-200 shadow-elev-2">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-lg bg-primary-soft text-primary flex items-center justify-center shrink-0">
                  <SearchCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-sans text-base font-bold text-slate-900">
                    Sudah Pernah Melapor?
                  </h3>
                  <p className="font-body text-xs text-slate-600">
                    Pantau status dan baca tanggapan pengurus RW
                  </p>
                </div>
              </div>

              <p className="font-body text-[13px] leading-5 text-slate-700 mt-4">
                Demi menjaga privasi pelapor, rincian aduan dan riwayat penanganan hanya ditampilkan kepada warga yang mengajukan laporan tersebut.
              </p>

              <div className="mt-5 flex flex-col gap-2.5">
                <Link
                  to="/warga/aduan"
                  className={`w-full min-h-[44px] bg-primary hover:bg-primary-dark text-white font-sans text-sm font-semibold py-2.5 px-4 rounded-lg transition-colors inline-flex items-center justify-center ${FOCUS_RING}`}
                >
                  <span>Lihat Daftar Aduan Saya</span>
                </Link>
                <Link
                  to="/daftar"
                  className={`w-full min-h-[44px] bg-canvas hover:bg-slate-100 text-slate-800 border border-slate-300 font-body text-xs font-semibold py-2.5 px-4 rounded-lg transition-colors inline-flex items-center justify-center ${FOCUS_RING}`}
                >
                  Belum punya akun? Daftar Akun Warga
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Footer: React.FC = () => {
  const tahun = new Date().getFullYear();

  return (
    <footer className="mt-auto w-full bg-canvas border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div>
          <p className="font-sans text-sm font-bold text-primary">
            SapaRW 05, Desa Karangraharja
          </p>
          <p className="font-body text-xs text-slate-600 mt-1">
            Sistem Informasi Pengaduan Fasilitas Lingkungan RW 05 Berbasis Web.
          </p>
        </div>
        <p className="font-body text-xs text-slate-600">
          Capstone Project © {tahun} SapaRW 05
        </p>
      </div>
    </footer>
  );
};

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-canvas text-slate-900 flex flex-col font-body">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <StatistikSection />
        <AlurSection />
        <KategoriSection />
        <AduanTuntasSection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
};
