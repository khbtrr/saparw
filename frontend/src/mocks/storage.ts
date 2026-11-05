import type { Pengguna, KategoriFasilitas, Pengaduan } from '../types';
import { INITIAL_PENGGUNA, INITIAL_KATEGORI, INITIAL_PENGADUAN } from './seed';

const STORAGE_KEYS = {
  PENGGUNA: 'saparw_db_pengguna',
  KATEGORI: 'saparw_db_kategori',
  PENGADUAN: 'saparw_db_pengaduan',
  SESSION: 'saparw_session_user',
};

export const db = {
  getPengguna(): Pengguna[] {
    const raw = localStorage.getItem(STORAGE_KEYS.PENGGUNA);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PENGGUNA, JSON.stringify(INITIAL_PENGGUNA));
      return INITIAL_PENGGUNA;
    }
    return JSON.parse(raw);
  },

  savePengguna(data: Pengguna[]) {
    localStorage.setItem(STORAGE_KEYS.PENGGUNA, JSON.stringify(data));
  },

  getKategori(): KategoriFasilitas[] {
    const raw = localStorage.getItem(STORAGE_KEYS.KATEGORI);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.KATEGORI, JSON.stringify(INITIAL_KATEGORI));
      return INITIAL_KATEGORI;
    }
    return JSON.parse(raw);
  },

  saveKategori(data: KategoriFasilitas[]) {
    localStorage.setItem(STORAGE_KEYS.KATEGORI, JSON.stringify(data));
  },

  getPengaduan(): Pengaduan[] {
    const raw = localStorage.getItem(STORAGE_KEYS.PENGADUAN);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PENGADUAN, JSON.stringify(INITIAL_PENGADUAN));
      return INITIAL_PENGADUAN;
    }
    return JSON.parse(raw);
  },

  savePengaduan(data: Pengaduan[]) {
    localStorage.setItem(STORAGE_KEYS.PENGADUAN, JSON.stringify(data));
  },

  getSession(): Pengguna | null {
    const raw = localStorage.getItem(STORAGE_KEYS.SESSION);
    return raw ? JSON.parse(raw) : null;
  },

  setSession(user: Pengguna | null) {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.SESSION);
    }
  },

  resetAll() {
    localStorage.setItem(STORAGE_KEYS.PENGGUNA, JSON.stringify(INITIAL_PENGGUNA));
    localStorage.setItem(STORAGE_KEYS.KATEGORI, JSON.stringify(INITIAL_KATEGORI));
    localStorage.setItem(STORAGE_KEYS.PENGADUAN, JSON.stringify(INITIAL_PENGADUAN));
  }
};
