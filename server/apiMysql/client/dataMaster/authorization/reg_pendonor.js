const express = require('express');
const router = express.Router();
const db = require('../../../../db/MySql/umum');
const bcrypt = require('bcryptjs');
var upload = require('../../../../db/multer/image');
const path = require('path');
const fs = require('fs');

router.get('/kabupaten', (req, res) => {
  const provinsiId = 74; 
  const sql = `
    SELECT kabupaten_id AS id, nama_kabupaten AS label
    FROM master_kabupaten
    WHERE provinsi_id = ?
    ORDER BY nama_kabupaten ASC
  `;
  db.query(sql, [provinsiId], (err, results) => {
    if (err) {
      console.error('❌ Error fetching kabupaten:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
    res.json({
      success: true,
      data: results
    });
  });
});

router.get('/kecamatan', (req, res) => {
  const kabupatenId = req.query.kabupaten_id;
  if (!kabupatenId) {
    return res.status(400).json({ success: false, error: 'kabupaten_id is required' });
  }
  const sql = `
    SELECT kecamatan_id AS id, nama_kecamatan AS label
    FROM master_kecamatan
    WHERE kabupaten_id = ?
    ORDER BY nama_kecamatan ASC
  `;
  db.query(sql, [kabupatenId], (err, results) => {
    if (err) {
      console.error('❌ Error fetching kecamatan:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
    res.json({
      success: true,
      data: results
    });
  });
});

router.get('/deskel', (req, res) => {
  const kecamatanId = req.query.kecamatan_id;
  if (!kecamatanId) {
    return res.status(400).json({ success: false, error: 'kecamatan_id is required' });
  }
  const sql = `
    SELECT des_kel_id AS id, nama_des_kel AS label
    FROM master_des_kel
    WHERE kecamatan_id = ?
    ORDER BY nama_des_kel ASC
  `;
  db.query(sql, [kecamatanId], (err, results) => {
    if (err) {
      console.error('❌ Error fetching desa/kelurahan:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
    res.json({
      success: true,
      data: results
    });
  });
});

router.post("/getview", (req, res) => {
  const { page_limit, data_ke, cari_value } = req.body;

  const limit = parseInt(page_limit) || 10;
  const offset = parseInt(data_ke) || 0;
  const search = cari_value ? `%${cari_value}%` : '%';


  const countSql = `
    SELECT COUNT(*) AS total FROM pendonor_darah pd
    JOIN users u ON pd.users_id = u.id
    WHERE pd.nama_lengkap LIKE ? 
       OR u.username LIKE ? 
       OR pd.golongan_darah LIKE ? 
       OR pd.no_hp LIKE ?
       OR pd.email LIKE ?
  `;

  const dataSql = `
    SELECT 
      pd.id,
      pd.nama_lengkap,
      pd.tanggal_lahir,
      pd.jenis_kelamin,
      pd.golongan_darah,
      pd.rhesus,
      pd.kabupaten_id,
      mkab.nama_kabupaten,
      pd.kecamatan_id,
      mkec.nama_kecamatan,
      pd.des_kel_id,
      mdkel.nama_des_kel,
      pd.alamat,
      pd.email,
      pd.no_hp,
      pd.riwayat_penyakit,
      pd.terakhir_donor,
      pd.stokdarah_konut,
      pd.bersedia_dipublikasikan,
      pd.foto_profil,
      pd.dokumen_pendukung,
      pd.status_verifikasi,
      u.username,
      u.id AS users_id
    FROM pendonor_darah pd
    JOIN users u ON pd.users_id = u.id
    LEFT JOIN master_kabupaten mkab ON pd.kabupaten_id = mkab.kabupaten_id
    LEFT JOIN master_kecamatan mkec ON pd.kecamatan_id = mkec.kecamatan_id
    LEFT JOIN master_des_kel mdkel ON pd.des_kel_id = mdkel.des_kel_id
    WHERE pd.nama_lengkap LIKE ? 
       OR u.username LIKE ? 
       OR pd.golongan_darah LIKE ? 
       OR pd.no_hp LIKE ?
       OR pd.email LIKE ?
    ORDER BY pd.created_at DESC
    LIMIT ? OFFSET ?
  `;

  // Eksekusi query count
  db.query(countSql, [search, search, search, search, search], (err, countResult) => {
      if (err) {
          console.error("❌ Error count pendonor:", err);
          return res.status(500).json({ success: false, error: err.message });
      }

      const total_data = countResult[0].total;

      // Eksekusi query data
      db.query(dataSql, [search, search, search, search, search, limit, offset], (err2, dataResult) => {
          if (err2) {
              console.error("❌ Error get pendonor:", err2);
              return res.status(500).json({ success: false, error: err2.message });
          }

          res.json({
              success: true,
              data: dataResult,
              jml_data: dataResult.length,
              total_data
          });
      });
  });
});

router.post("/addData", upload.fields([
  { name: 'foto_profil', maxCount: 1 },
  { name: 'dokumen_pendukung', maxCount: 1 }
]), async (req, res) => {
  try {
    const {
      username,
      password,
      nama_lengkap,
      tanggal_lahir,
      jenis_kelamin,
      golongan_darah,
      rhesus,
      kabupaten_id,
      kecamatan_id,
      des_kel_id,
      alamat,
      email,
      no_hp,
      riwayat_penyakit,
      terakhir_donor,
      stokdarah_konut,
      bersedia_dipublikasikan
    } = req.body;

    // Validasi required fields (seperti sebelumnya)
    if (!username || !password || !nama_lengkap || !tanggal_lahir || !jenis_kelamin || !golongan_darah) {
      return res.status(400).json({
        success: false,
        message: "Field wajib harus diisi! (username, password, nama lengkap, tanggal lahir, jenis kelamin, golongan darah)"
      });
    }

    // Validasi username & password (seperti sebelumnya)
    if (username.trim().length < 6) {
      return res.status(400).json({ success: false, message: 'Username harus minimal 6 karakter' });
    }
    if (password.trim().length < 6) {
      return res.status(400).json({ success: false, message: 'Password harus minimal 6 karakter' });
    }

    // ========== NORMALISASI DATA UNTUK HINDARI ER_DATA_TOO_LONG ==========
    // Trim semua string dan batasi panjang sesuai DB schema
    const nama_lengkap_clean = nama_lengkap.trim().substring(0, 255);  // Max sesuai DB
    const alamat_clean = alamat ? alamat.trim().substring(0, 255) : null;
    const email_clean = email ? email.trim().substring(0, 150) : null;
    const no_hp_clean = no_hp ? no_hp.trim().substring(0, 25) : null;
    const riwayat_penyakit_clean = riwayat_penyakit ? riwayat_penyakit.trim() : null;  // TEXT, no limit ketat

    // Golongan darah: Trim & validasi (VARCHAR(10), tapi batasi 2 char max untuk aman)
    let golongan_darah_clean = golongan_darah.trim();
    const validGolongan = ['A', 'B', 'AB', 'O'];
    if (!validGolongan.includes(golongan_darah_clean)) {
      return res.status(400).json({
        success: false,
        message: `Golongan darah tidak valid. Pilih salah satu: ${validGolongan.join(', ')} (1-2 huruf saja)`
      });
    }
    if (golongan_darah_clean.length > 2) {  // Potong jika aneh (misal 'AB ')
      golongan_darah_clean = golongan_darah_clean.substring(0, 2);
      console.warn('⚠️ Golongan darah dipotong: ', golongan_darah_clean);
    }

    // Rhesus: ENUM('+','-') atau NULL (jika kosong, set NULL)
    let rhesus_clean = rhesus ? rhesus.trim() : null;
    if (rhesus_clean) {
      const validRhesus = ['+', '-'];
      if (!validRhesus.includes(rhesus_clean)) {
        return res.status(400).json({
          success: false,
          message: `Rhesus tidak valid. Pilih '+' atau '-' (atau kosongkan jika tidak tahu)`
        });
      }
      // ENUM hanya 1 char, potong jika >1
      if (rhesus_clean.length > 1) {
        rhesus_clean = rhesus_clean.substring(0, 1);
        console.warn('⚠️ Rhesus dipotong: ', rhesus_clean);
      }
    }

    // Jenis kelamin: Trim & validasi (VARCHAR(50), tapi frontend kirim 'L'/'P')
    let jenis_kelamin_clean = jenis_kelamin.trim();
    const validJenisKelamin = ['L', 'P'];  // Sesuai frontend value
    if (!validJenisKelamin.includes(jenis_kelamin_clean)) {
      return res.status(400).json({
        success: false,
        message: `Jenis kelamin tidak valid. Pilih 'L' (Laki-laki) atau 'P' (Perempuan)`
      });
    }
    if (jenis_kelamin_clean.length > 1) {
      jenis_kelamin_clean = jenis_kelamin_clean.substring(0, 1);
      console.warn('⚠️ Jenis kelamin dipotong: ', jenis_kelamin_clean);
    }

    // Stokdarah_konut: Pastikan integer (INT(2), 0-99)
    const stokdarah_konut_clean = stokdarah_konut ? parseInt(stokdarah_konut) : 4;
    if (isNaN(stokdarah_konut_clean) || stokdarah_konut_clean < 0 || stokdarah_konut_clean > 99) {
      return res.status(400).json({
        success: false,
        message: 'Stok darah konut tidak valid (harus 0-99, default 4)'
      });
    }

    // Bersedia dipublikasikan: TINYINT(1), 0 atau 1
    const bersedia_dipublikasikan_clean = bersedia_dipublikasikan ? parseInt(bersedia_dipublikasikan) : 1;
    if (![0, 1].includes(bersedia_dipublikasikan_clean)) {
      return res.status(400).json({
        success: false,
        message: 'Bersedia dipublikasikan harus 0 (tidak) atau 1 (ya)'
      });
    }


    // Cek username unik (seperti sebelumnya)
    const checkUserSql = `SELECT id FROM users WHERE username = ?`;
    db.query(checkUserSql, [username.trim()], async (err, results) => {
      if (err) {
        console.error("❌ Error cek username:", err);
        return res.status(500).json({ success: false, error: err.message });
      }
      if (results.length > 0) {
        return res.status(400).json({ success: false, message: "Username sudah digunakan!" });
      }

      // Hash password (seperti sebelumnya)
      const hashedPassword = await bcrypt.hash(password.trim(), 12);

      // Insert users (seperti sebelumnya, gunakan email_clean, no_hp_clean, dll.)
      const sqlUser  = `
        INSERT INTO users (username, password, email, hp, nama, jabatan, stokdarah_konut, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
      `;
      const userJabatan = 'Pendonor';
      db.query(sqlUser , [username.trim(), hashedPassword, email_clean, no_hp_clean, nama_lengkap_clean, userJabatan, stokdarah_konut_clean], (err, resultUser ) => {
        if (err) {
          console.error("❌ Insert user error:", err);
          return res.status(500).json({ success: false, error: err.message });
        }

        const users_id = resultUser .insertId;

        // Handle files (seperti sebelumnya)
        let foto_profil = null;
        let dokumen_pendukung = null;
        if (req.files) {
          if (req.files['foto_profil'] && req.files['foto_profil'][0]) {
            foto_profil = req.files['foto_profil'][0].filename;  // Hanya filename
          }
          if (req.files['dokumen_pendukung'] && req.files['dokumen_pendukung'][0]) {
            dokumen_pendukung = req.files['dokumen_pendukung'][0].filename;
          }
        }

        const pendonorData = [
          users_id,
          nama_lengkap_clean,
          tanggal_lahir,
          jenis_kelamin_clean,
          golongan_darah_clean,
          rhesus_clean,  // NULL jika kosong
          kabupaten_id ? parseInt(kabupaten_id) : null,
          kecamatan_id ? parseInt(kecamatan_id) : null,
          des_kel_id ? parseInt(des_kel_id) : null,
          alamat_clean,
          email_clean,
          no_hp_clean,
          riwayat_penyakit_clean,
          terakhir_donor || null, 
          stokdarah_konut_clean,
          bersedia_dipublikasikan_clean,
          foto_profil,
          dokumen_pendukung,
          new Date()  // created_at
        ];

        // Insert pendonor_darah (seperti sebelumnya, tapi tambah status_verifikasi default 'active')
        const sqlPendonor = `
          INSERT INTO pendonor_darah (
            users_id, nama_lengkap, tanggal_lahir, jenis_kelamin, golongan_darah, rhesus,
            kabupaten_id, kecamatan_id, des_kel_id, alamat, email, no_hp,
            riwayat_penyakit, terakhir_donor, stokdarah_konut, bersedia_dipublikasikan,
            foto_profil, dokumen_pendukung, created_at, status_verifikasi
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
        `;

        db.query(sqlPendonor, pendonorData, (err2, resultPendonor) => {
          if (err2) {
            console.error("❌ Insert pendonor_darah error:", err2);
            console.error("SQL Error details:", err2.sqlMessage);  // Log detail error
            // Rollback users
            const deleteUserSql = `DELETE FROM users WHERE id = ?`;
            db.query(deleteUserSql, [users_id]);
            return res.status(500).json({ success: false, error: err2.message });
          }

          res.json({
            success: true,
            message: "Pendonor berhasil ditambahkan 🎉",
            users_id,
            pendonor_id: resultPendonor.insertId,
            data: { nama_lengkap: nama_lengkap_clean, golongan_darah: golongan_darah_clean }
          });
        });
      });
    });

  } catch (error) {
    console.error("🔥 Error tambah pendonor:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});


module.exports = router;