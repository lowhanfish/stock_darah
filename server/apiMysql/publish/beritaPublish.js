const express = require('express');
const router = express.Router();
const db = require('../../db/MySql/umum');

// Middleware sederhana untuk validasi input (opsional, tambahkan jika diperlukan)
// const validateInput = (req, res, next) => { /* validasi */ next(); };

// Route untuk mendapatkan daftar berita dengan pagination dan pencarian
router.post("/getview", (req, res) => {
  try {
    let { data_ke = 1, page_limit = 6, cari_value = "" } = req.body;

    // Validasi input
    data_ke = parseInt(data_ke, 10) || 1;
    page_limit = parseInt(page_limit, 10) || 6;
    if (page_limit > 50) page_limit = 50; // Batasi maksimal untuk performa
    cari_value = (cari_value || "").toString().trim();

    const offset = (data_ke - 1) * page_limit;

    let where = "";
    let values = [];

    if (cari_value !== "") {
      where = "WHERE judul LIKE ? OR isi LIKE ? OR sumber LIKE ?";
      values = [`%${cari_value}%`, `%${cari_value}%`, `%${cari_value}%`];
    }

    // Query untuk hitung total
    const sqlCount = `SELECT COUNT(*) AS total FROM berita ${where}`;
    db.query(sqlCount, values, (err, countResult) => {
      if (err) {
        console.error("❌ Error counting berita:", err);
        return res.status(500).json({ success: false, message: "Database error saat menghitung data" });
      }

      const total = countResult[0]?.total || 0;

      // Query untuk ambil data dengan alias untuk konsistensi frontend
      const sqlData = `
        SELECT 
          id, 
          judul, 
          sumber AS sumber,
          isi AS isi, 
          file_name AS gambar, 
          createdBy, 
          createAt AS tanggal
        FROM berita
        ${where}
        ORDER BY createAt DESC
        LIMIT ? OFFSET ?
      `;
      db.query(sqlData, [...values, page_limit, offset], (err2, rows) => {
        if (err2) {
          console.error("❌ Error fetching berita:", err2);
          return res.status(500).json({ success: false, message: "Database error saat mengambil data" });
        }

        res.json({
          success: true,
          total,
          data: rows,
        });
      });
    });
  } catch (e) {
    console.error("❌ Exception in getview:", e);
    res.status(500).json({ success: false, message: "Server error" });
  }
});
router.post("/detilBerita", (req, res) => {
  try {
    const { id } = req.body;
    if (!id || String(id).trim() === "") {
      return res.status(400).json({ success: false, message: "ID berita tidak boleh kosong" });
    }

    const sql = `
      SELECT 
        id,
        judul,
        sumber,
        isi AS isi,
        file_name,
        createdBy,
        createAt
      FROM berita
      WHERE id = ?
      LIMIT 1
    `;

    db.query(sql, [id], (err, rows) => {
      if (err) {
        console.error("❌ Database error in detilBerita:", err);
        return res.status(500).json({ success: false, message: "Database error" });
      }

      if (rows.length === 0) {
        return res.status(404).json({ success: false, message: "Berita tidak ditemukan" });
      }

      // kembalikan field apa adanya → cocok dengan form di frontend
      res.json({ success: true, data: rows[0] });
    });
  } catch (error) {
    console.error("❌ Exception in detilBerita:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Route baru untuk berita sidebar (berita terkini, tanpa pagination)
router.post("/beritaHome", (req, res) => {
  try {
    const sql = `
      SELECT 
        id,
        judul,
        sumber,
        isi AS isi,
        file_name AS gambar,
        createdBy,
        createAt AS tanggal
      FROM berita
      ORDER BY createAt DESC
      LIMIT 3  -- Ambil 3 berita terbaru untuk sidebar
    `;

    db.query(sql, (err, rows) => {
      if (err) {
        console.error("❌ Database error in beritaHome:", err);
        return res.status(500).json({ success: false, message: "Database error" });
      }

      // Response langsung array (sesuai frontend)
      res.json(rows);
    });
  } catch (error) {
    console.error("❌ Exception in beritaHome:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.get('/share/:id', (req, res) => {
  const { id } = req.params;

  res.send(`
<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8">
<meta property="og:title" content="Berita ${id}">
<meta property="og:type" content="article">
<meta property="og:url" content="https://pindara.bludrs-konut.id/api/v1/publish/beritaPublish/share/${id}">
<script>
  window.location.replace("/#/beritaisi/${id}");
</script>
</head>
<body></body>
</html>
  `);
});


module.exports = router;
