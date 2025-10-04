const express = require('express');
const router = express.Router();
const db = require('../../../../db/MySql/umum'); // Asumsi path ke koneksi DB sama
const bcrypt = require('bcryptjs');
const upload = require('../../../../db/multer/image'); // Asumsi path ke multer sama
const path = require('path');
const fs = require('fs');

// Endpoint untuk mendapatkan daftar admin BDRS dengan pagination dan pencarian
router.post("/getview", (req, res) => {
  const { page_limit, data_ke, cari_value } = req.body;

  const limit = parseInt(page_limit) || 10;
  const offset = parseInt(data_ke) || 0;
  const search = cari_value ? `%${cari_value}%` : '%';

  // Query untuk menghitung total data
  const countSql = `
    SELECT COUNT(*) AS total FROM admin_bdrs ab
    JOIN users u ON ab.users_id = u.id
    WHERE ab.nama_lengkap LIKE ? 
       OR ab.nik LIKE ?
       OR ab.no_str LIKE ?
       OR ab.jabatan_fungsional LIKE ?
       OR ab.no_hp LIKE ?
       OR ab.email LIKE ?
       OR u.username LIKE ?
  `;

  // Query untuk mendapatkan data admin BDRS
  const dataSql = `
    SELECT 
      ab.id,
      ab.nama_lengkap,
      ab.nik,
      ab.no_str,
      ab.masa_berlaku_str,
      ab.jabatan_fungsional,
      ab.no_hp,
      ab.email,
      ab.foto_profil,
      ab.surat_tugas,
      ab.file_str,
      ab.status_verifikasi,
      u.username,
      u.id AS users_id
    FROM admin_bdrs ab
    JOIN users u ON ab.users_id = u.id
    WHERE ab.nama_lengkap LIKE ? 
       OR ab.nik LIKE ?
       OR ab.no_str LIKE ?
       OR ab.jabatan_fungsional LIKE ?
       OR ab.no_hp LIKE ?
       OR ab.email LIKE ?
       OR u.username LIKE ?
    ORDER BY ab.created_at DESC
    LIMIT ? OFFSET ?
  `;

  db.query(countSql, [search, search, search, search, search, search, search], (err, countResult) => {
    if (err) {
      console.error("❌ Error count admin BDRS:", err);
      return res.status(500).json({ success: false, error: err.message });
    }

    const total_data = countResult[0].total;

    db.query(dataSql, [search, search, search, search, search, search, search, limit, offset], (err2, dataResult) => {
      if (err2) {
        console.error("❌ Error get admin BDRS:", err2);
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

// Endpoint untuk menambahkan data admin BDRS baru
router.post("/addAdminBdrs", upload.fields([
  { name: 'foto_profil', maxCount: 1 },
  { name: 'surat_tugas', maxCount: 1 },
  { name: 'file_str', maxCount: 1 }
]), async (req, res) => {
  try {
    const {
      username,
      password,
      nama_lengkap,
      nik,
      no_str,
      masa_berlaku_str,
      jabatan_fungsional,
      no_hp,
      email
    } = req.body;

    // Validasi required fields
    if (!username || !password || !nama_lengkap || !nik || !no_str || !masa_berlaku_str || !jabatan_fungsional || !no_hp) {
      return res.status(400).json({
        success: false,
        message: "Semua field wajib harus diisi! (username, password, nama lengkap, NIK, No STR, Masa Berlaku STR, Jabatan Fungsional, No HP)"
      });
    }

    // Validasi username & password
    if (username.trim().length < 6) {
      return res.status(400).json({ success: false, message: 'Username harus minimal 6 karakter' });
    }
    if (password.trim().length < 6) {
      return res.status(400).json({ success: false, message: 'Password harus minimal 6 karakter' });
    }

    // Validasi NIK
    if (!/^\d{16}$/.test(nik)) {
      return res.status(400).json({
        success: false,
        message: "NIK tidak valid. Harus berupa 16 digit angka."
      });
    }

    // Validasi file uploads
    if (!req.files || !req.files['foto_profil'] || !req.files['surat_tugas'] || !req.files['file_str']) {
      return res.status(400).json({
        success: false,
        message: "Foto Profil, Surat Tugas, dan File STR wajib diupload!"
      });
    }

    const nama_lengkap_clean = nama_lengkap.trim().substring(0, 255);
    const nik_clean = nik.trim();
    const no_str_clean = no_str.trim().substring(0, 50);
    const jabatan_fungsional_clean = jabatan_fungsional.trim().substring(0, 100);
    const no_hp_clean = no_hp.trim().substring(0, 25);
    const email_clean = email ? email.trim().substring(0, 150) : null;

    // Cek username unik
    const checkUserSql = `SELECT id FROM users WHERE username = ?`;
    db.query(checkUserSql, [username.trim()], async (err, results) => {
      if (err) {
        console.error("❌ Error cek username:", err);
        return res.status(500).json({ success: false, error: err.message });
      }
      if (results.length > 0) {
        return res.status(400).json({ success: false, message: "Username sudah digunakan!" });
      }

      // Cek NIK unik di admin_bdrs
      const checkNikSql = `SELECT id FROM admin_bdrs WHERE nik = ?`;
      db.query(checkNikSql, [nik_clean], async (nikErr, nikResults) => {
        if (nikErr) {
          console.error("❌ Error cek NIK:", nikErr);
          return res.status(500).json({ success: false, error: nikErr.message });
        }
        if (nikResults.length > 0) {
          return res.status(400).json({ success: false, message: "NIK sudah digunakan oleh admin lain!" });
        }

        // Cek No STR unik di admin_bdrs
        const checkStrSql = `SELECT id FROM admin_bdrs WHERE no_str = ?`;
        db.query(checkStrSql, [no_str_clean], async (strErr, strResults) => {
          if (strErr) {
            console.error("❌ Error cek No STR:", strErr);
            return res.status(500).json({ success: false, error: strErr.message });
          }
          if (strResults.length > 0) {
            return res.status(400).json({ success: false, message: "No STR sudah digunakan oleh admin lain!" });
          }

          const hashedPassword = await bcrypt.hash(password.trim(), 12);

          // Insert ke tabel users
          const sqlUser = `
            INSERT INTO users (username, password, email, hp, nama, jabatan, stokdarah_konut, createdAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
          `;
          const userJabatan = 'Admin BDRS';
          const stokdarah_konut_default = 2; 

          db.query(sqlUser, [username.trim(), hashedPassword, email_clean, no_hp_clean, nama_lengkap_clean, userJabatan, stokdarah_konut_default], (err, resultUser) => {
            if (err) {
              console.error("❌ Insert user error:", err);
              return res.status(500).json({ success: false, error: err.message });
            }

            const users_id = resultUser.insertId;

            const foto_profil = req.files['foto_profil'][0].filename;
            const surat_tugas = req.files['surat_tugas'][0].filename;
            const file_str = req.files['file_str'][0].filename;

            // Insert ke tabel admin_bdrs
            const sqlAdminBdrs = `
              INSERT INTO admin_bdrs (
                users_id, nama_lengkap, nik, no_str, masa_berlaku_str, jabatan_fungsional,
                no_hp, email, foto_profil, surat_tugas, file_str, created_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
            `;

            const adminBdrsData = [
              users_id,
              nama_lengkap_clean,
              nik_clean,
              no_str_clean,
              masa_berlaku_str,
              jabatan_fungsional_clean,
              no_hp_clean,
              email_clean,
              foto_profil,
              surat_tugas,
              file_str
            ];

            db.query(sqlAdminBdrs, adminBdrsData, (err2, resultAdminBdrs) => {
              if (err2) {
                console.error("❌ Insert admin_bdrs error:", err2);
                console.error("SQL Error details:", err2.sqlMessage);
                // Rollback users dan hapus file yang sudah terupload
                const deleteUserSql = `DELETE FROM users WHERE id = ?`;
                db.query(deleteUserSql, [users_id]);
                if (foto_profil) fs.unlink(path.join(__dirname, '../../../../uploads', foto_profil), (unlinkErr) => { if (unlinkErr) console.warn('⚠️ Gagal hapus foto profil:', unlinkErr); });
                if (surat_tugas) fs.unlink(path.join(__dirname, '../../../../uploads', surat_tugas), (unlinkErr) => { if (unlinkErr) console.warn('⚠️ Gagal hapus surat tugas:', unlinkErr); });
                if (file_str) fs.unlink(path.join(__dirname, '../../../../uploads', file_str), (unlinkErr) => { if (unlinkErr) console.warn('⚠️ Gagal hapus file str:', unlinkErr); });

                return res.status(500).json({ success: false, error: err2.message });
              }

              res.json({
                success: true,
                message: "Admin BDRS berhasil ditambahkan 🎉",
                users_id,
                admin_bdrs_id: resultAdminBdrs.insertId,
                data: { nama_lengkap: nama_lengkap_clean, username: username.trim() }
              });
            }); // <-- Ini adalah penutup untuk db.query(sqlAdminBdrs, ...)
          }); // <-- Ini adalah penutup untuk db.query(sqlUser, ...)
        }); // <-- Ini adalah penutup untuk db.query(checkStrSql, ...)
      }); // <-- Ini adalah penutup untuk db.query(checkNikSql, ...)
    }); // <-- Ini adalah penutup untuk db.query(checkUserSql, ...)

  } catch (error) {
    console.error("🔥 Error tambah admin BDRS:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Endpoint untuk mengedit data admin BDRS
router.post("/editAdminBdrs", upload.fields([
  { name: 'foto_profil', maxCount: 1 },
  { name: 'surat_tugas', maxCount: 1 },
  { name: 'file_str', maxCount: 1 }
]), async (req, res) => {
  try {
    const {
      id,
      users_id,
      username,
      nama_lengkap,
      nik,
      no_str,
      masa_berlaku_str,
      jabatan_fungsional,
      no_hp,
      email
    } = req.body;

    if (!id || !users_id) {
      return res.status(400).json({ success: false, message: 'ID admin BDRS dan users_id wajib diisi untuk update.' });
    }

    const nama_lengkap_clean = nama_lengkap ? nama_lengkap.trim().substring(0, 255) : null;
    const nik_clean = nik ? nik.trim() : null;
    const no_str_clean = no_str ? no_str.trim().substring(0, 50) : null;
    const jabatan_fungsional_clean = jabatan_fungsional ? jabatan_fungsional.trim().substring(0, 100) : null;
    const no_hp_clean = no_hp ? no_hp.trim().substring(0, 25) : null;
    const email_clean = email ? email.trim().substring(0, 150) : null;

    // Validasi NIK jika diisi
    if (nik_clean && !/^\d{16}$/.test(nik_clean)) {
      return res.status(400).json({
        success: false,
        message: "NIK tidak valid. Harus berupa 16 digit angka (atau kosongkan jika tidak diubah)"
      });
    }

    const getOldFilesSql = 'SELECT foto_profil, surat_tugas, file_str, nik, no_str FROM admin_bdrs WHERE id = ?';
    db.query(getOldFilesSql, [id], (err, results) => {
      if (err) {
        console.error('❌ Error fetching old admin BDRS files:', err);
        return res.status(500).json({ success: false, error: err.message });
      }
      if (results.length === 0) {
        return res.status(404).json({ success: false, message: 'Data admin BDRS tidak ditemukan.' });
      }

      const oldData = results[0];
      const existingNik = oldData.nik;
      const existingNoStr = oldData.no_str;

      // Check NIK uniqueness if changed
      if (nik_clean && nik_clean !== existingNik) {
        const checkNikSql = `SELECT id FROM admin_bdrs WHERE nik = ? AND id != ?`;
        db.query(checkNikSql, [nik_clean, id], (nikErr, nikResults) => {
          if (nikErr) {
            console.error("❌ Error cek NIK uniqueness:", nikErr);
            return res.status(500).json({ success: false, error: nikErr.message });
          }
          if (nikResults.length > 0) {
            return res.status(400).json({ success: false, message: "NIK sudah digunakan oleh admin lain!" });
          }
          // If unique, proceed to check No STR
          checkNoStrUniqueness(oldData);
        });
      } else {
        // If NIK not changed or not provided, proceed to check No STR
        checkNoStrUniqueness(oldData);
      }

      function checkNoStrUniqueness(oldData) {
        if (no_str_clean && no_str_clean !== existingNoStr) {
          const checkStrSql = `SELECT id FROM admin_bdrs WHERE no_str = ? AND id != ?`;
          db.query(checkStrSql, [no_str_clean, id], (strErr, strResults) => {
            if (strErr) {
              console.error("❌ Error cek No STR uniqueness:", strErr);
              return res.status(500).json({ success: false, error: strErr.message });
            }
            if (strResults.length > 0) {
              return res.status(400).json({ success: false, message: "No STR sudah digunakan oleh admin lain!" });
            }
            // If unique, proceed to update
            proceedToUpdate(oldData);
          });
        } else {
          // If No STR not changed or not provided, proceed to update
          proceedToUpdate(oldData);
        }
      }

      function proceedToUpdate(oldData) {
        let oldFotoProfil = oldData.foto_profil;
        let oldSuratTugas = oldData.surat_tugas;
        let oldFileStr = oldData.file_str;

        let newFotoProfil = oldFotoProfil;
        let newSuratTugas = oldSuratTugas;
        let newFileStr = oldFileStr;

        // Handle foto_profil update
        if (req.files && req.files['foto_profil'] && req.files['foto_profil'][0]) {
          newFotoProfil = req.files['foto_profil'][0].filename;
          if (oldFotoProfil && oldFotoProfil !== newFotoProfil) {
            const oldFilePath = path.join(__dirname, '../../../../uploads', oldFotoProfil);
            fs.unlink(oldFilePath, (unlinkErr) => {
              if (unlinkErr) console.warn('⚠️ Gagal hapus foto profil lama:', unlinkErr);
            });
          }
        }

        // Handle surat_tugas update
        if (req.files && req.files['surat_tugas'] && req.files['surat_tugas'][0]) {
          newSuratTugas = req.files['surat_tugas'][0].filename;
          if (oldSuratTugas && oldSuratTugas !== newSuratTugas) {
            const oldFilePath = path.join(__dirname, '../../../../uploads', oldSuratTugas);
            fs.unlink(oldFilePath, (unlinkErr) => {
              if (unlinkErr) console.warn('⚠️ Gagal hapus surat tugas lama:', unlinkErr);
            });
          }
        }

        // Handle file_str update
        if (req.files && req.files['file_str'] && req.files['file_str'][0]) {
          newFileStr = req.files['file_str'][0].filename;
          if (oldFileStr && oldFileStr !== newFileStr) {
            const oldFilePath = path.join(__dirname, '../../../../uploads', oldFileStr);
            fs.unlink(oldFilePath, (unlinkErr) => {
              if (unlinkErr) console.warn('⚠️ Gagal hapus file STR lama:', unlinkErr);
            });
          }
        }

        const updateAdminBdrsSql = `
          UPDATE admin_bdrs SET
            nama_lengkap = ?,
            nik = ?,
            no_str = ?,
            masa_berlaku_str = ?,
            jabatan_fungsional = ?,
            no_hp = ?,
            email = ?,
            foto_profil = ?,
            surat_tugas = ?,
            file_str = ?
          WHERE id = ?
        `;

        const adminBdrsData = [
          nama_lengkap_clean,
          nik_clean,
          no_str_clean,
          masa_berlaku_str,
          jabatan_fungsional_clean,
          no_hp_clean,
          email_clean,
          newFotoProfil,
          newSuratTugas,
          newFileStr,
          id
        ];

        db.query(updateAdminBdrsSql, adminBdrsData, (updateErr) => {
          if (updateErr) {
            console.error('❌ Error updating admin BDRS:', updateErr);
            return res.status(500).json({ success: false, error: updateErr.message });
          }

          if (username) {
            const checkUsernameSql = `SELECT id FROM users WHERE username = ? AND id != ?`;
            db.query(checkUsernameSql, [username.trim(), users_id], (checkErr, checkResults) => {
              if (checkErr) {
                console.error("❌ Error checking username uniqueness:", checkErr);
                return res.status(500).json({ success: false, error: checkErr.message });
              }
              if (checkResults.length > 0) {
                return res.status(400).json({ success: false, message: "Username sudah digunakan oleh user lain!" });
              }

              const updateUserSql = 'UPDATE users SET username = ?, email = ?, hp = ?, nama = ? WHERE id = ?';
              db.query(updateUserSql, [username.trim(), email_clean, no_hp_clean, nama_lengkap_clean, users_id], (userErr) => {
                if (userErr) {
                  console.error('❌ Error updating user data:', userErr);
                  return res.status(500).json({ success: false, error: userErr.message });
                }
                res.json({ success: true, message: 'Data admin BDRS berhasil diupdate.' });
              });
            });
          } else {
            const updateUserSql = 'UPDATE users SET email = ?, hp = ?, nama = ? WHERE id = ?';
            db.query(updateUserSql, [email_clean, no_hp_clean, nama_lengkap_clean, users_id], (userErr) => {
              if (userErr) {
                console.error('❌ Error updating user data (no username change):', userErr);
                return res.status(500).json({ success: false, error: userErr.message });
              }
              res.json({ success: true, message: 'Data admin BDRS berhasil diupdate.' });
            });
          }
        });
      }
    });

  } catch (error) {
    console.error("🔥 Error edit admin BDRS:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Endpoint untuk menghapus data admin BDRS
router.post('/removeAdminBdrs', (req, res) => {
  const { id, users_id } = req.body;

  if (!id || !users_id) {
    return res.status(400).json({ success: false, message: 'ID admin BDRS dan users_id wajib diisi.' });
  }

  const getOldFilesSql = 'SELECT foto_profil, surat_tugas, file_str FROM admin_bdrs WHERE id = ?';
  db.query(getOldFilesSql, [id], (err, results) => {
    if (err) {
      console.error('❌ Error fetching old admin BDRS files for deletion:', err);
      return res.status(500).json({ success: false, message: 'Database error saat mengambil file lama.' });
    }
    if (results.length === 0) {
      return res.status(404).json({ success: false, message: 'Data admin BDRS tidak ditemukan.' });
    }

    const oldFotoProfil = results[0].foto_profil;
    const oldSuratTugas = results[0].surat_tugas;
    const oldFileStr = results[0].file_str;

    const deleteAdminBdrsSql = 'DELETE FROM admin_bdrs WHERE id = ?';
    db.query(deleteAdminBdrsSql, [id], (delErr) => {
      if (delErr) {
        console.error('❌ Error deleting admin_bdrs:', delErr);
        return res.status(500).json({ success: false, message: 'Gagal menghapus data admin BDRS.' });
      }

      const deleteUserSql = 'DELETE FROM users WHERE id = ?';
      db.query(deleteUserSql, [users_id], (userErr) => {
        if (userErr) {
          console.error('❌ Error deleting user associated with admin BDRS:', userErr);
          // Lanjutkan proses meskipun ada error di user, karena data admin BDRS sudah terhapus
        }
        // Hapus file-file terkait
        if (oldFotoProfil) {
          const filePath = path.join(__dirname, '../../../../uploads', oldFotoProfil);
          fs.unlink(filePath, (unlinkErr) => {
            if (unlinkErr) console.warn('⚠️ Gagal hapus foto profil lama:', unlinkErr);
          });
        }
        if (oldSuratTugas) {
          const filePath = path.join(__dirname, '../../../../uploads', oldSuratTugas);
          fs.unlink(filePath, (unlinkErr) => {
            if (unlinkErr) console.warn('⚠️ Gagal hapus surat tugas lama:', unlinkErr);
          });
        }
        if (oldFileStr) {
          const filePath = path.join(__dirname, '../../../../uploads', oldFileStr);
          fs.unlink(filePath, (unlinkErr) => {
            if (unlinkErr) console.warn('⚠️ Gagal hapus file STR lama:', unlinkErr);
          });
        }

        return res.json({ success: true, message: 'Data admin BDRS berhasil dihapus.' });
      });
    });
  });
});

// Endpoint untuk mengubah password admin BDRS
router.post('/editPasswordAdminBdrs', async (req, res) => {
  const { users_id, password } = req.body;
  if (!users_id || !password) {
    return res.status(400).json({ success: false, message: 'users_id dan password wajib diisi.' });
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 12);
    const updateSql = 'UPDATE users SET password = ? WHERE id = ?';
    db.query(updateSql, [hashedPassword, users_id], (err, result) => {
      if (err) {
        console.error('❌ Error updating admin BDRS password:', err);
        return res.status(500).json({ success: false, message: 'Gagal mengubah password.' });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: 'User tidak ditemukan.' });
      }
      return res.json({ success: true, message: 'Password berhasil diubah.' });
    });
  } catch (error) {
    console.error('🔥 Error hashing password for admin BDRS:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
});

module.exports = router;
