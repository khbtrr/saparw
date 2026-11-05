export type PeranPengguna = 'warga' | 'admin';

export type StatusAduan = 'Diajukan' | 'Diverifikasi' | 'Diproses' | 'Selesai' | 'Ditolak';

export interface Pengguna {
  id_pengguna: number;
  nama: string;
  username: string;
  peran: PeranPengguna;
  aktif: boolean;
  rt?: string | null;
  no_rumah?: string | null;
  no_hp?: string | null;
  dibuat_pada: string;
}

export interface KategoriFasilitas {
  id_kategori: number;
  nama_kategori: string;
  deskripsi: string | null;
  aktif: boolean;
}

export interface LampiranFoto {
  id_lampiran: number;
  id_pengaduan: number;
  path_foto: string;
  keterangan: string | null;
  diunggah_pada: string;
}

export interface Tanggapan {
  id_tanggapan: number;
  id_pengaduan: number;
  id_pengurus: number;
  isi_tanggapan: string;
  ditanggapi_pada: string;
  nama_pengurus?: string;
}

export interface RiwayatStatus {
  id_riwayat: number;
  id_pengaduan: number;
  id_pencatat: number;
  status_sebelumnya: StatusAduan | null;
  status_baru: StatusAduan;
  catatan: string | null;
  dicatat_pada: string;
  nama_pencatat?: string;
}

export interface Pengaduan {
  id_pengaduan: number;
  nomor_pengaduan: string;
  id_pelapor: number;
  id_kategori: number;
  judul: string;
  isi_pengaduan: string;
  lokasi: string;
  status_terkini: StatusAduan;
  diteruskan_kepada?: string | null;
  diajukan_pada: string;
  diperbarui_pada: string;
  dilihat_pelapor_pada?: string | null;
  
  // Relations / joined properties
  kategori?: KategoriFasilitas;
  pelapor?: Pengguna;
  lampiran_foto?: LampiranFoto[];
  tanggapan?: Tanggapan[];
  riwayat_status?: RiwayatStatus[];
  ada_pembaruan?: boolean;
}

export interface RingkasanAduan {
  total: number;
  diajukan: number;
  diverifikasi: number;
  diproses: number;
  selesai: number;
  ditolak: number;
}

export interface AduanSelesaiPublik {
  id_pengaduan: number;
  nomor_pengaduan: string;
  judul: string;
  nama_kategori: string;
  rt: string | null;
  diperbarui_pada: string;
  foto_url: string | null;
  tanggapan_terakhir: string | null;
}
