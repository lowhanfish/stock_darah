const express = require('express');
const router = express.Router();
const db = require('../../db/MySql/umum');

router.post('/getview', (req, res) => {
  try {
    const page_limit = 12;
    const page = req.body.page || 1;
    const offset = (page - 1) * page_limit;
    const golongan_darah = req.body.golongan_darah || null;

    let sql = `
      SELECT nama_lengkap, golongan_darah, no_hp, rhesus
      FROM pendonor_darah
      WHERE bersedia_dipublikasikan = 1
    `;
    const params = [];
    if (golongan_darah) {
      sql += ` AND golongan_darah = ?`;
      params.push(golongan_darah);
    }
    sql += ` ORDER BY nama_lengkap ASC LIMIT ?, ?`;
    params.push(offset, page_limit);

    db.query(sql, params, (err, rows) => {
      if (err) return res.status(500).json({ success: false, message: "DB Error", error: err });
      
      let countSql = `SELECT COUNT(*) AS total FROM pendonor_darah WHERE bersedia_dipublikasikan = 1`;
      const countParams = [];
      if (golongan_darah) {
        countSql += ` AND golongan_darah = ?`;
        countParams.push(golongan_darah);
      }
      db.query(countSql, countParams, (countErr, countRows) => {
        if (countErr) return res.status(500).json({ success: false, message: "DB Error", error: countErr });
        
        const total = countRows[0].total;
        const totalPages = Math.ceil(total / page_limit);
        
        res.json({
          success: true,
          data: rows,
          pagination: {
            currentPage: page,
            totalPages: totalPages,
            totalItems: total,
            itemsPerPage: page_limit
          }
        });
      });
    });

  } catch (error) {
    console.error("❌ Server Error:", error);
    res.status(500).json({ success: false, message: "Server Error", error });
  }
});
// ... (kode /getview yang sudah ada tetap di sini)

router.post('/getriwayat', (req, res) => {
  try {
    const nama_lengkap = req.body.nama_lengkap;
    if (!nama_lengkap) {
      return res.status(400).json({ success: false, message: "nama_lengkap diperlukan" });
    }

    console.log("Fetching riwayat for:", nama_lengkap); // Logging untuk debug

    // Cari ID pendonor berdasarkan nama_lengkap dan bersedia_dipublikasikan = 1
    const getDonorSql = `SELECT id FROM pendonor_darah WHERE nama_lengkap = ? AND bersedia_dipublikasikan = 1`;
    db.query(getDonorSql, [nama_lengkap], (err, donorRows) => {
      if (err) {
        console.error("Error querying pendonor_darah:", err); // Logging error
        return res.status(500).json({ success: false, message: "DB Error: Gagal query pendonor", error: err.message });
      }
      if (donorRows.length === 0) {
        console.log("No donor found for:", nama_lengkap);
        return res.json({ success: true, data: [] }); // Tidak ada donor
      }

      const pendonorId = donorRows[0].id;
      console.log("Pendonor ID:", pendonorId);

      // Query riwayat berdasarkan pendonor_id (mirip dengan /getHistoryByPendonor di admin)
      const sql = `
        SELECT
          jd.id AS jadwal_id,
          jd.nama_kegiatan,
          jd.tanggal_mulai,
          jd.tanggal_selesai,
          jd.lokasi
        FROM jadwal_peserta jp
        JOIN jadwal_donor jd ON jp.jadwal_id = jd.id
        WHERE jp.pendonor_id = ?
        GROUP BY jd.id
        ORDER BY jd.tanggal_mulai DESC
      `;
      db.query(sql, [pendonorId], (err, rows) => {
        if (err) {
          console.error("Error querying riwayat:", err); // Logging error
          return res.status(500).json({ success: false, message: "DB Error: Gagal query riwayat", error: err.message });
        }
        
        console.log("Riwayat data:", rows); // Logging hasil
        // Format data agar konsisten dengan frontend (array of objects dengan nama_kegiatan, tanggal_mulai, dll.)
        const data = (rows || []).map(r => ({
          jadwal_id: r.jadwal_id,
          nama_kegiatan: r.nama_kegiatan,
          tanggal_mulai: r.tanggal_mulai,
          tanggal_selesai: r.tanggal_selesai,
          lokasi: r.lokasi
        }));
        res.json({
          success: true,
          data: data // Array of { jadwal_id, nama_kegiatan, tanggal_mulai, tanggal_selesai, lokasi }
        });
      });
    });

  } catch (error) {
    console.error("❌ Server Error:", error);
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
});

module.exports = router;