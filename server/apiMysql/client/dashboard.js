const express = require('express');
var db = require('../../db/MySql/umum');


const fs = require('fs');

var multer=require("multer");
var upload = require('../../db/multer/image');

var uniqid = require('uniqid');
const { log } = require('console');
const router = express.Router();

router.get('/statusDashboard', (req, res) => {
  const { stokdarah_konut, ruangan_id } = req.query;

  // ==========================
  // VALIDASI
  // ==========================
  if (!stokdarah_konut) {
    return res.status(400).json({
      message: 'stokdarah_konut wajib'
    });
  }

  const role = Number(stokdarah_konut);

  // ==========================
  // RUANGAN (HANYA role 3)
  // ==========================
  if (role === 3) {
    if (!ruangan_id) {
      return res.status(400).json({
        message: 'ruangan_id wajib untuk role ruangan'
      });
    }

    const sqlRuangan = `
      SELECT 
        COUNT(*) AS total_permintaan,
        SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) AS permintaan_baru,
        SUM(CASE WHEN status = 5 THEN 1 ELSE 0 END) AS ditolak,
        SUM(CASE WHEN status = 3 THEN 1 ELSE 0 END) AS siap_ambil,
        SUM(CASE WHEN status = 4 THEN 1 ELSE 0 END) AS selesai
      FROM permintaan_darah
      WHERE ruangan_id = ?
    `;

    return db.query(sqlRuangan, [ruangan_id], (err, rows) => {
      if (err) return res.status(500).json(err);
      return res.json({ data: rows[0] });
    });
  }

  // ==========================
  // ADMIN & UPD (role 1 & 2)
  // ==========================
  const sqlGlobal = `
    SELECT 
      COUNT(*) AS total_permintaan,
      SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) AS permintaan_baru,
      SUM(CASE WHEN status = 5 THEN 1 ELSE 0 END) AS ditolak,
      SUM(CASE WHEN status = 3 THEN 1 ELSE 0 END) AS siap_ambil,
      SUM(CASE WHEN status = 4 THEN 1 ELSE 0 END) AS selesai
    FROM permintaan_darah
  `;

  db.query(sqlGlobal, (err, rows) => {
    if (err) return res.status(500).json(err);
    return res.json({ data: rows[0] });
  });
});




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

router.get('/pendonorByGender', (req, res) => {
  const sql = `
    SELECT
      CASE
        WHEN jenis_kelamin = 'L' THEN 'Laki-laki'
        WHEN jenis_kelamin = 'P' THEN 'Perempuan'
        ELSE 'Tidak Diketahui'
      END AS name,
      COUNT(*) AS y
    FROM pendonor_darah
    WHERE jenis_kelamin IS NOT NULL
    GROUP BY jenis_kelamin
  `;

  db.query(sql, (err, rows) => {
    if (err) {
      console.error('Error pendonorByGender:', err);
      return res.status(500).json({
        error: true,
        message: 'Gagal mengambil data pendonor'
      });
    }

    res.json({
      data: rows
    });
  });
});

router.get('/pendonorByGenderTable', (req, res) => {
  const sql = `
    SELECT
      CASE
        WHEN jenis_kelamin = 'L' THEN 'Laki-laki'
        WHEN jenis_kelamin = 'P' THEN 'Perempuan'
        ELSE 'Tidak Diketahui'
      END AS jk_pendonor,
      COUNT(*) AS jumlah
    FROM pendonor_darah
    WHERE jenis_kelamin IS NOT NULL
    GROUP BY jenis_kelamin
    ORDER BY jumlah DESC
  `;

  db.query(sql, (err, rows) => {
    if (err) {
      console.error('Error pendonorByGenderTable:', err);
      return res.status(500).json({
        error: true,
        message: 'Gagal mengambil data tabel pendonor'
      });
    }

    res.json({
      data: rows
    });
  });
});

router.get('/permintaanByRuanganPie', (req, res) => {
  const sql = `
    SELECT
      tm.nama_ruangan AS name,
      COUNT(pd.id) AS y
    FROM tenaga_medis tm
    LEFT JOIN permintaan_darah pd
      ON pd.ruangan_id = tm.id
    GROUP BY tm.nama_ruangan
    ORDER BY y DESC
  `;

  db.query(sql, (err, rows) => {
    if (err) {
      console.error('Error permintaanByRuanganPie:', err);
      return res.status(500).json({
        error: true,
        message: 'Gagal mengambil data permintaan per ruangan'
      });
    }

    res.json({ data: rows });
  });
});

router.get('/permintaanByRuanganTable', (req, res) => {
  const sql = `
    SELECT
      tm.nama_ruangan AS nama_bidang,
      COUNT(pd.id) AS jumlah
    FROM tenaga_medis tm
    LEFT JOIN permintaan_darah pd
      ON pd.ruangan_id = tm.id
    GROUP BY tm.nama_ruangan
    ORDER BY jumlah DESC
  `;

  db.query(sql, (err, rows) => {
    if (err) {
      console.error('Error permintaanByRuanganTable:', err);
      return res.status(500).json({
        error: true,
        message: 'Gagal mengambil data tabel permintaan per ruangan'
      });
    }

    res.json({ data: rows });
  });
});




  

module.exports = router;