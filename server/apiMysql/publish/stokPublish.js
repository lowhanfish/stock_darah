const express = require('express');
const router = express.Router();
const db = require('../../db/MySql/umum');

router.get('/view', (req, res) => {
  try {
    const {
      golongan_darah,
      rhesus,
      komponen_id,
      status,
      page = 1,
      limit = 25,
      sort_by = 'k.id',
      sort_dir = 'DSC'
    } = req.query;

   
    const allowedSortDir = ['ASC', 'DESC'];
    const sortDir = allowedSortDir.includes(sort_dir.toUpperCase()) ? sort_dir.toUpperCase() : 'ASC';


    let sql = `
      SELECT 
        s.id,
        s.golongan_darah,
        s.rhesus,
        s.komponen_id,
        k.nama_komponen,
        s.jumlah_stok,
        s.status,
        DATE_FORMAT(s.tanggal_update, '%Y-%m-%d %H:%i:%s') AS tanggal_update
      FROM stok_darah s
      LEFT JOIN komponen_darah k ON s.komponen_id = k.id
      WHERE 1 = 1
    `;

    const params = [];

   
    if (golongan_darah) {
      sql += ' AND s.golongan_darah = ?';
      params.push(golongan_darah);
    }
    if (rhesus) {
      sql += ' AND s.rhesus = ?';
      params.push(rhesus);
    }
    if (komponen_id) {
      sql += ' AND s.komponen_id = ?';
      params.push(komponen_id);
    }
    if (status) {
      sql += ' AND s.status = ?';
      params.push(status);
    }

    const countSql = `SELECT COUNT(*) AS total FROM (${sql}) t`;
    db.query(countSql, params, (errCount, countRows) => {
      if (errCount) {
        console.error('Error count stok_darah:', errCount);
        return res.status(500).json({ success: false, message: 'Gagal menghitung data' });
      }

      const total = countRows[0].total;
      const pageNum = Math.max(parseInt(page), 1);
      const lim = Math.max(parseInt(limit), 1);
      const offset = (pageNum - 1) * lim;

      sql += ` ORDER BY ${db.escapeId ? db.escapeId(sort_by) : sort_by} ${sortDir} LIMIT ? OFFSET ?`;
      params.push(lim, offset);

      db.query(sql, params, (err, rows) => {
        if (err) {
          console.error('Error saat ambil data stok_darah:', err);
          return res.status(500).json({ success: false, message: 'Gagal ambil data stok_darah' });
        }

        res.json({
          success: true,
          meta: {
            total,
            page: pageNum,
            limit: lim,
            pages: Math.ceil(total / lim)
          },
          data: rows
        });
      });
    });
  } catch (err) {
    console.error('Unexpected error /stok_darah/view:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
