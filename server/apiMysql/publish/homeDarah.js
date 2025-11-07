const express = require('express');
const router = express.Router();
const db = require('../../db/MySql/umum');

router.post('/darahHome', (req, res) => {
  try {
    const body = req.body || {};
    const thresholds = (body.thresholds && typeof body.thresholds === 'object')
      ? body.thresholds
      : { tersedia: 30, rendah: 10 };

    const tersedia = Number(thresholds.tersedia || 30);
    const rendah = Number(thresholds.rendah || 10);

    // Query: total per golongan dan last update per golongan
    const sql = `
      SELECT
        COALESCE(NULLIF(TRIM(golongan_darah), ''), 'UNKNOWN') AS golongan,
        SUM(IFNULL(jumlah_stok,0)) AS total,
        DATE_FORMAT(MAX(tanggal_update), '%Y-%m-%d %H:%i:%s') AS last_update
      FROM stok_darah
      GROUP BY golongan
      ORDER BY FIELD(golongan, 'A','B','O','AB') ASC, golongan ASC
    `;

    db.query(sql, [], (err, rows) => {
      if (err) {
        console.error('Error /darahHome query:', err);
        return res.status(500).json({ success: false, message: 'Gagal mengambil data stok darah', error: err });
      }

      // Map hasil ke format sederhana: golongan, total, status, last_update
      const rowsMap = {};
      (rows || []).forEach(r => {
        const g = (r.golongan || '').toString().toUpperCase();
        rowsMap[g] = {
          golongan: g,
          total: Number(r.total || 0),
          last_update: r.last_update || null
        };
      });

      // Pastikan A,B,O,AB selalu ada (fallback 0)
      const groups = ['A','B','O','AB'];
      const data = groups.map(g => {
        const item = rowsMap[g] || { golongan: g, total: 0, last_update: null };
        // Tentukan status berdasarkan threshold server-side
        let status = 'Tidak Diketahui';
        if (item.total >= tersedia) status = 'Tersedia';
        else if (item.total >= rendah) status = 'Rendah';
        else status = 'Kritis';

        return {
          golongan: item.golongan,
          total: item.total,
          status,
          last_update: item.last_update
        };
      });

      // singkat cache agar frontend tidak sering-hit DB (atur sesuai kebutuhan)
      res.setHeader('Cache-Control', 'public, max-age=30');

      return res.json({ success: true, data });
    });
  } catch (error) {
    console.error('Unexpected error /darahHome:', error);
    return res.status(500).json({ success: false, message: 'Server error', error });
  }
});


router.post("/beritaHome", (req, res) => {
  const sql = `
    SELECT id, judul, sumber, isi, file_name, createdBy, createAt
    FROM berita
    ORDER BY createAt DESC
    LIMIT 3
  `;
  db.query(sql, (err, rows) => {
    if (err) {  
      console.error("❌ Error beritaHome:", err);
      return res.status(500).send([]);
    }
    res.send(rows); // langsung array
  });
});

router.post('/jumlahPendonor', (req, res) => {
  const sql = `SELECT COUNT(*) AS jumlah FROM pendonor_darah`;
  db.query(sql, (err, rows) => {
    if (err) {
      console.error("❌ Error jumlahPendonor:", err);
      return res.status(500).json({ success: false, message: "DB Error", error: err });
    }
    res.json({ jumlah: rows[0].jumlah });
  });
});

router.post('/fotoHome', (req, res) => {
  const sql = `
    SELECT id, nama_kegiatan, file_name, created_at
    FROM foto
    WHERE file_name IS NOT NULL AND TRIM(file_name) <> ''
    ORDER BY created_at DESC
    LIMIT 3
  `;
  db.query(sql, (err, rows) => {
    if (err) {
      console.error("❌ Error fotoHome:", err);
      return res.status(500).json([]);
    }
    return res.json(rows || []);
  });
});




module.exports = router;
