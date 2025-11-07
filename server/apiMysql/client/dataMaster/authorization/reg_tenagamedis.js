const express = require('express');
const router = express.Router();
const db = require('../../../../db/MySql/umum');
const bcrypt = require('bcryptjs');
// var upload = require('../../../../db/multer/image'); // tidak lagi diperlukan tapi boleh tetap ada
const path = require('path');
const fs = require('fs');

/**
 * GET VIEW
 * Menampilkan daftar ruangan (nama_ruangan, nama_pj, username, users_id, id)
 */
router.post("/getview", (req, res) => {
  const { page_limit, data_ke, cari_value } = req.body;

  const limit = parseInt(page_limit) || 10;
  const offset = parseInt(data_ke) || 0;
  const search = cari_value ? `%${cari_value}%` : '%';

  const countSql = `
    SELECT COUNT(*) AS total
    FROM tenaga_medis tm
    JOIN users u ON tm.users_id = u.id
    WHERE tm.nama_ruangan LIKE ? OR tm.nama_pj LIKE ? OR u.username LIKE ?
  `;

  const dataSql = `
    SELECT
      tm.id,
      tm.nama_ruangan,
      tm.nama_pj,
      u.username,
      u.id AS users_id,
      tm.created_at
    FROM tenaga_medis tm
    JOIN users u ON tm.users_id = u.id
    WHERE tm.nama_ruangan LIKE ? OR tm.nama_pj LIKE ? OR u.username LIKE ?
    ORDER BY tm.created_at DESC
    LIMIT ? OFFSET ?
  `;

  db.query(countSql, [search, search, search], (err, countResult) => {
    if (err) {
      console.error("❌ Error count tenaga_medis:", err);
      return res.status(500).json({ success: false, error: err.message });
    }

    const total_data = countResult[0].total || 0;

    db.query(dataSql, [search, search, search, limit, offset], (err2, dataResult) => {
      if (err2) {
        console.error("❌ Error get tenaga_medis:", err2);
        return res.status(500).json({ success: false, error: err2.message });
      }

      return res.json({
        success: true,
        data: dataResult,
        jml_data: dataResult.length,
        total_data
      });
    });
  });
});

/**
 * ADD (registrasi ruangan / user)
 * Hanya menerima: username, password, nama_ruangan, nama_pj
 */
