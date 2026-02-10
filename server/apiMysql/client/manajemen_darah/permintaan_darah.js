const express = require('express');
const router = express.Router();
const db = require('../../../db/MySql/umum'); // koneksi database
const generatePermintaanPdf = require('../../../utils/generatePermintaanPdf');
const fs = require('fs');
const path = require('path');


function mapTargetRoomByStatus(status, ruanganId = null) {
  const statusNum = Number(status);
  
  switch (statusNum) {
    case 1: // pengajuan baru → UPD
    case 4: // selesai → UPD
      return 'upd';

    case 3: // siap diambil → RUANGAN
    case 5: // ditolak → RUANGAN
    case 6: // telah diambil → RUANGAN
      return ruanganId ? `ruangan:${ruanganId}` : null;

    case 2: // sedang diperiksa → mungkin tidak perlu notifikasi
    default:
      return null;
  }
}

function emitStatusUpdate(req, status, permintaanId, ruanganId = null) {
  const io = req.app.get('io');
  
  // Jika ruanganId sudah diberikan, gunakan langsung
  if (ruanganId !== null) {
    const room = mapTargetRoomByStatus(status, ruanganId);
    if (room) {
      io.to(room).emit('permintaan_status_update', {
        id: permintaanId,
        status,
        pesan: statusText(status),
        timestamp: new Date().toISOString()
      });
    }
    return;
  }
  
  // Jika ruanganId tidak diberikan, query dari database
  db.query(
    'SELECT ruangan_id FROM permintaan_darah WHERE id = ? LIMIT 1',
    [permintaanId],
    (err, rows) => {
      if (err || !rows.length) {
        console.error('Error getting ruangan_id for notification:', err);
        return;
      }

      const ruanganId = rows[0].ruangan_id;
      const room = mapTargetRoomByStatus(status, ruanganId);

      if (room) {
        io.to(room).emit('permintaan_status_update', {
          id: permintaanId,
          status,
          pesan: statusText(status),
          timestamp: new Date().toISOString()
        });
      }
    }
  );
}




function statusText(status) {
  switch (Number(status)) {
    case 1: return 'Permintaan darah baru'
    case 2: return 'Permintaan sedang diperiksa'
    case 3: return 'Darah siap diambil'
    case 4: return 'Permintaan darah selesai'
    case 5: return 'Permintaan darah ditolak'
    case 6: return 'Darah telah diambil'
    default: return 'Update status permintaan darah'
  }
}


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
    'jumlah_kantong',
    'jumlah_cc',
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
    body.golongan_darah || null,
    body.rhesus || null,
    body.komponen_id || null,
    Number(body.jumlah_kantong || 0),
    Number(body.jumlah_cc || 0),
    body.diagnosis_klinis || null,
    body.alasan_transfusi || null,
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
      return res.status(500).json({
        success: false,
        message: 'Gagal menambah permintaan darah'
      });
    }

    const insertedId = result.insertId;
    db.query(
      'SELECT ruangan_id FROM permintaan_darah WHERE id = ? LIMIT 1',
      [insertedId],
      (err, rows) => {
        if (err || !rows.length) {
          console.error('Gagal mendapatkan data ruangan setelah insert:', err);
          // Tetap berikan response sukses meskipun notifikasi gagal
          return res.json({
            success: true,
            message: 'Permintaan darah berhasil diajukan (notifikasi gagal)',
            id: insertedId
          });
        }

        const ruanganId = rows[0].ruangan_id;
        emitStatusUpdate(req, 1, insertedId, ruanganId); // Kirim ruanganId sebagai parameter

        return res.json({
          success: true,
          message: 'Permintaan darah berhasil diajukan',
          id: insertedId
        });
      }
    );
  });
});




