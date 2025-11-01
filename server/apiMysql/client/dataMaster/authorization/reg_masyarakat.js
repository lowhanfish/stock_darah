const express = require('express');
const router = express.Router();
const db = require('../../../../db/MySql/umum'); // Asumsi path ke koneksi DB sama
const bcrypt = require('bcryptjs');
const upload = require('../../../../db/multer/image'); // Asumsi path ke multer sama
const path = require('path');
const fs = require('fs');

// Endpoint untuk mendapatkan daftar kabupaten (sama seperti pendonor)
router.get('/kabupaten', (req, res) => {
  const provinsiId = 74; // Asumsi provinsi_id tetap 74
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

// Endpoint untuk mendapatkan daftar kecamatan berdasarkan kabupaten_id (sama seperti pendonor)
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

// Endpoint untuk mendapatkan daftar desa/kelurahan berdasarkan kecamatan_id (sama seperti pendonor)
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

// Endpoint untuk mendapatkan daftar masyarakat dengan pagination dan pencarian
router.post("/getview", (req, res) => {
  const { page_limit, data_ke, cari_value } = req.body;

  const limit = parseInt(page_limit) || 10;
  const offset = parseInt(data_ke) || 0;
  const search = cari_value ? `%${cari_value}%` : '%';

  // Query untuk menghitung total data
  const countSql = `
    SELECT COUNT(*) AS total FROM masyarakat m
    JOIN users u ON m.users_id = u.id
    WHERE m.nama_lengkap LIKE ? 
       OR m.nik LIKE ?
       OR u.username LIKE ? 
       OR m.no_hp LIKE ?
       OR m.email LIKE ?
  `;

  // Query untuk mendapatkan data masyarakat
  const dataSql = `
    SELECT 
      m.id,
      m.nama_lengkap,
      m.nik,
      m.tanggal_lahir,
      m.jenis_kelamin,
      m.kabupaten_id,
      mkab.nama_kabupaten,
      m.kecamatan_id,
      mkec.nama_kecamatan,
      m.des_kel_id,
      mdkel.nama_des_kel,
      m.alamat,
      m.email,
      m.no_hp,
      m.foto_profil,
      u.username,
      u.id AS users_id,
      u.stokdarah_konut 
    FROM masyarakat m
    JOIN users u ON m.users_id = u.id
    LEFT JOIN master_kabupaten mkab ON m.kabupaten_id = mkab.kabupaten_id
    LEFT JOIN master_kecamatan mkec ON m.kecamatan_id = mkec.kecamatan_id
    LEFT JOIN master_des_kel mdkel ON m.des_kel_id = mdkel.des_kel_id
    WHERE m.nama_lengkap LIKE ? 
       OR m.nik LIKE ?
       OR u.username LIKE ? 
       OR m.no_hp LIKE ?
       OR m.email LIKE ?
    ORDER BY m.created_at DESC
    LIMIT ? OFFSET ?
  `;

  db.query(countSql, [search, search, search, search, search], (err, countResult) => {
    if (err) {
      console.error("❌ Error count masyarakat:", err);
      return res.status(500).json({ success: false, error: err.message });
    }

    const total_data = countResult[0].total;

    db.query(dataSql, [search, search, search, search, search, limit, offset], (err2, dataResult) => {
      if (err2) {
        console.error("❌ Error get masyarakat:", err2);
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

// Endpoint untuk menambahkan data masyarakat baru
router.post("/addData", upload.fields([
  { name: 'foto_profil', maxCount: 1 }
]), async (req, res) => {
  try {
    const {
      username,
      password,
      nama_lengkap,
      nik, // Opsional, tapi disarankan
      tanggal_lahir,
      jenis_kelamin,
      kabupaten_id,
      kecamatan_id,
      des_kel_id,
      alamat,
      email,
      no_hp
    } = req.body;

    // Validasi required fields
    if (!username || !password || !nama_lengkap || !tanggal_lahir || !jenis_kelamin || !no_hp) {
      return res.status(400).json({
        success: false,
        message: "Field wajib harus diisi! (username, password, nama lengkap, tanggal lahir, jenis kelamin, no HP)"
      });
    }

    // Validasi username & password
    if (username.trim().length < 6) {
      return res.status(400).json({ success: false, message: 'Username harus minimal 6 karakter' });
    }
    if (password.trim().length < 6) {
      return res.status(400).json({ success: false, message: 'Password harus minimal 6 karakter' });
    }

    // Validasi NIK jika diisi
    let nik_clean = null;
    if (nik) {
      if (!/^\d{16}$/.test(nik)) {
        return res.status(400).json({
          success: false,
          message: "NIK tidak valid. Harus berupa 16 digit angka (atau kosongkan jika tidak diisi)"
        });
      }
      nik_clean = nik.trim();
    }

    const nama_lengkap_clean = nama_lengkap.trim().substring(0, 255);
    const alamat_clean = alamat ? alamat.trim().substring(0, 255) : null;
    const email_clean = email ? email.trim().substring(0, 150) : null;
    const no_hp_clean = no_hp.trim().substring(0, 25);

    let jenis_kelamin_clean = jenis_kelamin.trim();
    const validJenisKelamin = ['L', 'P'];
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

    // Stokdarah_konut untuk masyarakat, default 5
    const stokdarah_konut_clean = 5; 

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

      // Cek NIK unik di masyarakat jika NIK diisi
      if (nik_clean) {
        const checkNikSql = `SELECT id FROM masyarakat WHERE nik = ?`;
        db.query(checkNikSql, [nik_clean], async (nikErr, nikResults) => {
          if (nikErr) {
            console.error("❌ Error cek NIK:", nikErr);
            return res.status(500).json({ success: false, error: nikErr.message });
          }
          if (nikResults.length > 0) {
            return res.status(400).json({ success: false, message: "NIK sudah digunakan oleh masyarakat lain!" });
          }
          // Lanjutkan proses jika NIK unik atau tidak diisi
          processAddMasyarakat();
        });
      } else {
        processAddMasyarakat();
      }

      async function processAddMasyarakat() {
        const hashedPassword = await bcrypt.hash(password.trim(), 12);

        const sqlUser = `
          INSERT INTO users (username, password, email, hp, nama, jabatan, stokdarah_konut, createdAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
        `;
        const userJabatan = 'Masyarakat'; // Jabatan untuk masyarakat
        db.query(sqlUser, [username.trim(), hashedPassword, email_clean, no_hp_clean, nama_lengkap_clean, userJabatan, stokdarah_konut_clean], (err, resultUser) => {
          if (err) {
            console.error("❌ Insert user error:", err);
            return res.status(500).json({ success: false, error: err.message });
          }

          const users_id = resultUser.insertId;

          let foto_profil = null;
          if (req.files && req.files['foto_profil'] && req.files['foto_profil'][0]) {
            foto_profil = req.files['foto_profil'][0].filename;
          }

          const masyarakatData = [
            users_id,
            nama_lengkap_clean,
            nik_clean,
            tanggal_lahir,
            jenis_kelamin_clean,
            kabupaten_id ? parseInt(kabupaten_id) : null,
            kecamatan_id ? parseInt(kecamatan_id) : null,
            des_kel_id ? parseInt(des_kel_id) : null,
            alamat_clean,
            email_clean,
            no_hp_clean,
            foto_profil,
            new Date()
          ];

          const sqlMasyarakat = `
            INSERT INTO masyarakat (
              users_id, nama_lengkap, nik, tanggal_lahir, jenis_kelamin,
              kabupaten_id, kecamatan_id, des_kel_id, alamat, email, no_hp,
              foto_profil, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `;

          db.query(sqlMasyarakat, masyarakatData, (err2, resultMasyarakat) => {
            if (err2) {
              console.error("❌ Insert masyarakat error:", err2);
              console.error("SQL Error details:", err2.sqlMessage);
              // Rollback users
              const deleteUserSql = `DELETE FROM users WHERE id = ?`;
              db.query(deleteUserSql, [users_id]);
              return res.status(500).json({ success: false, error: err2.message });
            }

            res.json({
              success: true,
              message: "Masyarakat berhasil ditambahkan 🎉",
              users_id,
              masyarakat_id: resultMasyarakat.insertId,
              data: { nama_lengkap: nama_lengkap_clean }
            });
          });
        });
      }
    });

  } catch (error) {
    console.error("🔥 Error tambah masyarakat:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Endpoint untuk mengedit data masyarakat
router.post("/editData", upload.fields([
  { name: 'foto_profil', maxCount: 1 }
]), async (req, res) => {
  try {
    const {
      id,
      users_id,
      username,
      nama_lengkap,
      nik,
      tanggal_lahir,
      jenis_kelamin,
      kabupaten_id,
      kecamatan_id,
      des_kel_id,
      alamat,
      email,
      no_hp
    } = req.body;

    if (!id || !users_id) {
      return res.status(400).json({ success: false, message: 'ID masyarakat dan users_id wajib diisi untuk update.' });
    }

    const nama_lengkap_clean = nama_lengkap ? nama_lengkap.trim().substring(0, 255) : null;
    const alamat_clean = alamat ? alamat.trim().substring(0, 255) : null;
    const email_clean = email ? email.trim().substring(0, 150) : null;
    const no_hp_clean = no_hp ? no_hp.trim().substring(0, 25) : null;

    // Validasi dan clean NIK (opsional di edit; jika diisi, harus valid 16 digit)
    let nik_clean = null;
    if (nik) {
      if (!/^\d{16}$/.test(nik)) {
        return res.status(400).json({
          success: false,
          message: "NIK tidak valid. Harus berupa 16 digit angka (atau kosongkan jika tidak diubah)"
        });
      }
      nik_clean = nik.trim();
    }

    let jenis_kelamin_clean = jenis_kelamin ? jenis_kelamin.trim() : null;
    if (jenis_kelamin_clean && jenis_kelamin_clean.length > 1) {
      jenis_kelamin_clean = jenis_kelamin_clean.substring(0, 1);
    }

    const getOldFilesSql = 'SELECT foto_profil, nik FROM masyarakat WHERE id = ?';
    db.query(getOldFilesSql, [id], (err, results) => {
      if (err) {
        console.error('❌ Error fetching old masyarakat files:', err);
        return res.status(500).json({ success: false, error: err.message });
      }
      if (results.length === 0) {
        return res.status(404).json({ success: false, message: 'Data masyarakat tidak ditemukan.' });
      }

      const existingNik = results[0].nik;

      if (nik_clean && nik_clean !== existingNik) {
        const checkNikSql = `SELECT id FROM masyarakat WHERE nik = ? AND id != ?`;
        db.query(checkNikSql, [nik_clean, id], (nikErr, nikResults) => {
          if (nikErr) {
            console.error("❌ Error cek NIK uniqueness:", nikErr);
            return res.status(500).json({ success: false, error: nikErr.message });
          }
          if (nikResults.length > 0) {
            return res.status(400).json({ success: false, message: "NIK sudah digunakan oleh masyarakat lain!" });
          }
          // Jika unik, lanjut ke update (lanjutkan di nested callback di bawah)
          proceedToUpdate(existingNik, results[0]);
        });
      } else {
        // Jika tidak ada perubahan NIK atau kosong, lanjut langsung
        proceedToUpdate(existingNik, results[0]);
      }

      function proceedToUpdate(existingNik, oldData) {
        let oldFotoProfil = oldData.foto_profil;
        let newFotoProfil = oldFotoProfil;

        if (req.files && req.files['foto_profil'] && req.files['foto_profil'][0]) {
          newFotoProfil = req.files['foto_profil'][0].filename;
          if (oldFotoProfil && oldFotoProfil !== newFotoProfil) {
            const oldFilePath = path.join(__dirname, '../../../../uploads', oldFotoProfil);
            fs.unlink(oldFilePath, (unlinkErr) => {
              if (unlinkErr) console.warn('⚠️ Gagal hapus foto profil lama:', unlinkErr);
            });
          }
        }

        const updateMasyarakatSql = `
          UPDATE masyarakat SET
            nama_lengkap = ?,
            nik = ?,
            tanggal_lahir = ?,
            jenis_kelamin = ?,
            kabupaten_id = ?,
            kecamatan_id = ?,
            des_kel_id = ?,
            alamat = ?,
            email = ?,
            no_hp = ?,
            foto_profil = ?
          WHERE id = ?
        `;

        const masyarakatData = [
          nama_lengkap_clean,
          nik_clean,
          tanggal_lahir,
          jenis_kelamin_clean,
          kabupaten_id ? parseInt(kabupaten_id) : null,
          kecamatan_id ? parseInt(kecamatan_id) : null,
          des_kel_id ? parseInt(des_kel_id) : null,
          alamat_clean,
          email_clean,
          no_hp_clean,
          newFotoProfil,
          id
        ];

        db.query(updateMasyarakatSql, masyarakatData, (updateErr) => {
          if (updateErr) {
            console.error('❌ Error updating masyarakat:', updateErr);
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

              // Update user data, termasuk stokdarah_konut jika ada di payload atau biarkan default
              const updateUserSql = 'UPDATE users SET username = ?, email = ?, hp = ?, nama = ? WHERE id = ?';
              db.query(updateUserSql, [username.trim(), email_clean, no_hp_clean, nama_lengkap_clean, users_id], (userErr) => {
                if (userErr) {
                  console.error('❌ Error updating user data:', userErr);
                  return res.status(500).json({ success: false, error: userErr.message });
                }
                res.json({ success: true, message: 'Data masyarakat diupdate.' });
              });
            });
          } else {
            // Update user data tanpa username, termasuk stokdarah_konut
            const updateUserSql = 'UPDATE users SET email = ?, hp = ?, nama = ? WHERE id = ?';
            db.query(updateUserSql, [email_clean, no_hp_clean, nama_lengkap_clean, users_id], (userErr) => {
              if (userErr) {
                console.error('❌ Error updating user data (no username change):', userErr);
                return res.status(500).json({ success: false, error: userErr.message });
              }
              res.json({ success: true, message: 'Data masyarakat berhasil diupdate.' });
            });
          }
        });
      }
    });

  } catch (error) {
    console.error("🔥 Error edit masyarakat:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Endpoint untuk menghapus data masyarakat
router.post('/removeMasyarakat', (req, res) => {
  const { id, users_id } = req.body;

  if (!id || !users_id) {
    return res.status(400).json({ success: false, message: 'ID masyarakat dan users_id wajib diisi.' });
  }

  const getOldFilesSql = 'SELECT foto_profil FROM masyarakat WHERE id = ?';
  db.query(getOldFilesSql, [id], (err, results) => {
    if (err) {
      console.error('❌ Error fetching old masyarakat files for deletion:', err);
      return res.status(500).json({ success: false, message: 'Database error saat mengambil file lama.' });
    }
    if (results.length === 0) {
      return res.status(404).json({ success: false, message: 'Data masyarakat tidak ditemukan.' });
    }

    const oldFotoProfil = results[0].foto_profil;

    const deleteMasyarakatSql = 'DELETE FROM masyarakat WHERE id = ?';
    db.query(deleteMasyarakatSql, [id], (delErr) => {
      if (delErr) {
        console.error('❌ Error deleting masyarakat:', delErr);
        return res.status(500).json({ success: false, message: 'Gagal menghapus data masyarakat.' });
      }

      const deleteUserSql = 'DELETE FROM users WHERE id = ?';
      db.query(deleteUserSql, [users_id], (userErr) => {
        if (userErr) {
          console.error('❌ Error deleting user associated with masyarakat:', userErr);
          // Lanjutkan proses meskipun ada error di user, karena data masyarakat sudah terhapus
        }
        if (oldFotoProfil) {
          const filePath = path.join(__dirname, '../../../../uploads', oldFotoProfil);
          fs.unlink(filePath, (unlinkErr) => {
            if (unlinkErr) console.warn('⚠️ Gagal hapus foto profil lama:', unlinkErr);
          });
        }

        return res.json({ success: true, message: 'Data masyarakat berhasil dihapus.' });
      });
    });
  });
});

// Endpoint untuk mengubah password masyarakat
router.post('/editPasswordMasyarakat', async (req, res) => {
  const { users_id, password } = req.body;
  if (!users_id || !password) {
    return res.status(400).json({ success: false, message: 'users_id dan password wajib diisi.' });
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 12);
    const updateSql = 'UPDATE users SET password = ? WHERE id = ?';
    db.query(updateSql, [hashedPassword, users_id], (err, result) => {
      if (err) {
        console.error('❌ Error updating masyarakat password:', err);
        return res.status(500).json({ success: false, message: 'Gagal mengubah password.' });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: 'User tidak ditemukan.' });
      }
      return res.json({ success: true, message: 'Password berhasil diubah.' });
    });
  } catch (error) {
    console.error('🔥 Error hashing password for masyarakat:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
});

module.exports = router;
