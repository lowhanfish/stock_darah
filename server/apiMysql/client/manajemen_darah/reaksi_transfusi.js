const express = require('express');
const router = express.Router();
const db = require('../../../db/MySql/umum'); // koneksi database
const path = require('path');
const ejs = require('ejs');
const puppeteer = require('puppeteer')
const { checkTokenSeetUser, isLoggedIn } = require('../../../auth/middlewares');
const fs = require('fs'); // Tambahkan di atas file jika belum ada
const pdf = require('html-pdf');

const qrcode = require('qrcode');



router.get('/', (req, res) => {
  // ambil ruangan_id dari query (opsional)
  const ruanganId = req.query.ruangan_id;

  let sql = 'SELECT id, nama_pasien, tanggal_lahir FROM permintaan_darah';
  const params = [];

  if (ruanganId) {
    sql += ' WHERE ruangan_id = ? AND status = 4';
    params.push(ruanganId);
  } else {
    sql += ' WHERE status = 4';
  }

  sql += ' ORDER BY id DESC LIMIT 50';

  // query menggunakan mysql (callback)
  db.query(sql, params, (err, rows) => {
    if (err) {
      console.error('DB error GET /reaksi_transfusi:', err);
      return res.status(500).json({ status: false, message: 'Server error' });
    }

    // rows adalah array hasil
    return res.json({ status: true, permintaan: rows });
  });
});

function toSqlDatetime(v) {
  if (!v) return null;
  // Accept already MySQL datetime or HTML datetime-local (YYYY-MM-DDTHH:MM)
  return String(v).replace('T', ' ');
}

router.post('/addData', (req, res) => {
  try {
    const {
      permintaan_id,
      jam_transfusi,
      jenis_reaksi,
      jam_terjadi,
      jam_dilaporkan,
      petugas_pelapor,
      tindakan,
      ruangan_id,
      rumah_sakit_id
    } = req.body || {};

    // Basic validation
    if (!permintaan_id) {
      return res.status(400).json({ success: false, status: false, message: 'permintaan_id wajib diisi' });
    }
    if (!jenis_reaksi) {
      return res.status(400).json({ success: false, status: false, message: 'jenis_reaksi wajib diisi' });
    }

    // Ensure permintaan exists
    db.query('SELECT id, nama_pasien FROM permintaan_darah WHERE id = ? LIMIT 1', [permintaan_id], (err, rows) => {
      if (err) {
        console.error('DB error check permintaan:', err);
        return res.status(500).json({ success: false, status: false, message: 'Server error' });
      }

      if (!rows || rows.length === 0) {
        return res.status(404).json({ success: false, status: false, message: 'Permintaan tidak ditemukan' });
      }

      // Prepare values
      const vJamTransfusi = toSqlDatetime(jam_transfusi);
      const vJamTerjadi = toSqlDatetime(jam_terjadi);
      const vJamDilaporkan = toSqlDatetime(jam_dilaporkan) || null; // DB has default CURRENT_TIMESTAMP
      const vPetugas = petugas_pelapor || (req.user && req.user.name) || null;
      const vTindakan = tindakan || null;

      const insertSql = `
        INSERT INTO reaksi_transfusi
          (permintaan_id, jam_transfusi, jenis_reaksi, jam_terjadi, jam_dilaporkan, petugas_pelapor, tindakan, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
      `;

      const params = [
        permintaan_id,
        vJamTransfusi,
        jenis_reaksi,
        vJamTerjadi,
        vJamDilaporkan,
        vPetugas,
        vTindakan
      ];

      db.query(insertSql, params, (err2, result) => {
        if (err2) {
          console.error('DB error insert reaksi_transfusi:', err2);
          return res.status(500).json({ success: false, status: false, message: 'Server error' });
        }

        const newId = result.insertId;

        // Return the newly created row (joined with permintaan_darah for context)
        const selectSql = `
          SELECT r.*, p.nama_pasien, p.nomor_rm, p.tanggal_lahir
          FROM reaksi_transfusi r
          LEFT JOIN permintaan_darah p ON p.id = r.permintaan_id
          WHERE r.id = ?
          LIMIT 1
        `;
        db.query(selectSql, [newId], (err3, newRows) => {
          if (err3) {
            console.error('DB error fetch new reaksi:', err3);
            return res.status(500).json({ success: true, status: true, message: 'Laporan disimpan, namun gagal mengambil data hasil', data: { id: newId } });
          }

          const data = (Array.isArray(newRows) && newRows[0]) ? newRows[0] : { id: newId };

          return res.json({
            success: true,
            status: true,
            message: 'Laporan reaksi transfusi berhasil disimpan',
            data
          });
        });
      });
    });

  } catch (ex) {
    console.error('Unhandled error POST /addData reaksi_transfusi:', ex);
    return res.status(500).json({ success: false, status: false, message: 'Server error' });
  }
});


