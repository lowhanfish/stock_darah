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
// router.delete('/delete/:id', (req, res) => {
//   const { id } = req.params;

//   const sql = `DELETE FROM transaksi_darah WHERE id_transaksi = ?`;
//   db.query(sql, [id], (err, result) => {
//     if (err) {
//       console.error('Error hapus transaksi:', err);
//       return res.status(500).json({ success: false, message: 'Gagal hapus transaksi' });
//     }
//     res.json({ success: true, message: 'Transaksi berhasil dihapus' });
//   });
// });


router.post('/editData', (req, res) => {
    const {
      id_transaksi,
      golongan_darah,
      rhesus,
      komponen_id,
      jumlah,
      tipe_transaksi,
      keterangan
    } = req.body;
  
    if (!id_transaksi || !golongan_darah || !rhesus || !komponen_id || !jumlah || !tipe_transaksi) {
      return res.status(400).json({ success: false, message: 'Data tidak lengkap' });
    }
  
    // 1️⃣ Ambil data transaksi lama dulu
    const getOldSql = `SELECT * FROM transaksi_darah WHERE id_transaksi = ?`;
    db.query(getOldSql, [id_transaksi], (err, resultOld) => {
      if (err) {
        console.error('Error ambil data lama:', err);
        return res.status(500).json({ success: false, message: 'Gagal ambil data transaksi lama' });
      }
  
      if (resultOld.length === 0) {
        return res.status(404).json({ success: false, message: 'Data transaksi tidak ditemukan' });
      }
  
      const oldData = resultOld[0];
  
      // 2️⃣ Kembalikan stok sesuai transaksi lama (revert dulu)
      let revertSql = '';
      let revertParams = [];
  
      if (oldData.tipe_transaksi === 'masuk') {
        revertSql = `
          UPDATE stok_darah 
          SET jumlah_stok = GREATEST(jumlah_stok - ?, 0), tanggal_update = NOW()
          WHERE golongan_darah = ? AND rhesus = ? AND komponen_id = ?
        `;
        revertParams = [oldData.jumlah, oldData.golongan_darah, oldData.rhesus, oldData.komponen_id];
      } else if (oldData.tipe_transaksi === 'keluar') {
        revertSql = `
          UPDATE stok_darah 
          SET jumlah_stok = jumlah_stok + ?, tanggal_update = NOW()
          WHERE golongan_darah = ? AND rhesus = ? AND komponen_id = ?
        `;
        revertParams = [oldData.jumlah, oldData.golongan_darah, oldData.rhesus, oldData.komponen_id];
      }
  
      db.query(revertSql, revertParams, (err2) => {
        if (err2) {
          console.error('Error revert stok:', err2);
          return res.status(500).json({ success: false, message: 'Gagal revert stok lama' });
        }
  
        // 3️⃣ Update data transaksi baru
        const updateTransaksiSql = `
          UPDATE transaksi_darah 
          SET golongan_darah = ?, rhesus = ?, komponen_id = ?, jumlah = ?, 
              tipe_transaksi = ?, keterangan = ?
          WHERE id_transaksi = ?
        `;
  
        db.query(
          updateTransaksiSql,
          [golongan_darah, rhesus, komponen_id, jumlah, tipe_transaksi, keterangan || null, id_transaksi],
          (err3) => {
            if (err3) {
              console.error('Error update transaksi:', err3);
              return res.status(500).json({ success: false, message: 'Gagal update transaksi' });
            }
  
            // 4️⃣ Tambahkan efek transaksi baru ke stok
            let applySql = '';
            if (tipe_transaksi.toLowerCase() === 'masuk') {
              applySql = `
                UPDATE stok_darah 
                SET jumlah_stok = jumlah_stok + ?, tanggal_update = NOW()
                WHERE golongan_darah = ? AND rhesus = ? AND komponen_id = ?
              `;
            } else if (tipe_transaksi.toLowerCase() === 'keluar') {
              applySql = `
                UPDATE stok_darah 
                SET jumlah_stok = GREATEST(jumlah_stok - ?, 0), tanggal_update = NOW()
                WHERE golongan_darah = ? AND rhesus = ? AND komponen_id = ?
              `;
            }
  
            db.query(applySql, [jumlah, golongan_darah, rhesus, komponen_id], (err4) => {
              if (err4) {
                console.error('Error update stok baru:', err4);
                return res.status(500).json({ success: false, message: 'Gagal update stok baru' });
              }
  
              res.json({
                success: true,
                message: 'Transaksi darah berhasil diperbarui dan stok diperbarui ulang.'
              });
            });
          }
        );
      });
    });
  });

  // ===================================================
// 🔹 DELETE: Hapus transaksi -> revert stok sesuai transaksi lama, lalu hapus transaksi
// ===================================================
router.delete('/delete/:id', (req, res) => {
    const { id } = req.params;
  
    // 1) ambil transaksi yang akan dihapus
    const getSql = `SELECT * FROM transaksi_darah WHERE id_transaksi = ?`;
    db.query(getSql, [id], (err, rows) => {
      if (err) {
        console.error('Error ambil transaksi untuk hapus:', err);
        return res.status(500).json({ success: false, message: 'Gagal ambil data transaksi' });
      }
      if (!rows || rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Transaksi tidak ditemukan' });
      }
  
      const tr = rows[0];
  
      // 2) revert stok sesuai tipe transaksi lama
      // jika tipe = 'masuk' -> kurangi stok
      // jika tipe = 'keluar' -> tambah stok
      let revertSql = '';
      let params = [];
  
      if ((tr.tipe_transaksi || '').toLowerCase() === 'masuk') {
        revertSql = `
          UPDATE stok_darah
          SET jumlah_stok = GREATEST(jumlah_stok - ?, 0), tanggal_update = NOW()
          WHERE golongan_darah = ? AND rhesus = ? AND komponen_id = ?
        `;
        params = [tr.jumlah, tr.golongan_darah, tr.rhesus, tr.komponen_id];
      } else if ((tr.tipe_transaksi || '').toLowerCase() === 'keluar') {
        revertSql = `
          UPDATE stok_darah
          SET jumlah_stok = jumlah_stok + ?, tanggal_update = NOW()
          WHERE golongan_darah = ? AND rhesus = ? AND komponen_id = ?
        `;
        params = [tr.jumlah, tr.golongan_darah, tr.rhesus, tr.komponen_id];
      } else {
        // tipe tidak dikenali, tapi tetap hapus transaksi tanpa revert
        console.warn('Tipe transaksi tidak dikenali saat hapus:', tr.tipe_transaksi);
      }
  
      // jalankan revert (jika ada), lalu hapus transaksi
      const doRevert = (cb) => {
        if (!revertSql) return cb(null);
        db.query(revertSql, params, (err2) => {
          if (err2) {
            console.error('Error revert stok saat hapus transaksi:', err2);
            return cb(err2);
          }
          cb(null);
        });
      };
  
      doRevert((revertErr) => {
        if (revertErr) {
          return res.status(500).json({ success: false, message: 'Gagal ubah stok saat hapus transaksi' });
        }
  
        // 3) hapus transaksi
        const delSql = `DELETE FROM transaksi_darah WHERE id_transaksi = ?`;
        db.query(delSql, [id], (err3) => {
          if (err3) {
            console.error('Error hapus transaksi:', err3);
            return res.status(500).json({ success: false, message: 'Gagal hapus data transaksi' });
          }
          return res.json({ success: true, message: 'Transaksi berhasil dihapus dan stok diperbarui.' });
        });
      });
    });
  });
  

module.exports = router;
