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
      SELECT nama_lengkap, golongan_darah, no_hp
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

module.exports = router;
