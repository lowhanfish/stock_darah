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
  if (body.rumah_sakit_id === undefined || body.rumah_sakit_id === null || String(body.rumah_sakit_id).trim() === '') {
    body.rumah_sakit_id = 1;
  }
  // required fields (sederhana)
  const required = ['rumah_sakit_id', 'ruangan_id', 'nama_dokter', 'tanggal_permintaan', 'nama_pasien', 'jenis_kelamin', 'golongan_darah', 'rhesus', 'komponen_id', 'jumlah_kantong', 'diagnosis_klinis', 'alasan_transfusi'];
  for (let f of required) {
    if (body[f] === undefined || body[f] === null || String(body[f]).toString().trim() === '') {
      return res.status(400).json({ success: false, message: `Field ${f} wajib diisi` });
    }
  }

  // default values
  const status = 1; // Diajukan
  const status_keterangan = 'Menunggu Diperiksa oleh Admin UPD';

  const sql = `
    INSERT INTO permintaan_darah
    (rumah_sakit_id, ruangan_id, nama_dokter, tanggal_permintaan, tanggal_diperlukan,
     nama_pasien, nomor_rm, tanggal_lahir, alamat, nama_wali, jenis_kelamin, golongan_darah, rhesus,
     komponen_id, jumlah_kantong, diagnosis_klinis, alasan_transfusi, kadar_hb,
     status, status_keterangan, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
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
    status,
    status_keterangan
  ];

  db.query(sql, params, (err, result) => {
    if (err) {
      console.error('Error insert permintaan_darah:', err);
      return res.status(500).json({ success: false, message: 'Gagal menambah permintaan' });
    }
    return res.json({
      success: true,
      message: 'Permintaan berhasil diajukan',
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

module.exports = router;
