import { http, HttpResponse, delay } from 'msw';
import { db } from './storage';
import type { Pengaduan, Pengguna, KategoriFasilitas, RiwayatStatus, Tanggapan } from '../types';

export const handlers = [
  http.post('/api/auth/login', async ({ request }) => {
    await delay(300);
    const body = (await request.json()) as { username?: string; password?: string; peran_target?: string };
    const users = db.getPengguna();
    const user = users.find((u) => u.username.toLowerCase() === body.username?.trim().toLowerCase());

    if (!user) {
      return HttpResponse.json({ message: 'Username atau kata sandi salah.' }, { status: 401 });
    }

    if (body.peran_target && user.peran !== body.peran_target) {
      return HttpResponse.json(
        { message: `Akun ini tidak memiliki hak akses sebagai ${body.peran_target}.` },
        { status: 403 }
      );
    }

    if (!user.aktif) {
      return HttpResponse.json(
        { message: 'Akun Anda belum aktif. Silakan tunggu verifikasi/aktivasi dari Pengurus RW 05.' },
        { status: 403 }
      );
    }

    db.setSession(user);
    return HttpResponse.json({
      message: 'Login berhasil.',
      data: {
        user,
        token: `mock_token_${user.id_pengguna}_${Date.now()}`,
      },
    });
  }),

  http.post('/api/auth/register', async ({ request }) => {
    await delay(400);
    const body = (await request.json()) as {
      nama?: string;
      username?: string;
      password?: string;
      rt?: string;
      no_rumah?: string;
      no_hp?: string;
    };

    if (!body.nama || !body.username || !body.password) {
      return HttpResponse.json(
        { message: 'Data tidak lengkap.', errors: { nama: ['Nama, username, dan password wajib diisi.'] } },
        { status: 422 }
      );
    }

    const users = db.getPengguna();
    if (users.some((u) => u.username.toLowerCase() === body.username?.trim().toLowerCase())) {
      return HttpResponse.json(
        { message: 'Validasi gagal.', errors: { username: ['Username sudah digunakan warga lain.'] } },
        { status: 422 }
      );
    }

    const newUser: Pengguna = {
      id_pengguna: Date.now(),
      nama: body.nama.trim(),
      username: body.username.trim(),
      peran: 'warga',
      // Accounts require manual activation by RW administrators before login.
      aktif: false,
      rt: body.rt?.trim() || null,
      no_rumah: body.no_rumah?.trim() || null,
      no_hp: body.no_hp?.trim() || null,
      dibuat_pada: new Date().toISOString().replace('T', ' ').slice(0, 19),
    };

    users.push(newUser);
    db.savePengguna(users);

    return HttpResponse.json(
      {
        message: 'Pendaftaran berhasil! Akun Anda sedang menunggu verifikasi/aktivasi oleh Pengurus RW 05.',
        data: newUser,
      },
      { status: 201 }
    );
  }),

  http.get('/api/auth/me', async () => {
    const session = db.getSession();
    if (!session) {
      return HttpResponse.json({ message: 'Belum login.' }, { status: 401 });
    }
    const users = db.getPengguna();
    const current = users.find((u) => u.id_pengguna === session.id_pengguna);
    if (!current || !current.aktif) {
      db.setSession(null);
      return HttpResponse.json({ message: 'Sesi berakhir atau akun dinonaktifkan.' }, { status: 401 });
    }
    return HttpResponse.json({ data: current });
  }),

  http.post('/api/auth/logout', async () => {
    db.setSession(null);
    return HttpResponse.json({ message: 'Berhasil keluar.' });
  }),

  http.put('/api/auth/profil', async ({ request }) => {
    await delay(300);
    const session = db.getSession();
    if (!session) return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const body = (await request.json()) as { nama?: string; no_hp?: string; no_rumah?: string; rt?: string };
    const users = db.getPengguna();
    const idx = users.findIndex((u) => u.id_pengguna === session.id_pengguna);
    if (idx === -1) return HttpResponse.json({ message: 'User tidak ditemukan' }, { status: 404 });

    users[idx] = {
      ...users[idx],
      nama: body.nama ? body.nama.trim() : users[idx].nama,
      no_hp: body.no_hp !== undefined ? body.no_hp : users[idx].no_hp,
      no_rumah: body.no_rumah !== undefined ? body.no_rumah : users[idx].no_rumah,
      rt: body.rt !== undefined ? body.rt : users[idx].rt,
    };

    db.savePengguna(users);
    db.setSession(users[idx]);
    return HttpResponse.json({ message: 'Profil berhasil diperbarui.', data: users[idx] });
  }),

  http.put('/api/auth/password', async ({ request }) => {
    await delay(300);
    const session = db.getSession();
    if (!session) return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const body = (await request.json()) as { password_baru?: string };
    if (!body.password_baru || body.password_baru.length < 5) {
      return HttpResponse.json(
        { message: 'Validasi gagal.', errors: { password_baru: ['Password minimal 5 karakter.'] } },
        { status: 422 }
      );
    }
    return HttpResponse.json({ message: 'Kata sandi berhasil diubah.' });
  }),

  http.get('/api/publik/statistik', async () => {
    const list = db.getPengaduan();
    const data = {
      total_aduan: list.length,
      selesai: list.filter((a) => a.status_terkini === 'Selesai').length,
      diproses: list.filter((a) => a.status_terkini === 'Diproses').length,
      diverifikasi: list.filter((a) => a.status_terkini === 'Diverifikasi').length,
      diajukan: list.filter((a) => a.status_terkini === 'Diajukan').length,
    };
    return HttpResponse.json({ data });
  }),

  http.get('/api/publik/aduan-selesai', async () => {
    // Strip reporter identity and house number for public privacy.
    const kategoriMap = new Map(db.getKategori().map((k) => [k.id_kategori, k.nama_kategori]));
    const penggunaMap = new Map(db.getPengguna().map((u) => [u.id_pengguna, u.rt ?? null]));
    const selesai = db
      .getPengaduan()
      .filter((a) => a.status_terkini === 'Selesai')
      .sort((a, b) => new Date(b.diperbarui_pada).getTime() - new Date(a.diperbarui_pada).getTime())
      .slice(0, 3)
      .map((a) => {
        const foto = a.lampiran_foto && a.lampiran_foto.length > 0 ? a.lampiran_foto[0].path_foto : null;
        const tanggapanList = a.tanggapan || [];
        const tanggapanTerakhir = tanggapanList.length > 0 ? tanggapanList[tanggapanList.length - 1].isi_tanggapan : null;
        return {
          id_pengaduan: a.id_pengaduan,
          nomor_pengaduan: a.nomor_pengaduan,
          judul: a.judul,
          nama_kategori: kategoriMap.get(a.id_kategori) || 'Umum',
          rt: penggunaMap.get(a.id_pelapor) || null,
          diperbarui_pada: a.diperbarui_pada,
          foto_url: foto,
          tanggapan_terakhir: tanggapanTerakhir,
        };
      });
    return HttpResponse.json({ data: selesai });
  }),

  http.get('/api/kategori', async () => {
    const categories = db.getKategori().filter((c) => c.aktif);
    return HttpResponse.json({ data: categories });
  }),

  http.get('/api/aduan', async ({ request }) => {
    await delay(200);
    const session = db.getSession();
    if (!session || session.peran !== 'warga') {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const status = url.searchParams.get('status');

    let list = db.getPengaduan().filter((a) => a.id_pelapor === session.id_pengguna);
    if (status && status !== 'Semua') {
      list = list.filter((a) => a.status_terkini === status);
    }

    const kategoriMap = new Map(db.getKategori().map((k) => [k.id_kategori, k]));

    const enriched = list
      .map((a) => ({
        ...a,
        kategori: kategoriMap.get(a.id_kategori),
        ada_pembaruan: a.dilihat_pelapor_pada ? a.diperbarui_pada > a.dilihat_pelapor_pada : false,
      }))
      .sort((a, b) => new Date(b.diajukan_pada).getTime() - new Date(a.diajukan_pada).getTime());

    return HttpResponse.json({ data: enriched });
  }),

  http.get('/api/aduan/:id', async ({ params }) => {
    await delay(200);
    const session = db.getSession();
    if (!session) return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const id = Number(params.id);
    const list = db.getPengaduan();
    const item = list.find((a) => a.id_pengaduan === id);

    if (!item) return HttpResponse.json({ message: 'Aduan tidak ditemukan.' }, { status: 404 });

    if (session.peran === 'warga' && item.id_pelapor !== session.id_pengguna) {
      return HttpResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    if (session.peran === 'warga') {
      item.dilihat_pelapor_pada = new Date().toISOString().replace('T', ' ').slice(0, 19);
      db.savePengaduan(list);
    }

    const kategori = db.getKategori().find((k) => k.id_kategori === item.id_kategori);
    const pelapor = db.getPengguna().find((u) => u.id_pengguna === item.id_pelapor);

    return HttpResponse.json({
      data: {
        ...item,
        kategori,
        pelapor,
      },
    });
  }),

  http.post('/api/aduan', async ({ request }) => {
    await delay(400);
    const session = db.getSession();
    if (!session || session.peran !== 'warga') {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = (await request.json()) as {
      id_kategori: number;
      lokasi: string;
      isi_pengaduan: string;
      fotos?: string[];
    };

    if (!body.id_kategori || !body.lokasi?.trim() || !body.isi_pengaduan?.trim()) {
      return HttpResponse.json(
        {
          message: 'Validasi gagal.',
          errors: {
            id_kategori: !body.id_kategori ? ['Pilih kategori fasilitas.'] : [],
            lokasi: !body.lokasi?.trim() ? ['Lokasi/RT wajib diisi.'] : [],
            isi_pengaduan: !body.isi_pengaduan?.trim() ? ['Uraian aduan wajib diisi.'] : [],
          },
        },
        { status: 422 }
      );
    }

    const list = db.getPengaduan();
    const kategori = db.getKategori().find((k) => k.id_kategori === Number(body.id_kategori));
    const namaKat = kategori?.nama_kategori || 'Fasilitas';

    const year = new Date().getFullYear();
    const seq = list.length + 1;
    const nomor = `ADU-${year}-${String(seq).padStart(3, '0')}`;

    const uraianClean = body.isi_pengaduan.trim().replace(/\r?\n/g, ' ');
    const judul = `${namaKat}: ${uraianClean.slice(0, 40)}${uraianClean.length > 40 ? '...' : ''}`;

    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const newId = Date.now();

    const lampiran = (body.fotos || []).map((fotoUrl, idx) => ({
      id_lampiran: Date.now() + idx,
      id_pengaduan: newId,
      path_foto: fotoUrl,
      keterangan: `Foto ${idx + 1}`,
      diunggah_pada: now,
    }));

    const riwayatAwal: RiwayatStatus = {
      id_riwayat: Date.now(),
      id_pengaduan: newId,
      id_pencatat: session.id_pengguna,
      status_sebelumnya: null,
      status_baru: 'Diajukan',
      catatan: 'Aduan berhasil dikirim oleh pelapor.',
      dicatat_pada: now,
      nama_pencatat: session.nama,
    };

    const newAduan: Pengaduan = {
      id_pengaduan: newId,
      nomor_pengaduan: nomor,
      id_pelapor: session.id_pengguna,
      id_kategori: Number(body.id_kategori),
      judul,
      isi_pengaduan: body.isi_pengaduan.trim(),
      lokasi: body.lokasi.trim(),
      status_terkini: 'Diajukan',
      diteruskan_kepada: null,
      diajukan_pada: now,
      diperbarui_pada: now,
      dilihat_pelapor_pada: now,
      lampiran_foto: lampiran,
      riwayat_status: [riwayatAwal],
      tanggapan: [],
    };

    list.unshift(newAduan);
    db.savePengaduan(list);

    return HttpResponse.json(
      {
        message: 'Pengaduan berhasil diajukan.',
        data: newAduan,
      },
      { status: 201 }
    );
  }),

  http.delete('/api/aduan/:id', async ({ params }) => {
    await delay(300);
    const session = db.getSession();
    if (!session) return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const id = Number(params.id);
    let list = db.getPengaduan();
    const item = list.find((a) => a.id_pengaduan === id);

    if (!item) return HttpResponse.json({ message: 'Aduan tidak ditemukan.' }, { status: 404 });
    if (item.id_pelapor !== session.id_pengguna) return HttpResponse.json({ message: 'Forbidden' }, { status: 403 });
    if (item.status_terkini !== 'Diajukan') {
      return HttpResponse.json({ message: 'Hanya aduan dengan status Diajukan yang dapat dibatalkan.' }, { status: 400 });
    }

    list = list.filter((a) => a.id_pengaduan !== id);
    db.savePengaduan(list);
    return HttpResponse.json({ message: 'Pengaduan berhasil dibatalkan.' });
  }),

  http.get('/api/admin/aduan', async ({ request }) => {
    await delay(250);
    const session = db.getSession();
    if (!session || session.peran !== 'admin') {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const cari = url.searchParams.get('cari')?.toLowerCase();
    const status = url.searchParams.get('status');

    const all = db.getPengaduan();
    const ringkasan = {
      total: all.length,
      diajukan: all.filter((a) => a.status_terkini === 'Diajukan').length,
      diverifikasi: all.filter((a) => a.status_terkini === 'Diverifikasi').length,
      diproses: all.filter((a) => a.status_terkini === 'Diproses').length,
      selesai: all.filter((a) => a.status_terkini === 'Selesai').length,
      ditolak: all.filter((a) => a.status_terkini === 'Ditolak').length,
    };

    let filtered = [...all];
    if (status && status !== 'Semua') {
      filtered = filtered.filter((a) => a.status_terkini === status);
    }

    if (cari) {
      filtered = filtered.filter(
        (a) =>
          a.nomor_pengaduan.toLowerCase().includes(cari) ||
          a.lokasi.toLowerCase().includes(cari) ||
          a.isi_pengaduan.toLowerCase().includes(cari)
      );
    }

    const kategoriMap = new Map(db.getKategori().map((k) => [k.id_kategori, k]));
    const penggunaMap = new Map(db.getPengguna().map((u) => [u.id_pengguna, u]));

    const enriched = filtered.map((a) => ({
      ...a,
      kategori: kategoriMap.get(a.id_kategori),
      pelapor: penggunaMap.get(a.id_pelapor),
    }));

    return HttpResponse.json({
      data: enriched,
      ringkasan,
    });
  }),

  http.post('/api/admin/aduan/:id/status', async ({ params, request }) => {
    await delay(300);
    const session = db.getSession();
    if (!session || session.peran !== 'admin') {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const id = Number(params.id);
    const body = (await request.json()) as {
      status_baru: string;
      catatan?: string;
      di_luar_kewenangan?: boolean;
      diteruskan_kepada?: string;
    };

    const list = db.getPengaduan();
    const item = list.find((a) => a.id_pengaduan === id);
    if (!item) return HttpResponse.json({ message: 'Aduan tidak ditemukan.' }, { status: 404 });

    if (body.status_baru === 'Ditolak' && !body.catatan?.trim()) {
      return HttpResponse.json(
        { message: 'Alasan penolakan wajib diisi.', errors: { catatan: ['Alasan penolakan wajib diisi.'] } },
        { status: 422 }
      );
    }

    if (body.di_luar_kewenangan && !body.diteruskan_kepada?.trim()) {
      return HttpResponse.json(
        { message: 'Pihak tujuan penerusan wajib diisi.', errors: { diteruskan_kepada: ['Tujuan penerusan wajib diisi.'] } },
        { status: 422 }
      );
    }

    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const prevStatus = item.status_terkini;
    item.status_terkini = body.status_baru as any;
    item.diperbarui_pada = now;

    if (body.di_luar_kewenangan) {
      item.diteruskan_kepada = body.diteruskan_kepada?.trim() || null;
    }

    const catat = body.di_luar_kewenangan
      ? `[Diteruskan kepada ${body.diteruskan_kepada}] ${body.catatan || ''}`.trim()
      : body.catatan || `Status diperbarui menjadi ${body.status_baru}`;

    item.riwayat_status = item.riwayat_status || [];
    item.riwayat_status.push({
      id_riwayat: Date.now(),
      id_pengaduan: item.id_pengaduan,
      id_pencatat: session.id_pengguna,
      status_sebelumnya: prevStatus,
      status_baru: body.status_baru as any,
      catatan: catat,
      dicatat_pada: now,
      nama_pencatat: session.nama,
    });

    db.savePengaduan(list);
    return HttpResponse.json({ message: 'Status berhasil diperbarui.', data: item });
  }),

  http.post('/api/admin/aduan/:id/tanggapan', async ({ params, request }) => {
    await delay(300);
    const session = db.getSession();
    if (!session || session.peran !== 'admin') {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const id = Number(params.id);
    const body = (await request.json()) as { isi_tanggapan?: string };
    if (!body.isi_tanggapan?.trim()) {
      return HttpResponse.json({ message: 'Isi tanggapan tidak boleh kosong.' }, { status: 422 });
    }

    const list = db.getPengaduan();
    const item = list.find((a) => a.id_pengaduan === id);
    if (!item) return HttpResponse.json({ message: 'Aduan tidak ditemukan.' }, { status: 404 });

    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const newTanggapan: Tanggapan = {
      id_tanggapan: Date.now(),
      id_pengaduan: item.id_pengaduan,
      id_pengurus: session.id_pengguna,
      isi_tanggapan: body.isi_tanggapan.trim(),
      ditanggapi_pada: now,
      nama_pengurus: session.nama,
    };

    item.tanggapan = item.tanggapan || [];
    item.tanggapan.push(newTanggapan);
    item.diperbarui_pada = now;

    db.savePengaduan(list);
    return HttpResponse.json({ message: 'Tanggapan berhasil dikirim.', data: newTanggapan });
  }),

  http.get('/api/admin/pengguna', async ({ request }) => {
    const session = db.getSession();
    if (!session || session.peran !== 'admin') {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const tab = url.searchParams.get('tab') || 'belum_aktif';
    const cari = url.searchParams.get('cari')?.toLowerCase();

    let users = db.getPengguna().filter((u) => u.peran === 'warga');

    if (tab === 'belum_aktif') {
      users = users.filter((u) => !u.aktif);
    } else if (tab === 'aktif') {
      users = users.filter((u) => u.aktif);
    }

    if (cari) {
      users = users.filter(
        (u) => u.nama.toLowerCase().includes(cari) || u.username.toLowerCase().includes(cari)
      );
    }

    return HttpResponse.json({
      data: users,
      counts: {
        belum_aktif: db.getPengguna().filter((u) => u.peran === 'warga' && !u.aktif).length,
        aktif: db.getPengguna().filter((u) => u.peran === 'warga' && u.aktif).length,
        semua: db.getPengguna().filter((u) => u.peran === 'warga').length,
      },
    });
  }),

  http.patch('/api/admin/pengguna/:id/aktif', async ({ params, request }) => {
    const session = db.getSession();
    if (!session || session.peran !== 'admin') {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const id = Number(params.id);
    const body = (await request.json()) as { aktif: boolean };
    const users = db.getPengguna();
    const target = users.find((u) => u.id_pengguna === id);

    if (!target) return HttpResponse.json({ message: 'Pengguna tidak ditemukan.' }, { status: 404 });

    target.aktif = body.aktif;
    db.savePengguna(users);

    return HttpResponse.json({
      message: `Akun warga berhasil ${body.aktif ? 'diaktifkan' : 'dinonaktifkan'}.`,
      data: target,
    });
  }),

  http.get('/api/admin/kategori', async () => {
    return HttpResponse.json({ data: db.getKategori() });
  }),

  http.post('/api/admin/kategori', async ({ request }) => {
    const body = (await request.json()) as { nama_kategori?: string; deskripsi?: string };
    if (!body.nama_kategori?.trim()) {
      return HttpResponse.json({ message: 'Nama kategori wajib diisi.' }, { status: 422 });
    }

    const categories = db.getKategori();
    const newKat: KategoriFasilitas = {
      id_kategori: Date.now(),
      nama_kategori: body.nama_kategori.trim(),
      deskripsi: body.deskripsi?.trim() || null,
      aktif: true,
    };
    categories.push(newKat);
    db.saveKategori(categories);

    return HttpResponse.json({ message: 'Kategori berhasil ditambahkan.', data: newKat }, { status: 201 });
  }),

  http.patch('/api/admin/kategori/:id/aktif', async ({ params, request }) => {
    const id = Number(params.id);
    const body = (await request.json()) as { aktif: boolean };
    const categories = db.getKategori();
    const item = categories.find((c) => c.id_kategori === id);
    if (!item) return HttpResponse.json({ message: 'Kategori tidak ditemukan.' }, { status: 404 });

    item.aktif = body.aktif;
    db.saveKategori(categories);
    return HttpResponse.json({ message: 'Status kategori diperbarui.', data: item });
  }),

  http.put('/api/admin/kategori/:id', async ({ params, request }) => {
    const id = Number(params.id);
    const body = (await request.json()) as { nama_kategori?: string; deskripsi?: string };
    if (!body.nama_kategori?.trim()) {
      return HttpResponse.json({ message: 'Nama kategori wajib diisi.' }, { status: 422 });
    }

    const categories = db.getKategori();
    const item = categories.find((c) => c.id_kategori === id);
    if (!item) return HttpResponse.json({ message: 'Kategori tidak ditemukan.' }, { status: 404 });

    item.nama_kategori = body.nama_kategori.trim();
    item.deskripsi = body.deskripsi?.trim() || null;
    db.saveKategori(categories);
    return HttpResponse.json({ message: 'Kategori berhasil diperbarui.', data: item });
  }),

  http.get('/api/admin/rekap', async ({ request }) => {
    const url = new URL(request.url);
    const dari = url.searchParams.get('dari');
    const sampai = url.searchParams.get('sampai');
    const kategoriId = url.searchParams.get('kategori');
    const statusFilter = url.searchParams.get('status');

    let list = db.getPengaduan();
    const categories = db.getKategori();

    if (dari) {
      list = list.filter((a) => a.diajukan_pada >= dari);
    }
    if (sampai) {
      list = list.filter((a) => a.diajukan_pada <= `${sampai} 23:59:59`);
    }
    if (kategoriId && kategoriId !== 'semua') {
      list = list.filter((a) => a.id_kategori === Number(kategoriId));
    }
    if (statusFilter && statusFilter !== 'semua') {
      list = list.filter((a) => a.status_terkini === statusFilter);
    }

    const matrix = categories.map((cat) => {
      const itemsCat = list.filter((a) => a.id_kategori === cat.id_kategori);
      const dj = itemsCat.filter((a) => a.status_terkini === 'Diajukan').length;
      const dv = itemsCat.filter((a) => a.status_terkini === 'Diverifikasi').length;
      const dp = itemsCat.filter((a) => a.status_terkini === 'Diproses').length;
      const sl = itemsCat.filter((a) => a.status_terkini === 'Selesai').length;
      const dt = itemsCat.filter((a) => a.status_terkini === 'Ditolak').length;
      return {
        id_kategori: cat.id_kategori,
        nama_kategori: cat.nama_kategori,
        dj,
        dv,
        dp,
        sl,
        dt,
        total: dj + dv + dp + sl + dt,
      };
    });

    const totalRow = {
      dj: matrix.reduce((acc, m) => acc + m.dj, 0),
      dv: matrix.reduce((acc, m) => acc + m.dv, 0),
      dp: matrix.reduce((acc, m) => acc + m.dp, 0),
      sl: matrix.reduce((acc, m) => acc + m.sl, 0),
      dt: matrix.reduce((acc, m) => acc + m.dt, 0),
      total: matrix.reduce((acc, m) => acc + m.total, 0),
    };

    return HttpResponse.json({
      data: {
        matrix,
        totalRow,
        list,
      },
    });
  }),
];
