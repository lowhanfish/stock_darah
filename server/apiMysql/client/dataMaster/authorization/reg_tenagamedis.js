const express = require('express');
const router = express.Router();
const db = require('../../../../db/MySql/umum');
const bcrypt = require('bcryptjs');
var upload = require('../../../../db/multer/image');
const path = require('path');

router.post("/getview", (req, res) => {
    const { page_limit, data_ke, cari_value } = req.body;
  
    const limit = parseInt(page_limit) || 10;
    const offset = parseInt(data_ke) || 0;
    const search = cari_value ? `%${cari_value}%` : '%';
  
    const countSql = `
      SELECT COUNT(*) AS total FROM tenaga_medis tm
      JOIN users u ON tm.users_id = u.id
      WHERE tm.nama_lengkap LIKE ? OR u.username LIKE ? OR tm.no_str LIKE ? OR tm.jabatan_fungsional LIKE ?
    `;

    const dataSql = `
      SELECT 
        tm.id,
        tm.nama_lengkap,
        tm.nip,
        tm.nomor_induk_profesi,
        tm.jabatan_fungsional,
        tm.no_str,
        tm.masa_berlaku_str,
        tm.file_str,
        tm.email,
        tm.phone,
        tm.tempat_kerja,
        tm.alamat_praktik,
        u.username,
        u.id AS users_id
      FROM tenaga_medis tm
      JOIN users u ON tm.users_id = u.id
      WHERE tm.nama_lengkap LIKE ? OR u.username LIKE ? OR tm.no_str LIKE ? OR tm.jabatan_fungsional LIKE ?
      ORDER BY tm.created_at DESC
      LIMIT ? OFFSET ?
    `;
  
    db.query(countSql, [search, search, search, search], (err, countResult) => {
      if (err) {
        console.error("❌ Error count tenaga medis:", err);
        return res.status(500).json({ success: false, error: err.message });
      }
  
      const total_data = countResult[0].total;
  
      db.query(dataSql, [search, search, search, search, limit, offset], (err2, dataResult) => {
        if (err2) {
          console.error("❌ Error get tenaga medis:", err2);
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
  

router.post("/addTenagaMedis", upload.single('file_str'), async (req, res) => {
  try {
    const {
      username,
      password,
      nama_lengkap,
      nip,
      nomor_induk_profesi,
      jabatan_fungsional,
      no_str,
      masa_berlaku_str,
      email,
      phone,
      tempat_kerja,
      alamat_praktik
    } = req.body;


    // Validasi required fields
    if (!username || !password || !nama_lengkap || !nip || !nomor_induk_profesi || 
        !jabatan_fungsional || !no_str || !masa_berlaku_str) {
      return res.status(400).json({ 
        success: false, 
        message: "Semua field wajib harus diisi!" 
      });
    }

    // Validasi file STR
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: "File STR wajib diupload!" 
      });
    }

    const checkUserSql = `SELECT id FROM users WHERE username = ?`;
    db.query(checkUserSql, [username], async (err, results) => {
      if (err) {
        console.error("❌ Error cek username:", err);
        return res.status(500).json({ success: false, error: err.message });
      }

      if (results.length > 0) {
        return res.status(400).json({ 
          success: false, 
          message: "Username sudah digunakan!" 
        });
      }

      const hashedPassword = await bcrypt.hash(password.trim(), 12);

      const sqlUser = `
        INSERT INTO users (username, password, email, hp, nama, jabatan, stokdarah_konut, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
      `;

      db.query(
        sqlUser,
        [username, hashedPassword, email, phone, nama_lengkap, jabatan_fungsional, 2],
        (err, resultUser) => {
          if (err) {
            console.error("❌ Insert user error:", err);
            return res.status(500).json({ success: false, error: err.message });
          }

          const users_id = resultUser.insertId;

          // PERBAIKAN: Simpan hanya filename, bukan full path
          const file_str = req.file.filename; // Gunakan filename bukan path

          // Insert ke tabel tenaga_medis
          const sqlTenagaMedis = `
            INSERT INTO tenaga_medis (
              users_id, 
              nama_lengkap, 
              nip, 
              nomor_induk_profesi, 
              jabatan_fungsional, 
              no_str, 
              masa_berlaku_str, 
              file_str,
              email, 
              phone, 
              tempat_kerja, 
              alamat_praktik,
              created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
          `;

          db.query(
            sqlTenagaMedis,
            [
              users_id,
              nama_lengkap,
              nip,
              nomor_induk_profesi,
              jabatan_fungsional,
              no_str,
              masa_berlaku_str,
              file_str, 
              email,
              phone,
              tempat_kerja,
              alamat_praktik
            ],
            (err2, resultTenagaMedis) => {
              if (err2) {
                console.error("❌ Insert tenaga medis error:", err2);
                
                const deleteUserSql = `DELETE FROM users WHERE id = ?`;
                db.query(deleteUserSql, [users_id]);
                
                return res.status(500).json({ success: false, error: err2.message });
              }

            //   console.log("✅ Tenaga medis berhasil ditambahkan");
              res.json({
                success: true,
                message: "Tenaga medis berhasil ditambahkan 🎉",
                users_id,
                tenaga_medis_id: resultTenagaMedis.insertId,
                data: {
                  nama_lengkap,
                  nip,
                  username,
                  file_str: file_str // Sekarang hanya filename
                }
              });
            }
          );
        }
      );
    });

  } catch (error) {
    console.error("🔥 Error tambah tenaga medis:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;