router.post("/addTenagaMedis", async (req, res) => {
  try {
    const {
      username,
      password,
      nama_ruangan,
      nama_pj
    } = req.body;

    // Validasi required fields
    if (!username || !password || !nama_ruangan || !nama_pj) {
      return res.status(400).json({
        success: false,
        message: "username, password, nama_ruangan, dan nama_pj wajib diisi"
      });
    }

    // Validasi username minimal 4 karakter (ubah sesuai kebutuhan)
    if (username && username.length < 4) {
      return res.status(400).json({
        success: false,
        message: 'Username harus minimal 4 karakter'
      });
    }

    // Cek apakah username sudah ada
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

      // Hash password
      const hashedPassword = await bcrypt.hash(password.trim(), 12);

      // Insert user dan set jabatan='petugas', stokdarah_konut='3'
      const sqlUser = `
        INSERT INTO users (username, password, nama, jabatan, stokdarah_konut, createdAt)
        VALUES (?, ?, ?, ?, ?, NOW())
      `;

      // isi email/hp/dsb tidak diperlukan di sini -> gunakan nilai default/empty bila perlu
      db.query(sqlUser, [username, hashedPassword, nama_ruangan, 'petugas', '3'], (errUser, resultUser) => {
        if (errUser) {
          console.error("❌ Insert user error:", errUser);
          return res.status(500).json({ success: false, error: errUser.message });
        }

        const users_id = resultUser.insertId;

        // Insert ke tabel tenaga_medis hanya kolom yang diperlukan
        const sqlTenagaMedis = `
          INSERT INTO tenaga_medis (
            users_id,
            nama_ruangan,
            nama_pj,
            created_at
          ) VALUES (?, ?, ?, NOW())
        `;

        db.query(sqlTenagaMedis, [users_id, nama_ruangan, nama_pj], (errTm, resultTm) => {
          if (errTm) {
            console.error("❌ Insert tenaga_medis error:", errTm);

            // rollback: hapus user yang sudah dibuat
            const deleteUserSql = `DELETE FROM users WHERE id = ?`;
            db.query(deleteUserSql, [users_id], () => { /* ignore error */ });

            return res.status(500).json({ success: false, error: errTm.message });
          }

          return res.json({
            success: true,
            message: "Registrasi ruangan berhasil 🎉",
            users_id,
            tenaga_medis_id: resultTm.insertId,
            data: {
              nama_ruangan,
              nama_pj,
              username
            }
          });
        });
      });
    });

  } catch (error) {
    console.error("🔥 Error tambah tenaga_medis:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * EDIT (update nama_ruangan, nama_pj, username, optional password)
 * Body: id, users_id, nama_ruangan, nama_pj, username, [password]
 */
router.post('/EditTenagaMedis', async (req, res) => {
  try {
    const {
      id,
      users_id,
      nama_ruangan,
      nama_pj,
      username,
      password
    } = req.body;

    if (!id || !users_id) {
      return res.status(400).json({ success: false, message: 'ID tenaga_medis dan users_id wajib diisi' });
    }

    if (!nama_ruangan || !nama_pj) {
      return res.status(400).json({ success: false, message: 'nama_ruangan dan nama_pj wajib diisi' });
    }

    // Validasi username minimal 4 karakter jika diisi
    if (username && username.length < 4) {
      return res.status(400).json({
        success: false,
        message: 'Username harus minimal 4 karakter'
      });
    }

    // Update data tenaga_medis
    const updateSql = `
      UPDATE tenaga_medis SET
        nama_ruangan = ?,
        nama_pj = ?
      WHERE id = ?
    `;

    db.query(updateSql, [nama_ruangan, nama_pj, id], async (updateErr) => {
      if (updateErr) {
        console.error('Error updating tenaga_medis:', updateErr);
        return res.status(500).json({ success: false, message: 'Gagal update data tenaga_medis' });
      }

      // Jika username diisi -> update users.username
      const tasks = [];

      if (username) {
        tasks.push(new Promise((resolve) => {
          const updateUserSql = 'UPDATE users SET username = ? WHERE id = ?';
          db.query(updateUserSql, [username || null, nama_ruangan || null, users_id], (userErr) => {
            if (userErr) {
              console.error('Error updating username:', userErr);
              // tetap resolve dengan error agar bisa dikirim
              return resolve({ success: false, error: userErr.message });
            }
            resolve({ success: true });
          });
        }));
      }

      // Jika password disertakan -> hash dan update password
      if (password && password.length > 0) {
        tasks.push(new Promise(async (resolve) => {
          try {
            const hashed = await bcrypt.hash(password, 12);
            const updatePwdSql = 'UPDATE users SET password = ? WHERE id = ?';
            db.query(updatePwdSql, [hashed, users_id], (pwdErr) => {
              if (pwdErr) {
                console.error('Error updating password:', pwdErr);
                return resolve({ success: false, error: pwdErr.message });
              }
              resolve({ success: true });
            });
          } catch (e) {
            console.error('Hashing error:', e);
            resolve({ success: false, error: e.message });
          }
        }));
      }

      // Tunggu semua task selesai (jika ada)
      if (tasks.length > 0) {
        const results = await Promise.all(tasks);
        const failed = results.find(r => r.success === false);
        if (failed) {
          // meskipun gagal update user/password, tenaga_medis sudah diupdate — laporkan error
          return res.status(500).json({ success: false, message: 'Gagal update akun terkait', detail: failed.error || null });
        }
      }

      return res.json({ success: true, message: 'Data berhasil diupdate' });
    });

  } catch (err) {
    console.error('Error EditTenagaMedis:', err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
});

/**
 * REMOVE (hapus tenaga_medis + user terkait)
 */
router.post('/removeTenagaMedis', (req, res) => {
  const { id, users_id } = req.body;

  if (!id || !users_id) {
    return res.status(400).json({ success: false, message: 'ID tenaga_medis dan users_id wajib diisi' });
  }

  // Hapus data tenaga_medis
  const deleteTenagaMedisSql = 'DELETE FROM tenaga_medis WHERE id = ?';
  db.query(deleteTenagaMedisSql, [id], (delErr) => {
    if (delErr) {
      console.error('Error deleting tenaga_medis:', delErr);
      return res.status(500).json({ success: false, message: 'Gagal menghapus data tenaga_medis' });
    }

    // Hapus user terkait
    const deleteUserSql = 'DELETE FROM users WHERE id = ?';
    db.query(deleteUserSql, [users_id], (userErr) => {
      if (userErr) {
        console.error('Error deleting user:', userErr);
        // lanjutkan tetap sukses (atau Anda bisa kembalikan error jika perlu)
      }

      return res.json({ success: true, message: 'Data berhasil dihapus' });
    });
  });
});

/**
 * EDIT PASSWORD (tetap disediakan jika ingin panggilan khusus)
 * Body: users_id, password
 */
router.post('/editPasswordTenagaMedis', async (req, res) => {
  const { users_id, password } = req.body;
  if (!users_id || !password) {
    return res.status(400).json({ success: false, message: 'users_id dan password wajib diisi' });
  }
  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const updateSql = 'UPDATE users SET password = ? WHERE id = ?';
    db.query(updateSql, [hashedPassword, users_id], (err, result) => {
      if (err) {
        console.error('Error updating password:', err);
        return res.status(500).json({ success: false, message: 'Gagal mengubah password' });
      }
      return res.json({ success: true, message: 'Password berhasil diubah' });
    });
  } catch (error) {
    console.error('Error hashing password:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
});

module.exports = router;