// GET /api/v1/reaksi_transfusi/view?page=1&limit=10&cari_value=...
router.get('/view', (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  const cari = req.query.cari_value || '';
  const ruanganId = req.query.ruangan_id || (req.user && req.user.profile && req.user.profile.ruangan_id) || null;

  // Determine user type/role (support both naming conventions)
  const userProfile = req.user && req.user.profile ? req.user.profile : null;
  const userTipe = userProfile ? (Number(userProfile.stokdarah_konut || userProfile.role || 0)) : null;

  let where = " WHERE 1=1 ";
  const params = [];

  // filter ruangan
  if (ruanganId) {
    where += " AND p.ruangan_id = ? ";
    params.push(ruanganId);
  }

  // Hide draft records for tipe 1 and 2 (they should not see drafts)
  if (userTipe === 1 || userTipe === 2) {
    where += " AND r.status <> 'draft' ";
  }

  // filter pencarian
  if (cari) {
    where += " AND (r.jenis_reaksi LIKE ? OR r.petugas_pelapor LIKE ? OR p.nama_pasien LIKE ?) ";
    params.push(`%${cari}%`, `%${cari}%`, `%${cari}%`);
  }

  const sqlData = `
    SELECT 
      r.id,
      r.permintaan_id,
      r.jam_transfusi,
      r.jenis_reaksi,
      r.jam_terjadi,
      r.jam_dilaporkan,
      r.petugas_pelapor,
      r.tindakan,
      r.status,
      p.nama_pasien,
      p.tanggal_lahir,
      t.nama_ruangan,
      p.ruangan_id 
    FROM reaksi_transfusi r
    LEFT JOIN permintaan_darah p ON p.id = r.permintaan_id
    LEFT JOIN tenaga_medis t ON p.ruangan_id = t.id
    ${where}
    ORDER BY r.id DESC
    LIMIT ? OFFSET ?
  `;

  const sqlCount = `
    SELECT COUNT(*) AS total
    FROM reaksi_transfusi r
    LEFT JOIN permintaan_darah p ON p.id = r.permintaan_id
    ${where}
  `;

  // params for data query need pagination appended
  const paramsCount = params.slice();
  const paramsData = params.slice();
  paramsData.push(limit, offset);

  db.query(sqlCount, paramsCount, (err, countRows) => {
    if (err) {
      console.error("DB error COUNT view:", err);
      return res.status(500).json({ success: false, message: "Server error (count)" });
    }

    const total_data = countRows && countRows[0] ? Number(countRows[0].total) : 0;
    const total_pages = Math.ceil(total_data / limit) || 1;

    db.query(sqlData, paramsData, (err2, rows) => {
      if (err2) {
        console.error("DB error DATA view:", err2);
        return res.status(500).json({ success: false, message: "Server error (data)" });
      }

      return res.json({
        success: true,
        message: "Data berhasil diambil",
        data: rows || [],
        total_data,
        total_pages
      });
    });
  });
});


