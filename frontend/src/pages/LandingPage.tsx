import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Megaphone,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import { apiFetch } from '../lib/api';

export const LandingPage: React.FC = () => {
  const { data } = useQuery<{
    data: {
      total_aduan: number;
      selesai: number;
      diproses: number;
      diverifikasi: number;
      diajukan: number;
    };
  }>({
    queryKey: ['statistik-publik'],
    queryFn: () => apiFetch('/api/publik/statistik'),
  });

  const stats = data?.data || {
    total_aduan: 24,
    selesai: 18,
    diproses: 4,
    diverifikasi: 1,
    diajukan: 1,
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-800 text-white flex items-center justify-center shadow-sm">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-base text-slate-900 tracking-tight block">SapaRW 05</span>
              <span className="text-[10px] text-slate-500 font-medium">Desa Karangraharja</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/admin/masuk"
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition hidden sm:inline-block"
            >
              Panel Pengurus
            </Link>
            <Link
              to="/masuk"
              className="text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 px-4 py-2 rounded-xl transition shadow-sm"
            >
              Masuk Warga
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-emerald-50/70 via-white to-slate-50 py-16 px-4 border-b border-slate-200">
        <div className="max-w-4xl mx-auto text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/80 text-emerald-800 text-xs font-semibold border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
            <span>Layanan Resmi Pengaduan Fasilitas RW 05 Desa Karangraharja</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Laporkan Masalah Fasilitas, <br />
            <span className="text-emerald-700">Wujudkan Lingkungan RW Lebih Baik</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Sistem pengaduan terpusat untuk lampu jalan padam, saluran got tersumbat, jalan berlubang, dan fasilitas umum lainnya. Transparan, terdata, dan mudah dipantau bersama.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/masuk"
              className="w-full sm:w-auto px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-sm transition shadow-md flex items-center justify-center gap-2"
            >
              <span>Sampaikan Aduan Sekarang</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/daftar"
              className="w-full sm:w-auto px-6 py-3 bg-white hover:bg-slate-100 text-slate-700 font-bold rounded-xl text-sm transition border border-slate-300 shadow-sm"
            >
              Daftar Akun Warga
            </Link>
          </div>
        </div>
      </section>

      {/* Statistik Publik Transparan */}
      <section className="max-w-4xl mx-auto px-4 -mt-8 w-full z-10">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg grid grid-cols-2 md:grid-cols-4 gap-4 text-center divide-y md:divide-y-0 md:divide-x divide-slate-100">
          <div className="pt-2 md:pt-0">
            <div className="text-3xl font-black text-slate-900">{stats.total_aduan}</div>
            <div className="text-xs font-semibold text-slate-500 mt-1">Total Laporan Masuk</div>
          </div>
          <div className="pt-2 md:pt-0">
            <div className="text-3xl font-black text-amber-600">{stats.diajukan + stats.diverifikasi}</div>
            <div className="text-xs font-semibold text-slate-500 mt-1">Verifikasi & Koordinasi</div>
          </div>
          <div className="pt-2 md:pt-0">
            <div className="text-3xl font-black text-purple-600">{stats.diproses}</div>
            <div className="text-xs font-semibold text-slate-500 mt-1">Sedang Dikerjakan</div>
          </div>
          <div className="pt-2 md:pt-0">
            <div className="text-3xl font-black text-emerald-600">{stats.selesai}</div>
            <div className="text-xs font-semibold text-slate-500 mt-1">Selesai Ditangani</div>
          </div>
        </div>
      </section>

      {/* Alur Kerja Transparan Sesuai Analisis Bab III */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-slate-900">Alur Penyampaian & Tindak Lanjut</h2>
          <p className="text-xs text-slate-500 mt-1">Bagaimana laporan Anda diproses dari awal hingga tuntas</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 text-center space-y-2 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 font-bold flex items-center justify-center mx-auto text-sm">
              1
            </div>
            <h3 className="font-bold text-sm text-slate-900">Kirim Aduan</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Pilih kategori fasilitas, tulis lokasi RT dan uraian kendala beserta foto dokumentasi.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 text-center space-y-2 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 font-bold flex items-center justify-center mx-auto text-sm">
              2
            </div>
            <h3 className="font-bold text-sm text-slate-900">Verifikasi Pengurus</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Pengurus RW memeriksa keabsahan aduan dan menentukan kewenangan penanganan.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 text-center space-y-2 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 font-bold flex items-center justify-center mx-auto text-sm">
              3
            </div>
            <h3 className="font-bold text-sm text-slate-900">Proses Pengerjaan</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Tindakan perbaikan swadaya RW atau koordinasi dengan pihak desa/instansi terkait.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 text-center space-y-2 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center mx-auto text-sm">
              4
            </div>
            <h3 className="font-bold text-sm text-slate-900">Selesai & Tanggapan</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Status diperbarui rampung dan pengurus memberikan laporan tanggapan ke warga pelapor.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-white border-t border-slate-200 py-6 px-4 text-center text-xs text-slate-500">
        <p className="font-semibold text-slate-700">SapaRW 05 Desa Karangraharja</p>
        <p className="mt-0.5">Capstone Project Sistem Informasi Pengaduan Fasilitas Lingkungan Berbasis Web</p>
      </footer>
    </div>
  );
};
