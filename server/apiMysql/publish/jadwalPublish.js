const express = require('express');
const router = express.Router();
const db = require('../../db/MySql/umum');


// Ambil semua jadwal donor (opsional: hanya status=1 aktif)
router.get('/viewData', (req, res) => {
  const sql = `
    SELECT id, nama_kegiatan, tanggal_mulai, tanggal_selesai, jam, lokasi, map_link, file_name, keterangan, kuota_peserta, jumlah_terdaftar, status, created_by, created_at, updated_at
    FROM jadwal_donor
    
    ORDER BY tanggal_mulai DESC
  `;
  db.query(sql, (err, rows) => {
    if (err) {
      console.error('❌ Error jadwal_donor viewData:', err);
      return res.status(500).json({ success: false, message: 'DB error', error: err });
    }
    // jika file_name hanya nama file, Anda bisa buat URL lengkap di sini (opsional)
    const baseUrl = process.env.BASE_URL || ''; // misal: https://domain.com/uploads/
    const data = rows.map(r => ({
      ...r,
      poster_url: r.file_name ? `${baseUrl}${r.file_name}` : null
    }));
    res.json({ success: true, data });
  });
});

module.exports = router;
