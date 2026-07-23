const express = require('express');
const router = express.Router();
const db = require('../../db/MySql/umum');

// ===================================================
// 🔹 GET /view?tahun=2027
//    Ambil semua rencana kebutuhan darah per tahun
// ===================================================
router.get('/view', (req, res) => {
  const tahun = parseInt(req.query.tahun) || new Date().getFullYear();

  const sql = `
    SELECT 
      r.id,
      r.tahun,
      r.golongan_darah,
      r.rhesus,
      r.komponen_id,
      k.nama_komponen,
      r.jumlah,
      r.created_at,
      r.updated_at
    FROM rencana_kebutuhan_darah r
    LEFT JOIN komponen_darah k ON r.komponen_id = k.id
    WHERE r.tahun = ?
    ORDER BY k.nama_komponen, r.golongan_darah, r.rhesus
  `;

  db.query(sql, [tahun], (err, rows) => {
    if (err) {
      console.error('Error ambil rencana kebutuhan darah:', err);
      return res.status(500).json({ success: false, message: 'Gagal ambil data rencana kebutuhan darah' });
    }

    res.json({
      success: true,
      tahun,
      data: rows
    });
  });
});


// ===================================================
// 🔹 GET /tahun-list
//    Ambil daftar tahun yang sudah ada datanya
// ===================================================
router.get('/tahun-list', (req, res) => {
  const sql = `SELECT DISTINCT tahun FROM rencana_kebutuhan_darah ORDER BY tahun DESC`;

  db.query(sql, [], (err, rows) => {
    if (err) {
      console.error('Error ambil daftar tahun:', err);
      return res.status(500).json({ success: false, message: 'Gagal ambil daftar tahun' });
    }

    res.json({
      success: true,
      data: rows.map(r => r.tahun)
    });
  });
});


// ===================================================
// 🔹 POST /save
//    Simpan/update rencana kebutuhan darah (upsert batch)
//    Body: { tahun: 2027, items: [ { golongan_darah, rhesus, komponen_id, jumlah }, ... ] }
// ===================================================
router.post('/save', (req, res) => {
  const { tahun, items } = req.body;

  if (!tahun || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, message: 'Data tidak lengkap. Kirim tahun dan items.' });
  }

  // Gunakan INSERT ... ON DUPLICATE KEY UPDATE untuk upsert
  const sql = `
    INSERT INTO rencana_kebutuhan_darah (tahun, golongan_darah, rhesus, komponen_id, jumlah)
    VALUES ?
    ON DUPLICATE KEY UPDATE jumlah = VALUES(jumlah), updated_at = NOW()
  `;

  const values = items.map(item => [
    tahun,
    item.golongan_darah,
    item.rhesus,
    item.komponen_id,
    Number(item.jumlah) || 0
  ]);

  db.query(sql, [values], (err, result) => {
    if (err) {
      console.error('Error simpan rencana kebutuhan darah:', err);
      return res.status(500).json({ success: false, message: 'Gagal menyimpan rencana kebutuhan darah' });
    }

    res.json({
      success: true,
      message: `Rencana kebutuhan darah tahun ${tahun} berhasil disimpan`,
      affected: result.affectedRows
    });
  });
});


// ===================================================
// 🔹 DELETE /delete?tahun=2027
//    Hapus seluruh rencana per tahun
// ===================================================
router.delete('/delete', (req, res) => {
  const tahun = parseInt(req.query.tahun);

  if (!tahun) {
    return res.status(400).json({ success: false, message: 'Parameter tahun diperlukan' });
  }

  const sql = `DELETE FROM rencana_kebutuhan_darah WHERE tahun = ?`;

  db.query(sql, [tahun], (err, result) => {
    if (err) {
      console.error('Error hapus rencana kebutuhan darah:', err);
      return res.status(500).json({ success: false, message: 'Gagal menghapus rencana kebutuhan darah' });
    }

    res.json({
      success: true,
      message: `Rencana kebutuhan darah tahun ${tahun} berhasil dihapus`,
      deleted: result.affectedRows
    });
  });
});


module.exports = router;