router.post('/updateStatus', (req, res) => {
  const b = req.body || {};
  const id = b.id;
  const status = Number(b.status);

  if (!id) return res.status(400).json({ success: false, message: 'ID permintaan dibutuhkan' });

  const allowedStatuses = [1, 2, 3, 4, 5, 6];
  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: 'Status tidak valid' });
  }

  if (status === 5 && (!b.status_keterangan || String(b.status_keterangan).trim() === '')) {
    return res.status(400).json({ success: false, message: 'Keterangan penolakan wajib diisi saat status = 5' });
  }

  function toMySQLDateTime(val) {
    if (val === undefined || val === null) return null;
    if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(val)) {
      return val;
    }
    if (typeof val === 'number' || (typeof val === 'string' && /^\d+$/.test(val))) {
      const num = Number(val);
      const asMs = (String(num).length <= 10) ? num * 1000 : num;
      const d = new Date(asMs);
      if (isNaN(d.getTime())) return null;
      const pad = (n) => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    }
    if (val instanceof Date) {
      const d = val; const pad = (n) => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    }
    try {
      const d = new Date(val);
      if (isNaN(d.getTime())) return null;
      const pad = (n) => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    } catch (e) {
      return null;
    }
  }

  if (b.tanggal_pemeriksaan !== undefined) {
    const converted = toMySQLDateTime(b.tanggal_pemeriksaan);
    b.tanggal_pemeriksaan = converted;
  }

  const allowed = [
    'status_keterangan', 'petugas_pemeriksa', 'tanggal_pemeriksaan', 'komponen_id',
    'golongan_darah', 'exp', 'rhesus', 'catatan_tambahan',
    'crossmatch_1', 'crossmatch_2', 'crossmatch_3',
    'jumlah_darah_diberikan', 'jumlah_darah_diberikan_cc', 'nomor_kantong',
    'petugas_pengeluar', 'penerima_darah',
    'jam_pengambilan', 'catatan_pengambilan'
  ];

  const sets = ['status = ?'];
  const params = [status];

  const allowedStage1 = [
    'status_keterangan', 'petugas_pemeriksa', 'tanggal_pemeriksaan',
    'komponen_id', 'golongan_darah', 'rhesus', 'exp',
    'catatan_tambahan',
    'crossmatch_1', 'crossmatch_2', 'crossmatch_3',
    'jumlah_darah_diberikan', 'jumlah_darah_diberikan_cc', 'nomor_kantong'
  ];

  const allowedStage2 = [
    'petugas_pengeluar', 'penerima_darah',
    'jam_pengambilan', 'catatan_pengambilan'
  ];

  let allowedFinal = allowed;

  if (status === 3) allowedFinal = allowedStage1;
  if (status === 6) allowedFinal = allowedStage2;


  allowedFinal.forEach(key => {
    if (b[key] !== undefined) {
      let val = b[key];
      if (typeof val === 'string' && val.trim() === '') val = null;
      sets.push(`${key} = ?`);
      params.push(val);
    }
  });

  let tanggalPengambilanHandled = false;
  if (b.tanggal_pengambilan !== undefined) {
    const v = (typeof b.tanggal_pengambilan === 'string' && b.tanggal_pengambilan.trim() === '') ? null : b.tanggal_pengambilan;
    sets.push('tanggal_pengambilan = ?');
    params.push(v);
    tanggalPengambilanHandled = true;
  }

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

  if (status === 6 && !tanggalPengambilanHandled) {
    sets.push('tanggal_pengambilan = NOW()');
  }

  sets.push('updated_at = NOW()');
  const sqlUpdate = `UPDATE permintaan_darah SET ${sets.join(', ')} WHERE id = ?`;
  params.push(id);

  // ================================
  // CEK STOK DI TAHAP 1 (status = 3)
  // ================================
  if (status === 3) {
    const gol = b.golongan_darah;
    const rh = b.rhesus;
    const komponen = b.komponen_id;
    const jumlah = Number(b.jumlah_darah_diberikan || 0);

    if (!gol || !rh || !komponen || !jumlah || jumlah <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Data pemeriksaan belum lengkap untuk pengecekan stok'
      });
    }

    const cekSql = `
    SELECT jumlah_stok
    FROM stok_darah
    WHERE golongan_darah = ?
      AND rhesus = ?
      AND komponen_id = ?
    LIMIT 1
  `;

    db.query(cekSql, [gol, rh, komponen], (err, rows) => {
      if (err) {
        console.error('Error cek stok (Tahap 1):', err);
        return res.status(500).json({
          success: false,
          message: 'Gagal mengecek stok darah'
        });
      }

      const stokNow = rows?.[0]?.jumlah_stok || 0;
      if (stokNow < jumlah) {
        return res.status(400).json({
          success: false,
          message: `Stok tidak cukup. Stok tersedia: ${stokNow}, diminta: ${jumlah}`
        });
      }

      // ✔️ stok aman → lanjut ke proses update normal
      lanjutProsesUpdate();
    });

    return; // HENTIKAN FLOW di sini
  }

  lanjutProsesUpdate();



  // gunakan connection dan transaction karena kita mungkin akan melakukan banyak query (insert transaksi + update stok)
  function lanjutProsesUpdate() {
    db.getConnection((connErr, connection) => {
      if (connErr) {
        console.error('DB getConnection error:', connErr);
        return res.status(500).json({ success: false, message: 'Koneksi database gagal' });
      }

      connection.beginTransaction(txErr => {
        if (txErr) {
          connection.release();
          console.error('beginTransaction error:', txErr);
          return res.status(500).json({ success: false, message: 'Gagal memulai transaksi DB' });
        }

        connection.query(sqlUpdate, params, (updErr, updRes) => {
          if (updErr) {
            return connection.rollback(() => {
              connection.release();
              console.error('Error updateStatus permintaan_darah:', updErr);
              return res.status(500).json({ success: false, message: 'Gagal memperbarui status permintaan' });
            });
          }

          if (updRes.affectedRows === 0) {
            return connection.rollback(() => {
              connection.release();
              return res.status(404).json({ success: false, message: 'Permintaan tidak ditemukan' });
            });
          }

          // jika bukan status yang memicu pembuatan transaksi ('6'), commit dan selesai
          if (status !== 6) {
            return connection.commit(commitErr => {
              if (commitErr) {
                return connection.rollback(() => {
                  connection.release();
                  console.error('commit error:', commitErr);
                  return res.status(500).json({ success: false, message: 'Gagal menyelesaikan transaksi DB' });
                });
              }
              connection.release();

              if (status === 4) {
                // ambil data dulu
                db.query(
                  `SELECT p.*
                   FROM permintaan_darah p
                   WHERE p.id = ? LIMIT 1`,
                  [id],
                  async (err, rows) => {
                    if (err || !rows.length) {
                      console.error('Gagal ambil data untuk PDF:', err);
                      return;
                    }
              
                    // CEK: jangan buat ulang kalau sudah ada file
                    if (rows[0].file) {
                      return;
                    }
              
                    try {
                      // 🔥 BUAT PDF
                      const pdfResult = await generatePermintaanPdf(id);
              
                      // 🔥 SIMPAN NAMA FILE KE DATABASE
                      db.query(
                        `UPDATE permintaan_darah
                         SET file = ?, file_type = 'application/pdf'
                         WHERE id = ?`,
                        [pdfResult.filename, id]
                      );
                    } catch (e) {
                      console.error('Gagal generate PDF:', e);
                    }
                  }
                );
              }
              

        
              emitStatusUpdate(req, status, id)

              return res.json({
                success: true,
                // message: 'Status permintaan berhasil diperbarui'
              });

            });
          }

          // --- status === 6 : buat transaksi_darah 'keluar' + update stok ---
          const selSql = `
            SELECT p.id, p.jumlah_darah_diberikan, p.jumlah_darah_diberikan_cc, p.golongan_darah, p.rhesus, p.komponen_id,
                   tm.nama_ruangan
            FROM permintaan_darah p
            LEFT JOIN tenaga_medis tm ON p.ruangan_id = tm.id
            WHERE p.id = ? LIMIT 1
          `;
          connection.query(selSql, [id], (selErr, selRows) => {
            if (selErr) {
              return connection.rollback(() => {
                connection.release();
                console.error('Error select permintaan:', selErr);
                return res.status(500).json({ success: false, message: 'Gagal membaca data permintaan setelah update' });
              });
            }

            if (!selRows || !selRows.length) {
              // commit update saja, beri info bahwa transaksi tidak dibuat karena data tidak ditemukan
              return connection.commit(commitErr => {
                if (commitErr) {
                  return connection.rollback(() => {
                    connection.release();
                    console.error('commit error:', commitErr);
                    return res.status(500).json({ success: false, message: 'Gagal menyelesaikan transaksi DB' });
                  });
                }
                connection.release();
                return res.json({ success: true, message: 'Status diperbarui, tapi data permintaan tidak ditemukan untuk pembuatan transaksi.' });
              });
            }

            const perm = selRows[0];
            const jumlah = Number(perm.jumlah_darah_diberikan || 0);
            const jumlah_cc = Number(perm.jumlah_darah_diberikan_cc || 0);
            const gol = perm.golongan_darah || null;
            const rh = perm.rhesus || null;
            const komponen = perm.komponen_id || null;
            const nama_ruangan = perm.nama_ruangan || '-';

            if (!gol || !rh || !komponen || !jumlah || jumlah <= 0) {
              return connection.commit(commitErr => {
                if (commitErr) {
                  return connection.rollback(() => {
                    connection.release();
                    console.error('commit error:', commitErr);
                    return res.status(500).json({ success: false, message: 'Gagal menyelesaikan transaksi DB' });
                  });
                }
                connection.release();
                return res.json({
                  success: true,
                  message: 'Status permintaan diperbarui. Namun transaksi darah otomatis TIDAK dibuat karena data transaksi (golongan/rhesus/komponen/jumlah) tidak lengkap.'
                });
              });
            }

            const keterangan = `Permintaan Darah dari Ruangan ${nama_ruangan}`;

            // lock stok
            const lockSql = `SELECT jumlah_stok FROM stok_darah WHERE golongan_darah = ? AND rhesus = ? AND komponen_id = ? FOR UPDATE`;
            connection.query(lockSql, [gol, rh, komponen], (lockErr, lockRows) => {
              if (lockErr) {
                return connection.rollback(() => {
                  connection.release();
                  console.error('Error lock stok:', lockErr);
                  return res.status(500).json({ success: false, message: 'Gagal mengunci stok' });
                });
              }
              if (!lockRows || !lockRows.length) {
                return connection.rollback(() => {
                  connection.release();
                  return res.status(404).json({ success: false, message: 'Data stok tidak ditemukan (untuk golongan/rhesus/komponen tersebut)' });
                });
              }

              const stokNow = Number(lockRows[0].jumlah_stok || 0);
              if (stokNow < jumlah) {
                return connection.rollback(() => {
                  connection.release();
                  return res.status(400).json({ success: false, message: 'Stok berubah setelah pemeriksaan. Hubungi admin UPD.' });
                });
              }

              // insert transaksi_darah (tipe = 'keluar')
              const tipe = 'keluar';
              const insSql = `INSERT INTO transaksi_darah
                (golongan_darah, rhesus, komponen_id, jumlah, tipe_transaksi, keterangan)
                VALUES (?, ?, ?, ?, ?, ?)`;
              connection.query(insSql, [gol, rh, komponen, jumlah, tipe, keterangan], (insErr) => {
                if (insErr) {
                  return connection.rollback(() => {
                    connection.release();
                    console.error('Error inserting transaksi_darah:', insErr);
                    return res.status(500).json({ success: false, message: 'Gagal mencatat transaksi darah' });
                  });
                }

                // update stok_darah (kurangi)
                const updSql = `UPDATE stok_darah SET jumlah_stok = jumlah_stok - ?, tanggal_update = NOW()
                                WHERE golongan_darah = ? AND rhesus = ? AND komponen_id = ?`;
                connection.query(updSql, [jumlah, gol, rh, komponen], (updErr2) => {
                  if (updErr2) {
                    return connection.rollback(() => {
                      connection.release();
                      console.error('Error update stok_darah:', updErr2);
                      return res.status(500).json({ success: false, message: 'Gagal memperbarui stok darah' });
                    });
                  }

                  // commit semua
                  connection.commit(commitErr2 => {
                    if (commitErr2) {
                      return connection.rollback(() => {
                        connection.release();
                        console.error('commit error:', commitErr2);
                        return res.status(500).json({ success: false, message: 'Gagal menyelesaikan transaksi DB' });
                      });
                    }
                    connection.release();

                   
                    emitStatusUpdate(req, status, id)

                    return res.json({
                      success: true,
                      message: 'Status permintaan diperbarui dan transaksi darah keluar tercatat.'
                    });


                  });
                });
              });
            }); // end lock stok
          }); // end select permintaan
        }); // end update query
      }); // end beginTransaction
    }); // end getConnection
  }
});



