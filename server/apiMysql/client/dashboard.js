const express = require('express');
var db = require('../../db/MySql/umum');


const fs = require('fs');

var multer=require("multer");
var upload = require('../../db/multer/image');

var uniqid = require('uniqid');
const { log } = require('console');
const router = express.Router();



router.post('/statusPengajuan', (req, res) => {
    const users_id = req.body.users_id;
    if (!users_id) {
      return res.status(400).json({ error: true, message: "users_id wajib dikirim" });
    }
  
    // Hitung jumlah pengajuan per status langsung berdasarkan perusahaan_id = users_id
    const sqlKegiatan = `
      SELECT 
        SUM(CASE WHEN status_pengajuan = 1 THEN 1 ELSE 0 END) AS diproses,
        SUM(CASE WHEN status_pengajuan = 2 THEN 1 ELSE 0 END) AS diterima,
        SUM(CASE WHEN status_pengajuan = 3 THEN 1 ELSE 0 END) AS ditolak,
        COUNT(*) AS total_pengajuan
      FROM kegiatan_mitra
      WHERE perusahaan_id = ?
    `;
  
    db.query(sqlKegiatan, [users_id], (err, result) => {
      if (err) return res.status(500).json(err);
  
      res.json({ data: result[0] });
    });
  });


  router.get('/statusAdmin', (req, res) => {
    const sql = `
        SELECT 
            COUNT(*) AS total_permintaan,
            SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) AS permintaan_baru,
            SUM(CASE WHEN status = 5 THEN 1 ELSE 0 END) AS ditolak,
            SUM(CASE WHEN status = 3 THEN 1 ELSE 0 END) AS siap_ambil,
            SUM(CASE WHEN status = 4 THEN 1 ELSE 0 END) AS selesai
        FROM permintaan_darah
    `;
    db.query(sql, (err, result) => {
        if(err) return res.status(500).json({ error: true, message: err });
        res.json({ data: result[0] });
    });
});



router.get('/permintaanDarahByGolongan', (req, res) => {
  const year = req.query.year;

  if (!year) {
    return res.status(400).json({
      error: true,
      message: 'Parameter year wajib dikirim'
    });
  }

  const sql = `
    SELECT 
      MONTH(updated_at) AS bulan,
      golongan_darah,
      SUM(jumlah_darah_diberikan) AS jumlah
    FROM permintaan_darah
    WHERE 
      status = 4
      AND golongan_darah IS NOT NULL
      AND YEAR(updated_at) = ?
    GROUP BY 
      MONTH(updated_at),
      golongan_darah
    ORDER BY 
      MONTH(updated_at) ASC
  `;

  db.query(sql, [year], (err, rows) => {
    if (err) {
      return res.status(500).json({
        error: true,
        message: err
      });
    }

    res.json({
      year: year,
      data: rows
    });
  });
});

  

module.exports = router;