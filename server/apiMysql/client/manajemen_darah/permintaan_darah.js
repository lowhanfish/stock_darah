const express = require('express');
const router = express.Router();
const db = require('../../../db/MySql/umum'); // koneksi database

function normalizeDate(value) {
  if (!value) return null;
  if (typeof value === 'string') {
    // format ISO seperti '2025-11-09T16:00:00.000Z' → ambil tanggalnya saja
    if (value.includes('T')) return value.split('T')[0];
  }
  return value;
}

function formatDate(dateString) {
  if (!dateString) return null;
  try {

    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return dateString;

    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch (e) {
    return null;
  }
}

// ===================================================
// GET: view (list) permintaan_darah dengan pagination + filter
// ===================================================
router.get('/view', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  const rawSearch = req.query.cari_value || '';
  const cari_value = rawSearch ? `%${rawSearch}%` : '%%';
  const komponen_id = req.query.komponen_id || '';
  const golongan_darah = req.query.golongan_darah || '';
  const status = req.query.status || '';

  // build filters
  const filters = [];
  const params = [];

  // search across nama_pasien, nama_dokter, nomor_rm, diagnosis_klinis
  filters.push(`(p.nama_pasien LIKE ? OR p.nama_dokter LIKE ? OR p.nomor_rm LIKE ? OR p.diagnosis_klinis LIKE ?)`);
  params.push(cari_value, cari_value, cari_value, cari_value);

  if (komponen_id) {
    filters.push('p.komponen_id = ?');
    params.push(komponen_id);
  }
  if (golongan_darah) {
    filters.push('p.golongan_darah = ?');
    params.push(golongan_darah);
  }
  if (status !== '' && !isNaN(status)) {
    filters.push('p.status = ?');
    params.push(Number(status));
  }

  // =========================
  try {
    const auth = req.headers && req.headers.authorization ? req.headers.authorization : '';
    // bentuk header yang dipakai di frontend: "kikensbatara <token>"
    if (auth) {
      const parts = auth.split(' ');
      const token = parts.length > 1 ? parts[1] : parts[0];
      if (token && process.env.TOKEN_SECRET) {
        try {
          const decoded = require('jsonwebtoken').verify(token, process.env.TOKEN_SECRET);
          // decoded diharapkan memiliki struktur: { profile: { stokdarah_konut: '3', ruangan_id: 12, ... } }
          if (decoded && decoded.profile) {
            const role = decoded.profile.stokdarah_konut != null ? String(decoded.profile.stokdarah_konut) : null;
            const ruanganIdFromToken = decoded.profile.ruangan_id ? Number(decoded.profile.ruangan_id) : null;
            if (role === '3' && ruanganIdFromToken) {
              // hanya tampilkan permintaan dari ruangan user itu
              filters.push('p.ruangan_id = ?');
              params.push(ruanganIdFromToken);
            }
          }
        } catch (e) {
          // token invalid / expired -> jangan gagal total, tetap tampilkan sesuai role (no extra filter)
          console.warn('Warning: gagal decode token pada /permintaan_darah/view — token mungkin invalid', e);
        }
      }
    }
  } catch (eAny) {
    // non-fatal
    console.warn('Non-fatal error saat mengeksekusi token-check pada /permintaan_darah/view', eAny);
  }
  // =========================

  const whereClause = filters.length ? 'WHERE ' + filters.join(' AND ') : '';

  const countSql = `
    SELECT COUNT(*) AS total
    FROM permintaan_darah p
    ${whereClause}
  `;

  db.query(countSql, params, (err, countRes) => {
    if (err) {
      console.error('Error count permintaan_darah:', err);
      return res.status(500).json({ success: false, message: 'Gagal menghitung data permintaan' });
    }
    const total = countRes[0].total || 0;
    const totalPages = Math.ceil(total / limit);

    const dataSql = `
      SELECT p.*,
             k.nama_komponen,
             t.nama_ruangan
      FROM permintaan_darah p
      LEFT JOIN komponen_darah k ON p.komponen_id = k.id
      LEFT JOIN tenaga_medis t ON p.ruangan_id = t.id
      ${whereClause}
      ORDER BY p.tanggal_permintaan DESC, p.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const dataParams = params.slice();
    dataParams.push(limit, offset);

    db.query(dataSql, dataParams, (err2, rows) => {
      if (err2) {
        console.error('Error fetch permintaan_darah:', err2);
        return res.status(500).json({ success: false, message: 'Gagal memuat data permintaan' });
      }
      return res.json({
        success: true,
        page,
        limit,
        total_data: total,
        total_pages: totalPages,
        data: rows || []
      });
    });
  });
});


router.get('/detail/:id', (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ success: false, message: 'ID permintaan dibutuhkan' });

  const sql = `
    SELECT p.*,
           k.nama_komponen,
           t.nama_ruangan
    FROM permintaan_darah p
    LEFT JOIN komponen_darah k ON p.komponen_id = k.id
    LEFT JOIN tenaga_medis t ON p.ruangan_id = t.id
    WHERE p.id = ?
    LIMIT 1
  `;
  db.query(sql, [id], (err, rows) => {
    if (err) {
      console.error('Error detail permintaan:', err);
      return res.status(500).json({ success: false, message: 'Gagal ambil detail permintaan' });
    }
    if (!rows || rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Permintaan tidak ditemukan' });
    }
    return res.json({ success: true, data: rows[0] });
  });
});

// ===================================================
// POST: addData (admin ruangan mengajukan permintaan)
// ===================================================
router.post('/addData', (req, res) => {
  const body = req.body || {};

  // fallback default sementara: rumah_sakit_id = 1 (RSUD KONAWE UTARA)
  if (
    body.rumah_sakit_id === undefined ||
    body.rumah_sakit_id === null ||
    String(body.rumah_sakit_id).trim() === ''
  ) {
    body.rumah_sakit_id = 1;
  }

  // validasi field wajib minimal
  const required = [
    'rumah_sakit_id',
    'ruangan_id',
    'nama_dokter',
    'tanggal_permintaan',
    'nama_pasien',
    'jenis_kelamin',
    'golongan_darah',
    'rhesus',
    'komponen_id',
    'jumlah_kantong',
    'jumlah_cc',
    'diagnosis_klinis',
    'alasan_transfusi'
  ];

  for (let f of required) {
    if (
      body[f] === undefined ||
      body[f] === null ||
      String(body[f]).toString().trim() === ''
    ) {
      return res
        .status(400)
        .json({ success: false, message: `Field ${f} wajib diisi` });
    }
  }

  // ===== tambahan backend: sanitasi & validasi untuk Riwayat Transfusi & Coomb's =====
  const allowedYesNo = (v) => (v === 'Ya' || v === 'Tidak') ? v : 'Tidak';

  const transfusi_sebelumnya = allowedYesNo(String(body.transfusi_sebelumnya || 'Tidak'));
  const transfusi_kapan = body.transfusi_kapan ? String(body.transfusi_kapan).trim() : null;

  const reaksi_transfusi = allowedYesNo(String(body.reaksi_transfusi || 'Tidak'));
  const gejala_transfusi = body.gejala_transfusi ? String(body.gejala_transfusi).trim() : null;

  const coomb_test = allowedYesNo(String(body.coomb_test || 'Tidak'));
  const coomb_tempat = body.coomb_tempat ? String(body.coomb_tempat).trim() : null;
  // gunakan helper formatDate untuk tanggal coomb (menghasilkan 'YYYY-MM-DD' atau null)
  const coomb_kapan = formatDate(body.coomb_kapan) || null;
  const coomb_hasil = body.coomb_hasil ? String(body.coomb_hasil).trim() : null;

  // Validasi server-side minimal (mirip validasi frontend)
  if (transfusi_sebelumnya === 'Ya' && (!transfusi_kapan || transfusi_kapan === '')) {
    return res.status(400).json({ success: false, message: 'Field transfusi_kapan wajib diisi ketika Transfusi Sebelumnya = Ya' });
  }
  if (reaksi_transfusi === 'Ya' && (!gejala_transfusi || gejala_transfusi === '')) {
    return res.status(400).json({ success: false, message: 'Field gejala_transfusi wajib diisi ketika Reaksi Transfusi = Ya' });
  }
  if (coomb_test === 'Ya' && (!coomb_tempat || !coomb_kapan || !coomb_hasil)) {
    return res.status(400).json({ success: false, message: 'Lengkapi data Coomb\'s test: dimana, kapan (tanggal) dan hasil.' });
  }

  // validasi tambahan khusus pasien wanita
  if (body.jenis_kelamin === 'P') {
    if (body.jumlah_kehamilan === undefined || body.jumlah_kehamilan === null) {
      return res
        .status(400)
        .json({ success: false, message: 'Jumlah kehamilan wajib diisi untuk pasien perempuan' });
    }
    if (
      !['Ya', 'Tidak'].includes(body.pernah_abortus || '') ||
      !['Ya', 'Tidak'].includes(body.pernah_hdn || '')
    ) {
      return res
        .status(400)
        .json({ success: false, message: 'Pernah abortus dan pernah HDN wajib diisi untuk pasien perempuan' });
    }
  }

  // nilai default status awal
  const status = 1; // Diajukan
  const status_keterangan = 'Menunggu Diperiksa oleh Admin UPD';

  // Query lengkap sesuai tabel permintaan_darah
  const sql = `
  INSERT INTO permintaan_darah
  (
    rumah_sakit_id, ruangan_id, nama_dokter, tanggal_permintaan, tanggal_diperlukan,
    nama_pasien, nomor_rm, tanggal_lahir, alamat, nama_wali, jenis_kelamin,
    golongan_darah, rhesus, komponen_id, jumlah_kantong, jumlah_cc, diagnosis_klinis,
    alasan_transfusi,
    transfusi_sebelumnya, transfusi_kapan, reaksi_transfusi, gejala_transfusi,
    coomb_test, coomb_tempat, coomb_kapan, coomb_hasil,
    kadar_hb,
    jumlah_kehamilan, pernah_abortus, pernah_hdn,
    status, status_keterangan, created_at, updated_at
  )
  VALUES (
    ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
    ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
    ?, ?, NOW(), NOW()
  );
  
  `;

  const params = [
    body.rumah_sakit_id,
    body.ruangan_id,
    body.nama_dokter,
    body.tanggal_permintaan,
    body.tanggal_diperlukan || null,
    body.nama_pasien,
    body.nomor_rm || null,
    body.tanggal_lahir || null,
    body.alamat || null,
    body.nama_wali || null,
    body.jenis_kelamin,
    body.golongan_darah,
    body.rhesus,
    body.komponen_id,
    Number(body.jumlah_kantong || 0),
    Number(body.jumlah_cc || 0),
    body.diagnosis_klinis,
    body.alasan_transfusi,
    transfusi_sebelumnya,
    transfusi_kapan,
    reaksi_transfusi,
    gejala_transfusi,
    coomb_test,
    coomb_tempat,
    coomb_kapan,
    coomb_hasil,
    body.kadar_hb || null,
    body.jumlah_kehamilan || null,
    body.pernah_abortus || null,
    body.pernah_hdn || null,
    status,
    status_keterangan
  ];

  db.query(sql, params, (err, result) => {
    if (err) {
      console.error('Error insert permintaan_darah:', err);
      return res
        .status(500)
        .json({ success: false, message: 'Gagal menambah permintaan darah' });
    }
    return res.json({
      success: true,
      message: 'Permintaan darah berhasil diajukan',
      id: result.insertId
    });
  });
});

// ===================================================
// POST: updateStatus (untuk verifikasi oleh Admin UPD)
// ===================================================
// router.post('/updateStatus', (req, res) => {
//   const b = req.body || {};
//   const id = b.id;
//   const status = Number(b.status);

//   if (!id) return res.status(400).json({ success: false, message: 'ID permintaan dibutuhkan' });
//   if (![1, 2, 3, 4].includes(status)) return res.status(400).json({ success: false, message: 'Status tidak valid' });

//   if (status === 4 && (!b.status_keterangan || String(b.status_keterangan).trim() === '')) {
//     return res.status(400).json({ success: false, message: 'Keterangan penolakan wajib diisi saat status = 4' });
//   }

//   // prepare update fields (only allowed fields)
//   const allowed = [
//     'status_keterangan', 'petugas_pemeriksa', 'tanggal_pemeriksaan',
//     'golongan_darah_hasil', 'rhesus_hasil', 'catatan_tambahan',
//     'crossmatch_1', 'crossmatch_2', 'crossmatch_3',
//     'jumlah_darah_diberikan', 'nomor_kantong', 'petugas_pengeluar', 'penerima_darah'
//   ];

//   const sets = ['status = ?'];
//   const params = [status];

//   allowed.forEach(key => {
//     if (b[key] !== undefined) {
//       sets.push(`${key} = ?`);
//       params.push(b[key]);
//     }
//   });

//   // Jika status 2 (Diperiksa) dan tidak ada status_keterangan, set default teks
//   if (status === 2 && (b.status_keterangan === undefined || b.status_keterangan === null)) {
//     sets.push(`status_keterangan = ?`);
//     params.push('Permintaan Sedang diperiksa');
//   }

//   // Jika status 3 (Disetujui) and no status_keterangan, set default teks
//   if (status === 3 && (b.status_keterangan === undefined || b.status_keterangan === null)) {
//     sets.push(`status_keterangan = ?`);
//     params.push('Permintaan Darah sudah berhasil');
//   }

//   // updated_at
//   sets.push('updated_at = NOW()');

//   const sql = `UPDATE permintaan_darah SET ${sets.join(', ')} WHERE id = ?`;
//   params.push(id);

//   db.query(sql, params, (err, result) => {
//     if (err) {
//       console.error('Error updateStatus permintaan_darah:', err);
//       return res.status(500).json({ success: false, message: 'Gagal memperbarui status permintaan' });
//     }
//     if (result.affectedRows === 0) {
//       return res.status(404).json({ success: false, message: 'Permintaan tidak ditemukan' });
//     }
//     return res.json({ success: true, message: 'Status permintaan berhasil diperbarui' });
//   });
// });


// router.post('/updateStatus', (req, res) => {
//   const b = req.body || {};
//   const id = b.id;
//   const status = Number(b.status);

//   if (!id) return res.status(400).json({ success: false, message: 'ID permintaan dibutuhkan' });
//   if (![1, 2, 3, 4].includes(status)) return res.status(400).json({ success: false, message: 'Status tidak valid' });

//   if (status === 4 && (!b.status_keterangan || String(b.status_keterangan).trim() === '')) {
//     return res.status(400).json({ success: false, message: 'Keterangan penolakan wajib diisi saat status = 4' });
//   }

//   // allowed fields update
//   const allowed = [
//     'status_keterangan', 'petugas_pemeriksa', 'tanggal_pemeriksaan',
//     'golongan_darah_hasil', 'rhesus_hasil', 'catatan_tambahan',
//     'crossmatch_1', 'crossmatch_2', 'crossmatch_3',
//     'jumlah_darah_diberikan', 'jumlah_darah_diberikan_cc', 'nomor_kantong', 'petugas_pengeluar', 'penerima_darah'
//   ];

//   const sets = ['status = ?'];
//   const params = [status];

//   allowed.forEach(key => {
//     if (b[key] !== undefined) {
//       sets.push(`${key} = ?`);
//       params.push(b[key]);
//     }
//   });

//   if (status === 2 && (b.status_keterangan === undefined || b.status_keterangan === null)) {
//     sets.push(`status_keterangan = ?`);
//     params.push('Permintaan Sedang diperiksa');
//   }

//   if (status === 3 && (b.status_keterangan === undefined || b.status_keterangan === null)) {
//     sets.push(`status_keterangan = ?`);
//     params.push('Permintaan Darah sudah berhasil dan Siap diambil');
//   }

//   // always update updated_at
//   sets.push('updated_at = NOW()');
//   params.push(id);

//   // mulai proses dengan koneksi DB (transaction)
//   db.getConnection((connErr, connection) => {
//     if (connErr) {
//       console.error('DB getConnection error:', connErr);
//       return res.status(500).json({ success: false, message: 'Koneksi database gagal' });
//     }

//     connection.beginTransaction(txErr => {
//       if (txErr) {
//         connection.release();
//         console.error('beginTransaction error:', txErr);
//         return res.status(500).json({ success: false, message: 'Gagal memulai transaksi DB' });
//       }

//       const sqlUpdate = `UPDATE permintaan_darah SET ${sets.join(', ')} WHERE id = ?`;
//       connection.query(sqlUpdate, params, (updErr, updRes) => {
//         if (updErr) {
//           return connection.rollback(() => {
//             connection.release();
//             console.error('Error updateStatus permintaan_darah:', updErr);
//             return res.status(500).json({ success: false, message: 'Gagal memperbarui status permintaan' });
//           });
//         }

//         if (updRes.affectedRows === 0) {
//           return connection.rollback(() => {
//             connection.release();
//             return res.status(404).json({ success: false, message: 'Permintaan tidak ditemukan' });
//           });
//         }

//         // jika status bukan 3 -> commit dan selesai
//         if (status !== 3) {
//           return connection.commit(commitErr => {
//             if (commitErr) {
//               return connection.rollback(() => {
//                 connection.release();
//                 console.error('commit error:', commitErr);
//                 return res.status(500).json({ success: false, message: 'Gagal menyelesaikan transaksi DB' });
//               });
//             }
//             connection.release();
//             return res.json({ success: true, message: 'Status permintaan berhasil diperbarui' });
//           });
//         }

//         // --- status === 3 : buat transaksi_darah 'keluar' + update stok ---
//         // ambil data permintaan beserta nama_ruangan dari tenaga_medis
//         const selSql = `
//           SELECT p.id, p.jumlah_darah_diberikan, p.jumlah_darah_diberikan_cc, p.golongan_darah_hasil, p.rhesus_hasil, p.komponen_id,
//                  tm.nama_ruangan
//           FROM permintaan_darah p
//           LEFT JOIN tenaga_medis tm ON p.ruangan_id = tm.id
//           WHERE p.id = ? LIMIT 1
//         `;
//         connection.query(selSql, [id], (selErr, selRows) => {
//           if (selErr) {
//             return connection.rollback(() => {
//               connection.release();
//               console.error('Error select permintaan:', selErr);
//               return res.status(500).json({ success: false, message: 'Gagal membaca data permintaan setelah update' });
//             });
//           }
//           if (!selRows || !selRows.length) {
//             // tidak ketemu -> commit update dan beri info
//             return connection.commit(commitErr => {
//               if (commitErr) {
//                 return connection.rollback(() => {
//                   connection.release();
//                   console.error('commit error:', commitErr);
//                   return res.status(500).json({ success: false, message: 'Gagal menyelesaikan transaksi DB' });
//                 });
//               }
//               connection.release();
//               return res.json({ success: true, message: 'Status diperbarui, tapi data permintaan tidak ditemukan untuk pembuatan transaksi.' });
//             });
//           }

//           const perm = selRows[0];
//           const jumlah = Number(perm.jumlah_darah_diberikan || 0);
//           const jumlah_cc = Number(perm.jumlah_darah_diberikan_cc || 0);
//           const gol = perm.golongan_darah_hasil || null;
//           const rh = perm.rhesus_hasil || null;
//           const komponen = perm.komponen_id || null;
//           const nama_ruangan = perm.nama_ruangan || '-';

//           // jika informasi penting tidak ada => commit update, dan jawab dengan info
//           if (!gol || !rh || !komponen || !jumlah || jumlah <= 0) {
//             return connection.commit(commitErr => {
//               if (commitErr) {
//                 return connection.rollback(() => {
//                   connection.release();
//                   console.error('commit error:', commitErr);
//                   return res.status(500).json({ success: false, message: 'Gagal menyelesaikan transaksi DB' });
//                 });
//               }
//               connection.release();
//               return res.json({
//                 success: true,
//                 message: 'Status permintaan diperbarui. Namun transaksi darah otomatis TIDAK dibuat karena data transaksi (golongan/rhesus/komponen/jumlah) tidak lengkap.'
//               });
//             });
//           }

//           // buat keterangan polos sesuai permintaan
//           const keterangan = `Permintaan Darah dari Ruangan ${nama_ruangan}`;

//           // lock stok_darah (FOR UPDATE)
//           const lockSql = `SELECT jumlah_stok FROM stok_darah WHERE golongan_darah = ? AND rhesus = ? AND komponen_id = ? FOR UPDATE`;
//           connection.query(lockSql, [gol, rh, komponen], (lockErr, lockRows) => {
//             if (lockErr) {
//               return connection.rollback(() => {
//                 connection.release();
//                 console.error('Error lock stok:', lockErr);
//                 return res.status(500).json({ success: false, message: 'Gagal mengunci stok' });
//               });
//             }
//             if (!lockRows || !lockRows.length) {
//               return connection.rollback(() => {
//                 connection.release();
//                 return res.status(404).json({ success: false, message: 'Data stok tidak ditemukan (untuk golongan/rhesus/komponen tersebut)' });
//               });
//             }

//             const stokNow = Number(lockRows[0].jumlah_stok || 0);
//             if (stokNow < jumlah) {
//               return connection.rollback(() => {
//                 connection.release();
//                 return res.status(400).json({ success: false, message: `Stok tidak cukup untuk membuat transaksi keluar. Stok: ${stokNow}, diminta: ${jumlah}` });
//               });
//             }

//             // insert transaksi_darah
//             const tipe = 'keluar';
//             const insSql = `INSERT INTO transaksi_darah
//               (golongan_darah, rhesus, komponen_id, jumlah, tipe_transaksi, keterangan)
//               VALUES (?, ?, ?, ?, ?, ?)`;
//             connection.query(insSql, [gol, rh, komponen, jumlah, tipe, keterangan], (insErr) => {
//               if (insErr) {
//                 return connection.rollback(() => {
//                   connection.release();
//                   console.error('Error inserting transaksi_darah:', insErr);
//                   return res.status(500).json({ success: false, message: 'Gagal mencatat transaksi darah' });
//                 });
//               }

//               // update stok_darah (kurangi)
//               const updSql = `UPDATE stok_darah SET jumlah_stok = jumlah_stok - ?, tanggal_update = NOW()
//                               WHERE golongan_darah = ? AND rhesus = ? AND komponen_id = ?`;
//               connection.query(updSql, [jumlah, gol, rh, komponen], (updErr2) => {
//                 if (updErr2) {
//                   return connection.rollback(() => {
//                     connection.release();
//                     console.error('Error update stok_darah:', updErr2);
//                     return res.status(500).json({ success: false, message: 'Gagal memperbarui stok darah' });
//                   });
//                 }

//                 // commit semua
//                 connection.commit(commitErr2 => {
//                   if (commitErr2) {
//                     return connection.rollback(() => {
//                       connection.release();
//                       console.error('commit error:', commitErr2);
//                       return res.status(500).json({ success: false, message: 'Gagal menyelesaikan transaksi DB' });
//                     });
//                   }
//                   connection.release();
//                   return res.json({ success: true, message: 'Status permintaan diperbarui dan transaksi darah keluar tercatat.' });
//                 });
//               });
//             });
//           }); // end lock stok
//         }); // end select permintaan
//       }); // end update query
//     }); // end beginTransaction
//   }); // end getConnection
// });

// POST: updateStatus (untuk verifikasi oleh Admin UPD)
// NOTE: versi disederhanakan — TIDAK lagi membuat transaksi_darah / mengubah stok.
// Hanya melakukan update pada tabel permintaan_darah.
// router.post('/updateStatus', (req, res) => {
//   const b = req.body || {};
//   const id = b.id;
//   const status = Number(b.status);

//   if (!id) return res.status(400).json({ success: false, message: 'ID permintaan dibutuhkan' });
//   if (![1, 2, 3, 4].includes(status)) return res.status(400).json({ success: false, message: 'Status tidak valid' });

//   if (status === 4 && (!b.status_keterangan || String(b.status_keterangan).trim() === '')) {
//     return res.status(400).json({ success: false, message: 'Keterangan penolakan wajib diisi saat status = 4' });
//   }

//   // allowed fields update (tetap sama seperti sebelumnya)
//   const allowed = [
//     'status_keterangan', 'petugas_pemeriksa', 'tanggal_pemeriksaan',
//     'golongan_darah_hasil', 'rhesus_hasil', 'catatan_tambahan',
//     'crossmatch_1', 'crossmatch_2', 'crossmatch_3',
//     'jumlah_darah_diberikan', 'jumlah_darah_diberikan_cc', 'nomor_kantong', 'petugas_pengeluar', 'penerima_darah'
//   ];

//   const sets = ['status = ?'];
//   const params = [status];

//   allowed.forEach(key => {
//     if (b[key] !== undefined) {
//       sets.push(`${key} = ?`);
//       params.push(b[key]);
//     }
//   });

//   // default status_keterangan jika tidak dikirim untuk beberapa status (opsional)
//   if ((b.status_keterangan === undefined || b.status_keterangan === null) && status === 2) {
//     sets.push(`status_keterangan = ?`);
//     params.push('Permintaan Sedang diperiksa');
//   }
//   if ((b.status_keterangan === undefined || b.status_keterangan === null) && status === 3) {
//     sets.push(`status_keterangan = ?`);
//     params.push('Permintaan Darah sudah berhasil');
//   }

//   // always update updated_at
//   sets.push('updated_at = NOW()');

//   // jika tidak ada field selain status (rare), tetap lakukan update untuk status
//   const sql = `UPDATE permintaan_darah SET ${sets.join(', ')} WHERE id = ?`;
//   params.push(id);

//   db.query(sql, params, (err, result) => {
//     if (err) {
//       console.error('Error updateStatus permintaan_darah (simple):', err);
//       return res.status(500).json({ success: false, message: 'Gagal memperbarui status permintaan' });
//     }
//     if (result.affectedRows === 0) {
//       return res.status(404).json({ success: false, message: 'Permintaan tidak ditemukan' });
//     }

//     return res.json({ success: true, message: 'Status permintaan berhasil diperbarui dan Darah Siap diambil' });
//   });
// });


// POST: updateStatus (simple) — support status 1..6, auto-set tanggal_pengambilan = NOW() when status=6
router.post('/updateStatus', (req, res) => {
  const b = req.body || {};
  const id = b.id;
  const status = Number(b.status);

  if (!id) return res.status(400).json({ success: false, message: 'ID permintaan dibutuhkan' });

  const allowedStatuses = [1, 2, 3, 4, 5, 6];
  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: 'Status tidak valid' });
  }

  // jika status = 5 (Ditolak) -> wajib ada keterangan
  if (status === 5 && (!b.status_keterangan || String(b.status_keterangan).trim() === '')) {
    return res.status(400).json({ success: false, message: 'Keterangan penolakan wajib diisi saat status = 5' });
  }

  // fields yang boleh diupdate. NOTE: tanggal_pengambilan ditangani terpisah supaya bisa set NOW()
  const allowed = [
    'status_keterangan', 'petugas_pemeriksa', 'tanggal_pemeriksaan',
    'golongan_darah_hasil', 'exp', 'rhesus_hasil', 'catatan_tambahan',
    'crossmatch_1', 'crossmatch_2', 'crossmatch_3',
    'jumlah_darah_diberikan', 'jumlah_darah_diberikan_cc', 'nomor_kantong',
    'petugas_pengeluar', 'penerima_darah',
    // 'tanggal_pengambilan', // handled separately
    'jam_pengambilan', 'catatan_pengambilan'
  ];

  const sets = ['status = ?'];
  const params = [status];

  // tambahkan allowed fields yang dikirim
  allowed.forEach(key => {
    if (b[key] !== undefined) {
      let val = b[key];
      if (typeof val === 'string' && val.trim() === '') val = null;
      sets.push(`${key} = ?`);
      params.push(val);
    }
  });

  // jika frontend mengirim tanggal_pengambilan secara eksplisit (mis. override), gunakan itu
  let tanggalPengambilanHandled = false;
  if (b.tanggal_pengambilan !== undefined) {
    // jika dikirim sebagai empty string -> treat as NULL
    const v = (typeof b.tanggal_pengambilan === 'string' && b.tanggal_pengambilan.trim() === '') ? null : b.tanggal_pengambilan;
    sets.push('tanggal_pengambilan = ?');
    params.push(v);
    tanggalPengambilanHandled = true;
  }

  // default status_keterangan bila tidak dikirim
  if ((b.status_keterangan === undefined || b.status_keterangan === null) && status === 2) {
    sets.push('status_keterangan = ?');
    params.push('Permintaan Sedang diperiksa');
  }
  if ((b.status_keterangan === undefined || b.status_keterangan === null) && status === 3) {
    sets.push('status_keterangan = ?');
    params.push('Siap Diambil - Menunggu pengambilan oleh keluarga/ruangan');
  }
  if ((b.status_keterangan === undefined || b.status_keterangan === null) && status === 6) {
    sets.push('status_keterangan = ?');
    params.push('Sudah diambil');
  }

  // Jika status = 6 dan tanggal_pengambilan tidak disediakan oleh frontend,
  // isi tanggal_pengambilan dengan NOW() (timestamp DB) — tidak perlu param.
  if (status === 6 && !tanggalPengambilanHandled) {
    sets.push('tanggal_pengambilan = NOW()');
    // tidak push param
  }

  // selalu update updated_at
  sets.push('updated_at = NOW()');

  const sql = `UPDATE permintaan_darah SET ${sets.join(', ')} WHERE id = ?`;
  params.push(id);

  db.query(sql, params, (err, result) => {
    if (err) {
      console.error('Error updateStatus permintaan_darah (timestamp-support):', err);
      return res.status(500).json({ success: false, message: 'Gagal memperbarui status permintaan' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Permintaan tidak ditemukan' });
    }
    return res.json({ success: true, message: 'Status permintaan berhasil diperbarui' });
  });
});



// POST /permintaan_darah/edit
router.post('/edit', (req, res) => {
  const b = req.body || {};
  const id = b.id;
  if (!id) return res.status(400).json({ success: false, message: 'ID dibutuhkan' });

  const allowed = [
    'nama_dokter', 'tanggal_permintaan', 'tanggal_diperlukan', 'nama_pasien', 'nomor_rm', 'tanggal_lahir', 'alamat', 'nama_wali',
    'jenis_kelamin', 'jumlah_kehamilan', 'pernah_abortus', 'pernah_hdn',
    'golongan_darah', 'rhesus', 'komponen_id', 'jumlah_kantong', 'diagnosis_klinis', 'alasan_transfusi', 'kadar_hb'
  ];

  // fields yang berformat tanggal -> gunakan formatDate
  const dateFields = ['tanggal_permintaan', 'tanggal_diperlukan', 'tanggal_lahir'];

  // fields khusus pasien wanita
  const femaleOnly = ['jumlah_kehamilan', 'pernah_abortus', 'pernah_hdn'];

  db.query('SELECT status, jenis_kelamin FROM permintaan_darah WHERE id = ? LIMIT 1', [id], (err, rows) => {
    if (err) {
      console.error('Error cek status saat edit:', err);
      return res.status(500).json({ success: false, message: 'Gagal cek data' });
    }
    if (!rows || rows.length === 0) return res.status(404).json({ success: false, message: 'Permintaan tidak ditemukan' });

    const curStatus = Number(rows[0].status || 1);
    const curJenisKelamin = rows[0].jenis_kelamin || null;

    if (curStatus === 3) {
      return res.status(409).json({ success: false, message: 'Tidak dapat mengubah: permintaan sudah Disetujui' });
    }

    const sets = [];
    const params = [];

    // jika payload mengandung jenis_kelamin, gunakan itu untuk keputusan femaleOnly; 
    // fallback pakai current db value
    const targetJenisKelamin = (b.jenis_kelamin !== undefined && b.jenis_kelamin !== null) ? String(b.jenis_kelamin) : curJenisKelamin;

    allowed.forEach(k => {
      if (b[k] === undefined) return; // tidak dikirim -> lewati

      // jika field khusus wanita tapi target jenis kelamin bukan 'P', skip update agar tidak kirim '' ke enum
      if (femaleOnly.includes(k) && String(targetJenisKelamin) !== 'P') {
        return;
      }

      // gunakan formatDate untuk date fields (menghasilkan 'YYYY-MM-DD' atau null)
      let val = dateFields.includes(k) ? formatDate(b[k]) : b[k];

      // ubah empty-string menjadi NULL untuk menghindari truncation pada enum / numeric
      if (typeof val === 'string' && val.trim() === '') val = null;

      // pastikan jumlah_kehamilan numeric atau null
      if (k === 'jumlah_kehamilan') {
        if (val === null) {
          val = null;
        } else {
          const n = Number(val);
          val = Number.isFinite(n) ? n : null;
        }
      }

      sets.push(`${k} = ?`);
      params.push(val);
    });

    sets.push('status = 1');
    sets.push("status_keterangan = 'Menunggu Diperiksa oleh Admin UPD'");
    sets.push('updated_at = NOW()');

    if (sets.length === 0) {
      return res.status(400).json({ success: false, message: 'Tidak ada field untuk diupdate' });
    }

    // sets.push('updated_at = NOW()');
    const sql = `UPDATE permintaan_darah SET ${sets.join(', ')} WHERE id = ?`;
    params.push(id);

    db.query(sql, params, (err2) => {
      if (err2) {
        console.error('Error update permintaan:', err2);
        return res.status(500).json({ success: false, message: 'Gagal menyimpan perubahan' });
      }
      return res.json({ success: true, message: 'Permintaan berhasil diperbarui' });
    });
  });
});

// POST /permintaan_darah/delete
router.post('/delete', (req, res) => {
  const b = req.body || {};
  const id = b.id;
  if (!id) return res.status(400).json({ success: false, message: 'ID dibutuhkan' });

  // 1) ambil status sekarang
  db.query('SELECT status FROM permintaan_darah WHERE id = ? LIMIT 1', [id], (err, rows) => {
    if (err) {
      console.error('Error ambil permintaan untuk hapus:', err);
      return res.status(500).json({ success: false, message: 'Gagal cek data' });
    }
    if (!rows || rows.length === 0) return res.status(404).json({ success: false, message: 'Permintaan tidak ditemukan' });

    const statusNow = Number(rows[0].status || 1);
    // hanya izinkan hapus bila Diajukan(1) atau Ditolak(4)
    if (![1, 4].includes(statusNow)) {
      return res.status(409).json({ success: false, message: 'Tidak bisa menghapus permintaan yang sedang diproses atau sudah disetujui' });
    }

    // 2) hapus
    db.query('DELETE FROM permintaan_darah WHERE id = ?', [id], (err2, result) => {
      if (err2) {
        console.error('Error hapus permintaan:', err2);
        return res.status(500).json({ success: false, message: 'Gagal menghapus permintaan' });
      }
      return res.json({ success: true, message: 'Permintaan berhasil dihapus' });
    });
  });
});

module.exports = router;
