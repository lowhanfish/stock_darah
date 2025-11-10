const express = require('express');
const router = express.Router();
const db = require('../../../db/MySql/umum'); // koneksi database

// ===================================================
// GET: view (list) permintaan_darah dengan pagination + filter
// ===================================================
router.get('/view', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  const rawSearch = req.query.cari_value || '';
  const cari_value = rawSearch ? `%${rawSearch}%` : '%%';
  const komponen_id = req.query.komponen_id || '';
  const golongan_darah = req.query.golongan_darah || '';
  const status = req.query.status || '';

  // build filters
  const filters = [];
  const params = [];

  // search across nama_pasien, nama_dokter, nomor_rm, diagnosis_klinis
  filters.push(`(p.nama_pasien LIKE ? OR p.nama_dokter LIKE ? OR p.nomor_rm LIKE ? OR p.diagnosis_klinis LIKE ?)`);
  params.push(cari_value, cari_value, cari_value, cari_value);

  if (komponen_id) {
    filters.push('p.komponen_id = ?');
    params.push(komponen_id);
  }
  if (golongan_darah) {
    filters.push('p.golongan_darah = ?');
    params.push(golongan_darah);
  }
  if (status !== '') {
    filters.push('p.status = ?');
    params.push(status);
  }

  // =========================
  // ✅ perubahan: batasi view berdasarkan ruangan jika user adalah Admin Ruangan
  // Cara: ambil token dari header authorization, decode, cek profile.stokdarah_konut === '3'
  // dan profile.ruangan_id terisi -> tambahkan filter p.ruangan_id = ?
  // =========================
  try {
    const auth = req.headers && req.headers.authorization ? req.headers.authorization : '';
    // bentuk header yang dipakai di frontend: "kikensbatara <token>"
    if (auth) {
      const parts = auth.split(' ');
      const token = parts.length > 1 ? parts[1] : parts[0];
      if (token && process.env.TOKEN_SECRET) {
        try {
          const decoded = require('jsonwebtoken').verify(token, process.env.TOKEN_SECRET);
          // decoded diharapkan memiliki struktur: { profile: { stokdarah_konut: '3', ruangan_id: 12, ... } }
          if (decoded && decoded.profile) {
            const role = decoded.profile.stokdarah_konut != null ? String(decoded.profile.stokdarah_konut) : null;
            const ruanganIdFromToken = decoded.profile.ruangan_id ? Number(decoded.profile.ruangan_id) : null;
            if (role === '3' && ruanganIdFromToken) {
              // hanya tampilkan permintaan dari ruangan user itu
              filters.push('p.ruangan_id = ?');
              params.push(ruanganIdFromToken);
            }
          }
        } catch (e) {
          // token invalid / expired -> jangan gagal total, tetap tampilkan sesuai role (no extra filter)
          console.warn('Warning: gagal decode token pada /permintaan_darah/view — token mungkin invalid', e);
        }
      }
    }
  } catch (eAny) {
    // non-fatal
    console.warn('Non-fatal error saat mengeksekusi token-check pada /permintaan_darah/view', eAny);
  }
  // =========================

  const whereClause = filters.length ? 'WHERE ' + filters.join(' AND ') : '';

  const countSql = `
    SELECT COUNT(*) AS total
    FROM permintaan_darah p
    ${whereClause}
  `;

  db.query(countSql, params, (err, countRes) => {
    if (err) {
      console.error('Error count permintaan_darah:', err);
      return res.status(500).json({ success: false, message: 'Gagal menghitung data permintaan' });
    }
    const total = countRes[0].total || 0;
    const totalPages = Math.ceil(total / limit);

    const dataSql = `
      SELECT p.*,
             k.nama_komponen,
             t.nama_ruangan
      FROM permintaan_darah p
      LEFT JOIN komponen_darah k ON p.komponen_id = k.id
      LEFT JOIN tenaga_medis t ON p.ruangan_id = t.id
      ${whereClause}
      ORDER BY p.tanggal_permintaan DESC, p.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const dataParams = params.slice();
    dataParams.push(limit, offset);

    db.query(dataSql, dataParams, (err2, rows) => {
      if (err2) {
        console.error('Error fetch permintaan_darah:', err2);
        return res.status(500).json({ success: false, message: 'Gagal memuat data permintaan' });
      }
      return res.json({
        success: true,
        page,
        limit,
        total_data: total,
        total_pages: totalPages,
        data: rows || []
      });
    });
  });
});


// ===================================================
// GET: detail permintaan by id
// ===================================================
router.get('/detail/:id', (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ success: false, message: 'ID permintaan dibutuhkan' });

  const sql = `
    SELECT p.*,
           k.nama_komponen,
           t.nama_ruangan
    FROM permintaan_darah p
    LEFT JOIN komponen_darah k ON p.komponen_id = k.id
    LEFT JOIN tenaga_medis t ON p.ruangan_id = t.id
    WHERE p.id = ?
    LIMIT 1
  `;
  db.query(sql, [id], (err, rows) => {
    if (err) {
      console.error('Error detail permintaan:', err);
      return res.status(500).json({ success: false, message: 'Gagal ambil detail permintaan' });
    }
    if (!rows || rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Permintaan tidak ditemukan' });
    }
    return res.json({ success: true, data: rows[0] });
  });
});

// ===================================================
// POST: addData (admin ruangan mengajukan permintaan)
// ===================================================
router.post('/addData', (req, res) => {
  const body = req.body || {};

  // fallback default sementara: rumah_sakit_id = 1 (RSUD KONAWE UTARA)
  if (
    body.rumah_sakit_id === undefined ||
    body.rumah_sakit_id === null ||
    String(body.rumah_sakit_id).trim() === ''
  ) {
    body.rumah_sakit_id = 1;
  }

  // validasi field wajib minimal
  const required = [
    'rumah_sakit_id',
    'ruangan_id',
    'nama_dokter',
    'tanggal_permintaan',
    'nama_pasien',
    'jenis_kelamin',
    'golongan_darah',
    'rhesus',
    'komponen_id',
    'jumlah_kantong',
    'diagnosis_klinis',
    'alasan_transfusi'
  ];

  for (let f of required) {
    if (
      body[f] === undefined ||
      body[f] === null ||
      String(body[f]).toString().trim() === ''
    ) {
      return res
        .status(400)
        .json({ success: false, message: `Field ${f} wajib diisi` });
    }
  }

  // validasi tambahan khusus pasien wanita
  if (body.jenis_kelamin === 'P') {
    if (body.jumlah_kehamilan === undefined || body.jumlah_kehamilan === null) {
      return res
        .status(400)
        .json({ success: false, message: 'Jumlah kehamilan wajib diisi untuk pasien perempuan' });
    }
    if (
      !['Ya', 'Tidak'].includes(body.pernah_abortus || '') ||
      !['Ya', 'Tidak'].includes(body.pernah_hdn || '')
    ) {
      return res
        .status(400)
        .json({ success: false, message: 'Pernah abortus dan pernah HDN wajib diisi untuk pasien perempuan' });
    }
  }

  // nilai default status awal
  const status = 1; // Diajukan
  const status_keterangan = 'Menunggu Diperiksa oleh Admin UPD';

  // Query lengkap sesuai tabel permintaan_darah
  const sql = `
    INSERT INTO permintaan_darah
    (
      rumah_sakit_id, ruangan_id, nama_dokter, tanggal_permintaan, tanggal_diperlukan,
      nama_pasien, nomor_rm, tanggal_lahir, alamat, nama_wali, jenis_kelamin,
      golongan_darah, rhesus, komponen_id, jumlah_kantong, diagnosis_klinis,
      alasan_transfusi, kadar_hb,
      jumlah_kehamilan, pernah_abortus, pernah_hdn,
      sampel_diambil, tanggal_sampel,
      status, status_keterangan, created_at, updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
  `;

  const params = [
    body.rumah_sakit_id,
    body.ruangan_id,
    body.nama_dokter,
    body.tanggal_permintaan,
    body.tanggal_diperlukan || null,
    body.nama_pasien,
    body.nomor_rm || null,
    body.tanggal_lahir || null,
    body.alamat || null,
    body.nama_wali || null,
    body.jenis_kelamin,
    body.golongan_darah,
    body.rhesus,
    body.komponen_id,
    Number(body.jumlah_kantong || 0),
    body.diagnosis_klinis,
    body.alasan_transfusi,
    body.kadar_hb || null,
    // bagian IV Riwayat transfusi (sementara null/default)
    // body.pernah_transfusi,
    // body.kapan_transfusi || null,
    // body.ada_reaksi || null,
    // body.gejala_reaksi || null,
    // body.pernah_coombs || null,
    // body.lokasi_coombs || null,
    // body.hasil_coombs || null,
    // bagian V khusus wanita
    body.jumlah_kehamilan || null,
    body.pernah_abortus || null,
    body.pernah_hdn || null,
    // bagian VI pengambilan sampel
    body.sampel_diambil || null,
    body.tanggal_sampel || null,
    // status
    status,
    status_keterangan
  ];

  db.query(sql, params, (err, result) => {
    if (err) {
      console.error('Error insert permintaan_darah:', err);
      return res
        .status(500)
        .json({ success: false, message: 'Gagal menambah permintaan darah' });
    }
    return res.json({
      success: true,
      message: 'Permintaan darah berhasil diajukan',
      id: result.insertId
    });
  });
});

// ===================================================
// POST: updateStatus (untuk verifikasi oleh Admin UPD)
// - body: { id, status, status_keterangan, petugas_pemeriksa, tanggal_pemeriksaan, golongan_darah_hasil, rhesus_hasil, catatan_tambahan, crossmatch_1, crossmatch_2, crossmatch_3, jumlah_darah_diberikan, nomor_kantong, petugas_pengeluar, penerima_darah }
// - rules:
//    * jika status=4 (Ditolak) wajib status_keterangan
//    * status numeric: 1,2,3,4
// ===================================================
router.post('/updateStatus', (req, res) => {
  const b = req.body || {};
  const id = b.id;
  const status = Number(b.status);

  if (!id) return res.status(400).json({ success: false, message: 'ID permintaan dibutuhkan' });
  if (![1,2,3,4].includes(status)) return res.status(400).json({ success: false, message: 'Status tidak valid' });

  if (status === 4 && (!b.status_keterangan || String(b.status_keterangan).trim() === '')) {
    return res.status(400).json({ success: false, message: 'Keterangan penolakan wajib diisi saat status = 4' });
  }

  // prepare update fields (only allowed fields)
  const allowed = [
    'status_keterangan','petugas_pemeriksa','tanggal_pemeriksaan',
    'golongan_darah_hasil','rhesus_hasil','catatan_tambahan',
    'crossmatch_1','crossmatch_2','crossmatch_3',
    'jumlah_darah_diberikan','nomor_kantong','petugas_pengeluar','penerima_darah'
  ];

  const sets = ['status = ?'];
  const params = [status];

  allowed.forEach(key => {
    if (b[key] !== undefined) {
      sets.push(`${key} = ?`);
      params.push(b[key]);
    }
  });

  // Jika status 2 (Diperiksa) dan tidak ada status_keterangan, set default teks
  if (status === 2 && (b.status_keterangan === undefined || b.status_keterangan === null)) {
    sets.push(`status_keterangan = ?`);
    params.push('Permintaan Sedang diperiksa');
  }

  // Jika status 3 (Disetujui) and no status_keterangan, set default teks
  if (status === 3 && (b.status_keterangan === undefined || b.status_keterangan === null)) {
    sets.push(`status_keterangan = ?`);
    params.push('Permintaan Darah sudah berhasil');
  }

  // updated_at
  sets.push('updated_at = NOW()');

  const sql = `UPDATE permintaan_darah SET ${sets.join(', ')} WHERE id = ?`;
  params.push(id);

  db.query(sql, params, (err, result) => {
    if (err) {
      console.error('Error updateStatus permintaan_darah:', err);
      return res.status(500).json({ success: false, message: 'Gagal memperbarui status permintaan' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Permintaan tidak ditemukan' });
    }
    return res.json({ success: true, message: 'Status permintaan berhasil diperbarui' });
  });
});


// POST /permintaan_darah/edit
router.post('/edit', (req, res) => {
  const b = req.body || {};
  const id = b.id;
  if (!id) return res.status(400).json({ success:false, message: 'ID dibutuhkan' });

  // fields yang boleh diupdate (sesuaikan)
  const allowed = [
    'nama_dokter','tanggal_permintaan','tanggal_diperlukan','nama_pasien','nomor_rm','tanggal_lahir','alamat','nama_wali',
    'jenis_kelamin','jumlah_kehamilan','pernah_abortus','pernah_hdn',
    'golongan_darah','rhesus','komponen_id','jumlah_kantong','diagnosis_klinis','alasan_transfusi','kadar_hb'
  ];

  // 1) cek status saat ini
  db.query('SELECT status FROM permintaan_darah WHERE id = ? LIMIT 1', [id], (err, rows) => {
    if (err) {
      console.error('Error cek status saat edit:', err);
      return res.status(500).json({ success:false, message: 'Gagal cek data' });
    }
    if (!rows || rows.length === 0) return res.status(404).json({ success:false, message: 'Permintaan tidak ditemukan' });

    const curStatus = Number(rows[0].status || 1);
    if (curStatus === 3) {
      return res.status(409).json({ success:false, message: 'Tidak dapat mengubah: permintaan sudah Disetujui' });
    }

    // 2) build update query dinamis
    const sets = [];
    const params = [];
    allowed.forEach(k => {
      if (b[k] !== undefined) {
        sets.push(`${k} = ?`);
        params.push(b[k]);
      }
    });
    if (sets.length === 0) {
      return res.status(400).json({ success:false, message: 'Tidak ada field untuk diupdate' });
    }

    sets.push('updated_at = NOW()');
    const sql = `UPDATE permintaan_darah SET ${sets.join(', ')} WHERE id = ?`;
    params.push(id);

    db.query(sql, params, (err2, result) => {
      if (err2) {
        console.error('Error update permintaan:', err2);
        return res.status(500).json({ success:false, message: 'Gagal menyimpan perubahan' });
      }
      return res.json({ success:true, message: 'Permintaan berhasil diperbarui' });
    });
  });
});


module.exports = router;