// POST /permintaan_darah/edit
router.post('/edit', (req, res) => {
  const b = req.body || {};
  const id = b.id;
  if (!id) return res.status(400).json({ success: false, message: 'ID dibutuhkan' });

  // ===== tambahan backend: sanitasi & validasi untuk Riwayat Transfusi & Coomb's =====
  const allowedYesNo = (v) => (v === 'Ya' || v === 'Tidak') ? v : 'Tidak';

  const transfusi_sebelumnya = b.transfusi_sebelumnya !== undefined ? allowedYesNo(String(b.transfusi_sebelumnya)) : undefined;
  const transfusi_kapan = b.transfusi_kapan !== undefined ? (b.transfusi_kapan ? String(b.transfusi_kapan).trim() : null) : undefined;

  const reaksi_transfusi = b.reaksi_transfusi !== undefined ? allowedYesNo(String(b.reaksi_transfusi)) : undefined;
  const gejala_transfusi = b.gejala_transfusi !== undefined ? (b.gejala_transfusi ? String(b.gejala_transfusi).trim() : null) : undefined;

  const coomb_test = b.coomb_test !== undefined ? allowedYesNo(String(b.coomb_test)) : undefined;
  const coomb_tempat = b.coomb_tempat !== undefined ? (b.coomb_tempat ? String(b.coomb_tempat).trim() : null) : undefined;
  const coomb_kapan = b.coomb_kapan !== undefined ? (formatDate(b.coomb_kapan) || null) : undefined;
  const coomb_hasil = b.coomb_hasil !== undefined ? (b.coomb_hasil ? String(b.coomb_hasil).trim() : null) : undefined;

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

  const allowed = [
    'nama_dokter', 'tanggal_permintaan', 'tanggal_diperlukan', 'nama_pasien', 'nomor_rm', 'tanggal_lahir', 'alamat', 'nama_wali',
    'jenis_kelamin', 'jumlah_kehamilan', 'pernah_abortus', 'pernah_hdn',
    'golongan_darah', 'rhesus', 'komponen_id', 'jumlah_kantong', 'jumlah_cc', 'diagnosis_klinis', 'alasan_transfusi', 'kadar_hb',
    // tambahan field Riwayat Transfusi & Pemeriksaan Serologi
    'transfusi_sebelumnya', 'transfusi_kapan', 'reaksi_transfusi', 'gejala_transfusi',
    'coomb_test', 'coomb_tempat', 'coomb_kapan', 'coomb_hasil'
  ];

  // fields yang berformat tanggal -> gunakan formatDate
  const dateFields = ['tanggal_permintaan', 'tanggal_diperlukan', 'tanggal_lahir', 'coomb_kapan'];

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

    // validasi tambahan khusus pasien wanita
    const targetJenisKelamin = (b.jenis_kelamin !== undefined && b.jenis_kelamin !== null) ? String(b.jenis_kelamin) : curJenisKelamin;
    if (targetJenisKelamin === 'P') {
      if (b.jumlah_kehamilan === undefined || b.jumlah_kehamilan === null) {
        return res.status(400).json({ success: false, message: 'Jumlah kehamilan wajib diisi untuk pasien perempuan' });
      }
      if (
        !['Ya', 'Tidak'].includes(b.pernah_abortus || '') ||
        !['Ya', 'Tidak'].includes(b.pernah_hdn || '')
      ) {
        return res.status(400).json({ success: false, message: 'Pernah abortus dan pernah HDN wajib diisi untuk pasien perempuan' });
      }
    }

    const sets = [];
    const params = [];

    allowed.forEach(k => {
      let val;

      // untuk field baru, gunakan nilai yang sudah disanitasi
      if (k === 'transfusi_sebelumnya') val = transfusi_sebelumnya;
      else if (k === 'transfusi_kapan') val = transfusi_kapan;
      else if (k === 'reaksi_transfusi') val = reaksi_transfusi;
      else if (k === 'gejala_transfusi') val = gejala_transfusi;
      else if (k === 'coomb_test') val = coomb_test;
      else if (k === 'coomb_tempat') val = coomb_tempat;
      else if (k === 'coomb_kapan') val = coomb_kapan;
      else if (k === 'coomb_hasil') val = coomb_hasil;
      else val = b[k];

      if (val === undefined) return; // tidak dikirim -> lewati

      // jika field khusus wanita tapi target jenis kelamin bukan 'P', skip update agar tidak kirim '' ke enum
      if (femaleOnly.includes(k) && String(targetJenisKelamin) !== 'P') {
        return;
      }

      // gunakan formatDate untuk date fields (menghasilkan 'YYYY-MM-DD' atau null)
      if (dateFields.includes(k) && typeof val === 'string') {
        val = formatDate(val);
      }

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
    if (![1, 5].includes(statusNow)) {
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

// router.get('/pdf/:id', (req, res) => {
//   const { id } = req.params;

//   db.query(
//     'SELECT file, file_type FROM permintaan_darah WHERE id = ? LIMIT 1',
//     [id],
//     (err, rows) => {
//       if (err || !rows.length || !rows[0].file) {
//         return res.status(404).json({ message: 'File PDF tidak ditemukan' });
//       }

//       const filePath = path.join(process.cwd(), 'uploads', rows[0].file);

//       if (!fs.existsSync(filePath)) {
//         return res.status(404).json({ message: 'File fisik tidak ditemukan' });
//       }

//       res.setHeader('Content-Type', rows[0].file_type);
//       res.sendFile(filePath);
//     }
//   );
// });
router.get('/pdf/:id', (req, res) => {
  const { id } = req.params
  const { key } = req.query   // ← pakai key, BUKAN token

  if (!key) {
    return res.status(401).json({ message: 'Key PDF tidak ditemukan' })
  }

  db.query(
    `SELECT file, file_type, pdf_key, pdf_key_expired
     FROM permintaan_darah
     WHERE id = ?
     LIMIT 1`,
    [id],
    (err, rows) => {
      if (err) {
        console.error('DB error pdf:', err)
        return res.status(500).json({ message: 'DB error' })
      }

      if (!rows.length) {
        return res.status(404).json({ message: 'Data tidak ditemukan' })
      }

      const row = rows[0]

      // validasi key
      if (
        row.pdf_key !== key ||
        !row.pdf_key_expired ||
        new Date(row.pdf_key_expired) < new Date()
      ) {
        return res.status(403).json({ message: 'Link PDF tidak valid / expired' })
      }

      const filePath = path.join(process.cwd(), 'uploads', row.file)

      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: 'File PDF tidak ditemukan' })
      }

      res.setHeader('Content-Type', 'application/pdf')
      res.setHeader(
        'Content-Disposition',
        `inline; filename="${row.file}"`
      )

      return res.sendFile(filePath)
    }
  )
})



module.exports = router;
