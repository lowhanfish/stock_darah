const express = require('express');
const router = express.Router();
const db = require('../../../db/MySql/umum'); // koneksi database

// ===================================================
// 🔹 GET: Lihat semua transaksi darah
// ===================================================
router.get('/view', (req, res) => {
    // Ambil parameter query dari URL
    const page = parseInt(req.query.page) || 1;      // halaman sekarang
    const limit = parseInt(req.query.limit) || 10;   // jumlah per halaman
    const offset = (page - 1) * limit;               // mulai dari data ke berapa
  
    const countSql = `SELECT COUNT(*) AS total FROM transaksi_darah`;
  
    // Hitung total data dulu
    db.query(countSql, (err, countResult) => {
      if (err) {
        console.error('Error count transaksi:', err);
        return res.status(500).json({ success: false, message: 'Gagal menghitung data transaksi' });
      }
  
      const total = countResult[0].total;
      const totalPages = Math.ceil(total / limit);
  
      // Ambil data sesuai halaman
      const dataSql = `
        SELECT t.*, k.nama_komponen 
        FROM transaksi_darah t
        LEFT JOIN komponen_darah k ON t.komponen_id = k.id
        ORDER BY t.tanggal DESC
        LIMIT ? OFFSET ?
      `;
  
      db.query(dataSql, [limit, offset], (err2, dataResult) => {
        if (err2) {
          console.error('Error ambil transaksi:', err2);
          return res.status(500).json({ success: false, message: 'Gagal ambil data transaksi' });
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
// 🔹 POST: Tambah transaksi & update stok otomatis
// ===================================================
router.post('/addData', (req, res) => {
  const { golongan_darah, rhesus, komponen_id, jumlah, tipe_transaksi, keterangan } = req.body;

  if (!golongan_darah || !rhesus || !komponen_id || !jumlah || !tipe_transaksi) {
    return res.status(400).json({ success: false, message: 'Data tidak lengkap' });
  }

  // SQL insert transaksi
  const insertSql = `
    INSERT INTO transaksi_darah 
      (golongan_darah, rhesus, komponen_id, jumlah, tipe_transaksi, keterangan) 
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(
    insertSql,
    [golongan_darah, rhesus, komponen_id, jumlah, tipe_transaksi, keterangan || null],
    (err, result) => {
      if (err) {
        console.error('Error insert transaksi:', err);
        return res.status(500).json({ success: false, message: 'Gagal menambah transaksi darah' });
      }

      // SQL update stok_darah
      let updateSql = '';
      if (tipe_transaksi.toLowerCase() === 'masuk') {
        updateSql = `
          UPDATE stok_darah 
          SET jumlah_stok = jumlah_stok + ?, tanggal_update = NOW()
          WHERE golongan_darah = ? AND rhesus = ? AND komponen_id = ?
        `;
      } else if (tipe_transaksi.toLowerCase() === 'keluar') {
        updateSql = `
          UPDATE stok_darah 
          SET jumlah_stok = GREATEST(jumlah_stok - ?, 0), tanggal_update = NOW()
          WHERE golongan_darah = ? AND rhesus = ? AND komponen_id = ?
        `;
      } else {
        return res.status(400).json({ success: false, message: 'Tipe transaksi tidak dikenal (masuk/keluar)' });
      }

      db.query(updateSql, [jumlah, golongan_darah, rhesus, komponen_id], (err2, updateRes) => {
        if (err2) {
          console.error('Error update stok darah:', err2);
          return res.status(500).json({ success: false, message: 'Gagal update stok darah' });
        }

        res.json({
          success: true,
          message: `Transaksi ${tipe_transaksi} berhasil dan stok darah diperbarui.`
        });
      });
    }
  );
});


// ===================================================
// 🔹 DELETE: Hapus transaksi (opsional, tidak ubah stok)
// ===================================================
router.delete('/delete/:id', (req, res) => {
  const { id } = req.params;

  const sql = `DELETE FROM transaksi_darah WHERE id_transaksi = ?`;
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error('Error hapus transaksi:', err);
      return res.status(500).json({ success: false, message: 'Gagal hapus transaksi' });
    }
    res.json({ success: true, message: 'Transaksi berhasil dihapus' });
  });
});

module.exports = router;