// POST /api/v1/reaksi_transfusi/:id/send
router.post('/:id/send', (req, res) => {
  const id = req.params.id;

  // optional: batasi hanya admin ruangan (role 3) boleh panggil
  // asumsi req.user.profile.role tersedia dan bernilai number/string '3'
  const userRole = req.user && req.user.profile && req.user.profile.stokdarah_konut;
  if (Number(userRole) !== 3) {
    return res.status(403).json({ success: false, message: 'Akses ditolak' });
  }

  const sql = `UPDATE reaksi_transfusi SET status = 'terkirim', updated_at = NOW() WHERE id = ? LIMIT 1`;
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error('DB error send reaksi_transfusi:', err);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
    if (!result || result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Data tidak ditemukan' });
    }

    // sukses
    return res.json({ success: true, message: 'Laporan berhasil dikirim ke UPD' });
  });
});


// POST /api/v1/reaksi_transfusi/pemeriksaan/add
router.post('/pemeriksaan/add', (req, res) => {
  try {
    // cek autentikasi + role (izinkan role 1 atau 2 = UPD)
    const profile = req.user && req.user.profile ? req.user.profile : null;
    if (!profile) {
      return res.status(401).json({ success: false, message: 'User tidak terautentikasi' });
    }
    const role = Number(profile.role || profile.stokdarah_konut || 0);
    if (role !== 1 && role !== 2) {
      return res.status(403).json({ success: false, message: 'Akses ditolak: hanya UPD yang boleh mengisi pemeriksaan' });
    }

    const body = req.body || {};

    // required fields minimal
    const reaksi_id = body.reaksi_id;
    const no_kantong = (body.no_kantong || '').toString().trim();
    const komponen_darah = (body.komponen_darah || '').toString().trim();

    if (!reaksi_id) {
      return res.status(400).json({ success: false, message: 'reaksi_id wajib diisi' });
    }
    if (!no_kantong) {
      return res.status(400).json({ success: false, message: 'no_kantong wajib diisi' });
    }
    if (!komponen_darah) {
      return res.status(400).json({ success: false, message: 'komponen_darah wajib diisi' });
    }

    // ambil field lain (boleh null)
    const asal_darah = body.asal_darah || null;
    const golongan_darah = body.golongan_darah || null;
    const uji_silang_serasi = body.uji_silang_serasi || null;
    const konfirm_gol_pasien = body.konfirm_gol_pasien || null;
    const konfirm_rhesus_pasien = body.konfirm_rhesus_pasien || null;
    const konfirm_gol_donor = body.konfirm_gol_donor || null;
    const konfirm_rhesus_donor = body.konfirm_rhesus_donor || null;
    const uji_silang_konfirmasi = body.uji_silang_konfirmasi || null;

    // pemeriksaan_at: terima format "YYYY-MM-DDTHH:MM" atau datetime string
    let pemeriksaan_at = body.pemeriksaan_at || null;
    if (pemeriksaan_at) {
      // ubah T -> space jika datang dari input datetime-local
      pemeriksaan_at = String(pemeriksaan_at).replace('T', ' ');
    }

    // Insert ke tabel pemeriksaan_pretransfusi
    const insertSql = `
      INSERT INTO pemeriksaan_pretransfusi
        (reaksi_id, asal_darah, no_kantong, komponen_darah, golongan_darah,
         uji_silang_serasi, konfirm_gol_pasien, konfirm_rhesus_pasien,
         konfirm_gol_donor, konfirm_rhesus_donor, uji_silang_konfirmasi, pemeriksaan_at, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;
    const params = [
      reaksi_id,
      asal_darah,
      no_kantong,
      komponen_darah,
      golongan_darah,
      uji_silang_serasi,
      konfirm_gol_pasien,
      konfirm_rhesus_pasien,
      konfirm_gol_donor,
      konfirm_rhesus_donor,
      uji_silang_konfirmasi,
      pemeriksaan_at
    ];

    db.query(insertSql, params, (err, result) => {
      if (err) {
        console.error('DB error insert pemeriksaan_pretransfusi:', err);
        return res.status(500).json({ success: false, message: 'Server error saat menyimpan pemeriksaan' });
      }

      const newId = result.insertId || null;

      // Setelah insert sukses -> update status reaksi_transfusi menjadi 'unduh'
      const updateSql = `UPDATE reaksi_transfusi SET status = 'unduh', updated_at = NOW() WHERE id = ? LIMIT 1`;
      db.query(updateSql, [reaksi_id], (errUp, upRes) => {
        if (errUp) {
          console.error('DB error update reaksi_transfusi status:', errUp);
          // walaupun update gagal, kita tetap kembalikan success untuk insert, tapi informasikan masalah update
          // lalu ambil row pemeriksaan yang baru untuk dikembalikan
          const sel = `
            SELECT p.*, r.jenis_reaksi, r.petugas_pelapor
            FROM pemeriksaan_pretransfusi p
            LEFT JOIN reaksi_transfusi r ON r.id = p.reaksi_id
            WHERE p.id = ? LIMIT 1
          `;
          return db.query(sel, [newId], (err2, rows) => {
            if (err2) {
              console.error('DB error fetch inserted pemeriksaan after failed update:', err2);
              return res.json({
                success: true,
                status: true,
                message: 'Pemeriksaan disimpan, namun gagal update status reaksi_transfusi',
                data: { id: newId }
              });
            }
            return res.json({
              success: true,
              status: true,
              message: 'Pemeriksaan disimpan, namun gagal update status reaksi_transfusi',
              data: rows[0] || { id: newId }
            });
          });
        }

        // kalau update berhasil, ambil row pemeriksaan dan juga status reaksi terkini untuk dikembalikan
        const sel2 = `
          SELECT p.*, r.jenis_reaksi, r.petugas_pelapor, r.status AS reaksi_status
          FROM pemeriksaan_pretransfusi p
          LEFT JOIN reaksi_transfusi r ON r.id = p.reaksi_id
          WHERE p.id = ? LIMIT 1
        `;
        db.query(sel2, [newId], (err3, rows3) => {
          if (err3) {
            console.error('DB error fetch inserted pemeriksaan after update:', err3);
            return res.json({
              success: true,
              status: true,
              message: 'Pemeriksaan disimpan dan status reaksi_transfusi diperbarui, namun gagal mengambil data hasil',
              data: { id: newId }
            });
          }

          return res.json({
            success: true,
            status: true,
            message: 'Pemeriksaan berhasil disimpan dan status reaksi_transfusi diperbarui menjadi "unduh"',
            data: rows3[0] || { id: newId }
          });
        });
      });
    });

  } catch (ex) {
    console.error('Unhandled error POST /pemeriksaan/add:', ex);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});


router.get('/pemeriksaan/view', (req, res) => {
  try {
    const reaksi_id = req.query.reaksi_id;
    if (!reaksi_id) {
      return res.status(400).json({ success: false, message: 'reaksi_id diperlukan' });
    }

    // ambil pemeriksaan terbaru untuk reaksi_id
    const sql = `
      SELECT p.*, r.jenis_reaksi, r.petugas_pelapor, r.status AS reaksi_status, p.created_at AS pemeriksaan_created
      FROM pemeriksaan_pretransfusi p
      LEFT JOIN reaksi_transfusi r ON r.id = p.reaksi_id
      WHERE p.reaksi_id = ?
      ORDER BY p.id DESC
      LIMIT 1
    `;

    db.query(sql, [reaksi_id], (err, rows) => {
      if (err) {
        console.error('DB error pemeriksaan/view:', err);
        return res.status(500).json({ success: false, message: 'Server error' });
      }
      if (!rows || rows.length === 0) {
        return res.json({ success: true, status: true, message: 'Tidak ada pemeriksaan', data: null });
      }
      return res.json({ success: true, status: true, message: 'Data pemeriksaan ditemukan', data: rows[0] });
    });
  } catch (ex) {
    console.error('Unhandled error GET /pemeriksaan/view:', ex);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});


router.get('/pemeriksaan/pdf', checkTokenSeetUser, isLoggedIn, (req, res) => {
  
  const profile = req.user && req.user.profile ? req.user.profile : null;
  const role = Number(profile?.stokdarah_konut || 0);

  if (role !== 1 && role !== 2 && role !== 3) {
    return res.status(403).json({ success: false, message: 'Akses ditolak' });
  }

  const reaksiId = req.query.reaksi_id;
  if (!reaksiId) {
    return res.status(400).json({ success: false, message: 'reaksi_id wajib' });
  }

  const sql = `
    SELECT 
      r.*,
      p.nama_pasien, p.nomor_rm, p.tanggal_lahir, p.alamat, p.nama_dokter,
      p.diagnosis_klinis,
      t.nama_ruangan,
      pr.id AS pemeriksaan_id,
      pr.no_kantong, pr.asal_darah, pr.komponen_darah, pr.golongan_darah,
      pr.uji_silang_serasi, pr.konfirm_gol_pasien, pr.konfirm_rhesus_pasien,
      pr.konfirm_gol_donor, pr.konfirm_rhesus_donor, pr.uji_silang_konfirmasi,
      r.created_at AS reaksi_created,
      kd.nama_komponen
    FROM reaksi_transfusi r
    LEFT JOIN permintaan_darah p ON p.id = r.permintaan_id
    LEFT JOIN pemeriksaan_pretransfusi pr ON pr.reaksi_id = r.id
    LEFT JOIN tenaga_medis t ON p.ruangan_id = t.id
    LEFT JOIN komponen_darah kd ON pr.komponen_darah = kd.id
    WHERE r.id = ? LIMIT 1
  `;

  db.query(sql, [reaksiId], async (err, rows) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Server error' });
    }
    if (!rows || rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Data tidak ditemukan' });
    }

    const data = rows[0];

    // Generate QR Code
    let qrcodeUrl = '';
    try {
      const qrData = `http://localhost:5088/api/v1/reaksi_transfusi/validate/${reaksiId}`;
      qrcodeUrl = await qrcode.toDataURL(qrData, {
        width: 80,
        margin: 1,
        color: { dark: '#000000', light: '#FFFFFF' }
      });
    } catch (qrErr) {
      qrcodeUrl = '';
    }
    data.qrcode_url = qrcodeUrl;

    try {
      const templatePath = path.join(__dirname, '../../../services/reaksiTransfusiTemplate.ejs');

      if (!fs.existsSync(templatePath)) {
        return res.status(500).json({ success: false, message: 'Template file tidak ditemukan' });
      }

      let kopImageUrl = '';
      const imagePath = path.join(__dirname, '../../../uploads/kop.png');
      if (fs.existsSync(imagePath)) {
        const imageBuffer = fs.readFileSync(imagePath);
        const base64Image = imageBuffer.toString('base64');
        if (base64Image && base64Image.length > 100) {
          kopImageUrl = `data:image/png;base64,${base64Image}`;
        }
      }

      const html = await ejs.renderFile(templatePath, {
        data,
        kopImageUrl,
        checkerName: (req.user && req.user.profile ? req.user.profile.name : '-')
      });

      if (!html || html.trim().length === 0) {
        return res.status(500).json({ success: false, message: 'HTML kosong, gagal generate PDF' });
      }

      const options = {
        format: 'A4',
        border: { 
            top: '10mm',     
            bottom: '10mm',  
            left: '10mm',    
            right: '10mm'    
        },
        type: 'pdf'
    };

      pdf.create(html, options).toBuffer((err, pdfBuffer) => {
        if (err) {
          return res.status(500).json({ success: false, message: 'Gagal generate PDF' });
        }

        if (!pdfBuffer || pdfBuffer.length === 0) {
          return res.status(500).json({ success: false, message: 'PDF kosong' });
        }

        // Kirim PDF langsung sebagai buffer
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename=reaksi_transfusi_${reaksiId}.pdf`);

        return res.send(pdfBuffer);
      });

    } catch (ex) {
      return res.status(500).json({ success: false, message: 'Gagal generate PDF: ' + ex.message });
    }
  });
});

module.exports = router;
