const express = require('express');
const router = express.Router();
const db = require('../../db/MySql/umum');

// ===================================================
// 🔹 GET /view
//    Lihat data darah keluar dengan detail dari permintaan_darah
//    Query params: bulan, tahun, golongan_darah, komponen_id, ruangan_id, page, limit, cari_value
// ===================================================
router.get('/view', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 15;
  const offset = (page - 1) * limit;

  const bulan = req.query.bulan || '';
  const tahun = req.query.tahun || '';
  const golongan_darah = req.query.golongan_darah || '';
  const komponen_id = req.query.komponen_id || '';
  const ruangan_id = req.query.ruangan_id || '';
  const cari_value = req.query.cari_value || '';

  const filters = [];
  const params = [];

  // Hanya tampilkan permintaan yang sudah selesai (status 4 atau 6 = darah sudah keluar)
  filters.push('p.status IN (4, 6)');

  // Filter bulan dari tanggal_pengambilan atau tanggal_pemeriksaan
  if (bulan) {
    filters.push('MONTH(COALESCE(p.tanggal_pengambilan, p.updated_at)) = ?');
    params.push(parseInt(bulan));
  }

  if (tahun) {
    filters.push('YEAR(COALESCE(p.tanggal_pengambilan, p.updated_at)) = ?');
    params.push(parseInt(tahun));
  }

  if (golongan_darah) {
    filters.push('p.golongan_darah = ?');
    params.push(golongan_darah);
  }

  if (komponen_id) {
    filters.push('p.komponen_id = ?');
    params.push(komponen_id);
  }

  if (ruangan_id) {
    filters.push('p.ruangan_id = ?');
    params.push(ruangan_id);
  }

  if (cari_value) {
    filters.push(`(p.nama_pasien LIKE ? OR p.nomor_rm LIKE ? OR p.nomor_kantong LIKE ? OR p.nama_dokter LIKE ? OR t.nama_ruangan LIKE ?)`);
    const like = `%${cari_value}%`;
    params.push(like, like, like, like, like);
  }

  const whereClause = filters.length ? 'WHERE ' + filters.join(' AND ') : '';

  // COUNT query
  const countSql = `
    SELECT COUNT(*) AS total
    FROM permintaan_darah p
    LEFT JOIN tenaga_medis t ON p.ruangan_id = t.id
    ${whereClause}
  `;

  db.query(countSql, params, (err, countResult) => {
    if (err) {
      console.error('Error count darah keluar:', err);
      return res.status(500).json({ success: false, message: 'Gagal menghitung data darah keluar' });
    }

    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limit);

    // DATA query
    const dataSql = `
      SELECT 
        p.id,
        COALESCE(p.tanggal_pengambilan, p.updated_at) AS tanggal_keluar,
        p.nomor_kantong,
        p.golongan_darah,
        p.rhesus,
        p.komponen_id,
        k.nama_komponen,
        p.jumlah_darah_diberikan AS jumlah,
        p.jumlah_darah_diberikan_cc AS jumlah_cc,
        p.nama_pasien,
        p.nomor_rm,
        p.jenis_kelamin,
        p.ruangan_id,
        t.nama_ruangan,
        p.nama_dokter,
        p.petugas_pengeluar,
        p.penerima_darah,
        p.status,
        p.status_keterangan,
        p.catatan_tambahan
      FROM permintaan_darah p
      LEFT JOIN komponen_darah k ON p.komponen_id = k.id
      LEFT JOIN tenaga_medis t ON p.ruangan_id = t.id
      ${whereClause}
      ORDER BY COALESCE(p.tanggal_pengambilan, p.updated_at) DESC
      LIMIT ? OFFSET ?
    `;

    const dataParams = params.slice();
    dataParams.push(limit, offset);

    db.query(dataSql, dataParams, (err2, dataResult) => {
      if (err2) {
        console.error('Error ambil data darah keluar:', err2);
        return res.status(500).json({ success: false, message: 'Gagal ambil data darah keluar' });
      }

      res.json({
        success: true,
        page,
        limit,
        total_data: total,
        total_pages: totalPages,
        data: dataResult
      });
    });
  });
});


// ===================================================
// 🔹 GET /rekap
//    Rekap matrix darah keluar per golongan/rhesus/komponen
//    Query params: bulan, tahun
// ===================================================
router.get('/rekap', (req, res) => {
  const bulan = req.query.bulan || '';
  const tahun = req.query.tahun || '';

  const filters = ['p.status IN (4, 6)'];
  const params = [];

  if (bulan) {
    filters.push('MONTH(COALESCE(p.tanggal_pengambilan, p.updated_at)) = ?');
    params.push(parseInt(bulan));
  }

  if (tahun) {
    filters.push('YEAR(COALESCE(p.tanggal_pengambilan, p.updated_at)) = ?');
    params.push(parseInt(tahun));
  }

  const whereClause = filters.length ? 'WHERE ' + filters.join(' AND ') : '';

  const sql = `
    SELECT 
      p.golongan_darah,
      p.rhesus,
      p.komponen_id,
      k.nama_komponen,
      COALESCE(SUM(p.jumlah_darah_diberikan), 0) AS total_kantong,
      COALESCE(SUM(p.jumlah_darah_diberikan_cc), 0) AS total_cc,
      COUNT(*) AS jumlah_transaksi
    FROM permintaan_darah p
    LEFT JOIN komponen_darah k ON p.komponen_id = k.id
    ${whereClause}
    GROUP BY p.golongan_darah, p.rhesus, p.komponen_id, k.nama_komponen
    ORDER BY k.nama_komponen, p.golongan_darah, p.rhesus
  `;

  db.query(sql, params, (err, rows) => {
    if (err) {
      console.error('Error rekap darah keluar:', err);
      return res.status(500).json({ success: false, message: 'Gagal mengambil rekap darah keluar' });
    }

    res.json({
      success: true,
      data: rows
    });
  });
});


// ===================================================
// 🔹 GET /ruangan-list
//    Ambil daftar ruangan untuk filter
// ===================================================
router.get('/ruangan-list', (req, res) => {
  const sql = `SELECT id, nama_ruangan FROM tenaga_medis ORDER BY nama_ruangan`;

  db.query(sql, [], (err, rows) => {
    if (err) {
      console.error('Error ambil daftar ruangan:', err);
      return res.status(500).json({ success: false, message: 'Gagal ambil daftar ruangan' });
    }

    res.json({
      success: true,
      data: rows
    });
  });
});


module.exports = router;
