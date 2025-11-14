const express = require('express');
const router = express.Router();
const db = require('../../../db/MySql/umum'); // koneksi database

// ===================================================
// 🔹 GET: Lihat semua transaksi darah
// ===================================================
router.get('/view', (req, res) => {
    const page = parseInt(req.query.page) || 1;      // halaman sekarang
    const limit = parseInt(req.query.limit) || 10;   // jumlah data per halaman
    const offset = (page - 1) * limit;
  
    // Ambil semua filter dari query
    const cari_value_raw = req.query.cari_value || ''; // raw value (empty string berarti no-search)
    const cari_value = cari_value_raw ? `%${cari_value_raw}%` : '%%';
    const komponen_id = req.query.komponen_id || '';
    const golongan_darah = req.query.golongan_darah || '';
    const tipe_transaksi = req.query.tipe_transaksi || '';
  
    // Build dynamic filters & params
    const filters = [];
    const params = [];
  
    // always include keterangan search (using '%%' matches all)
    filters.push('t.keterangan LIKE ?');
    params.push(cari_value);
  
    if (komponen_id) {
      filters.push('t.komponen_id = ?');
      params.push(komponen_id);
    }
  
    if (golongan_darah) {
      filters.push('t.golongan_darah = ?');
      params.push(golongan_darah);
    }
  
    if (tipe_transaksi) {
      filters.push('t.tipe_transaksi = ?');
      params.push(tipe_transaksi);
    }
  
    const whereClause = filters.length ? 'WHERE ' + filters.join(' AND ') : '';
  
    // COUNT query (use same whereClause and params)
    const countSql = `
      SELECT COUNT(*) AS total
      FROM transaksi_darah t
      ${whereClause}
    `;
  
    db.query(countSql, params, (err, countResult) => {
      if (err) {
        console.error('Error count transaksi:', err);
        return res.status(500).json({ success: false, message: 'Gagal menghitung data transaksi' });
      }
  
      const total = countResult[0].total;
      const totalPages = Math.ceil(total / limit);
  
      // DATA query — IMPORTANT: pass dataSql as first arg, params+limit+offset as second
      const dataSql = `
        SELECT t.*, k.nama_komponen
        FROM transaksi_darah t
        LEFT JOIN komponen_darah k ON t.komponen_id = k.id
        ${whereClause}
        ORDER BY t.tanggal DESC
        LIMIT ? OFFSET ?
      `;
  
      const dataParams = params.slice(); // copy
      dataParams.push(limit);
      dataParams.push(offset);
  
      db.query(dataSql, dataParams, (err2, dataResult) => {
        if (err2) {
          console.error('Error ambil transaksi:', err2);
          return res.status(500).json({ success: false, message: 'Gagal ambil data transaksi' });
        }
  
        res.json({
          success: true,
          page,
          limit,
          total_data: total,
          total_pages: totalPages,
          data: dataResult
        });
      });
    });
  });
  
  


// ===================================================
// 🔹 POST: Tambah transaksi & update stok otomatis
// ===================================================
// ADD DATA (VALIDASI STOK, TRANSAKSI DB)
router.post('/addData', (req, res) => {
  const { golongan_darah, rhesus, komponen_id, jumlah, tipe_transaksi, keterangan } = req.body;

  if (!golongan_darah || !rhesus || !komponen_id || !jumlah || !tipe_transaksi) {
    return res.status(400).json({ success: false, message: 'Data tidak lengkap' });
  }

  db.getConnection((err, conn) => {
    if (err || !conn) {
      return res.status(500).json({ success: false, message: 'Gagal membuat koneksi DB' });
    }

    const selesai = (status, payload) => {
      try { conn.release(); } catch (e) {}
      if (status === 'ok') return res.json(payload);
      const code = payload && payload.code ? payload.code : 500;
      return res.status(code).json(payload);
    };

    conn.beginTransaction((e0) => {
      if (e0) return selesai('err', { code: 500, success:false, message:'Gagal mulai transaksi DB' });

      // 1) Kunci baris stok
      const lockSql = `
        SELECT jumlah_stok
        FROM stok_darah
        WHERE golongan_darah = ? AND rhesus = ? AND komponen_id = ?
        FOR UPDATE
      `;
      conn.query(lockSql, [golongan_darah, rhesus, komponen_id], (e1, rows) => {
        if (e1) return conn.rollback(() => selesai('err', { code: 500, success:false, message:'Gagal membaca stok' }));
        if (!rows.length) return conn.rollback(() => selesai('err', { code: 404, success:false, message:'Data stok tidak ditemukan' }));

        const stokAwal = Number(rows[0].jumlah_stok || 0);
        const tipe = String(tipe_transaksi).toLowerCase();

        // 2) Validasi kalau keluar
        if (tipe === 'keluar' && stokAwal < Number(jumlah)) {
          return conn.rollback(() =>
            selesai('err', { code: 400, success:false, message:`Stok tidak cukup. Stok: ${stokAwal}, diminta: ${jumlah}` })
          );
        }

        // 3) Insert transaksi
        const insSql = `
          INSERT INTO transaksi_darah (golongan_darah, rhesus, komponen_id, jumlah, tipe_transaksi, keterangan)
          VALUES (?, ?, ?, ?, ?, ?)
        `;
        conn.query(insSql, [golongan_darah, rhesus, komponen_id, jumlah, tipe, keterangan || null], (e2) => {
          if (e2) return conn.rollback(() => selesai('err', { code: 500, success:false, message:'Gagal menambah transaksi' }));

          // 4) Update stok (tanpa GREATEST; sudah tervalidasi)
          const delta = (tipe === 'masuk') ? Number(jumlah) : -Number(jumlah);
          const updSql = `
            UPDATE stok_darah
            SET jumlah_stok = jumlah_stok + ?, tanggal_update = NOW()
            WHERE golongan_darah = ? AND rhesus = ? AND komponen_id = ?
          `;
          conn.query(updSql, [delta, golongan_darah, rhesus, komponen_id], (e3) => {
            if (e3) return conn.rollback(() => selesai('err', { code: 500, success:false, message:'Gagal update stok' }));

            conn.commit((e4) => {
              if (e4) return conn.rollback(() => selesai('err', { code: 500, success:false, message:'Gagal commit transaksi' }));
              return selesai('ok', { success:true, message:`Transaksi ${tipe} berhasil dan stok diperbarui.` });
            });
          });
        });
      });
    });
  });
});


// EDIT DATA (REVERT LAMA, VALIDASI BARU, APPLY BARU)
router.post('/editData', (req, res) => {
  const {
    id_transaksi,
    golongan_darah,
    rhesus,
    komponen_id,
    jumlah,
    tipe_transaksi,
    keterangan
  } = req.body;

  if (!id_transaksi || !golongan_darah || !rhesus || !komponen_id || !jumlah || !tipe_transaksi) {
    return res.status(400).json({ success: false, message: 'Data tidak lengkap' });
  }

  db.getConnection((err, conn) => {
    if (err || !conn) {
      return res.status(500).json({ success: false, message: 'Gagal membuat koneksi DB' });
    }

    const selesai = (status, payload) => {
      try { conn.release(); } catch (e) {}
      if (status === 'ok') return res.json(payload);
      const code = payload && payload.code ? payload.code : 500;
      return res.status(code).json(payload);
    };

    const makeKey = (g, r, k) => `${g}|${r}|${k}`;
    const parseKey = (s) => { const [g, r, k] = s.split('|'); return { g, r, k: Number(k) }; };

    conn.beginTransaction((e0) => {
      if (e0) return selesai('err', { code: 500, success:false, message:'Gagal mulai transaksi DB' });

      // 1) Ambil transaksi lama
      conn.query('SELECT * FROM transaksi_darah WHERE id_transaksi = ?', [id_transaksi], (e1, oldRows) => {
        if (e1) return conn.rollback(() => selesai('err', { code: 500, success:false, message:'Gagal ambil transaksi lama' }));
        if (!oldRows || !oldRows.length) {
          return conn.rollback(() => selesai('err', { code: 404, success:false, message:'Data transaksi tidak ditemukan' }));
        }
        const oldTr = oldRows[0];

        const oldKey = makeKey(oldTr.golongan_darah, oldTr.rhesus, oldTr.komponen_id);
        const newKey = makeKey(golongan_darah, rhesus, komponen_id);
        const keys = Array.from(new Set([oldKey, newKey])).sort(); // urutan konsisten
        const stok = {};

        // 2) Kunci stok untuk old & new
        const lockStock = (i = 0) => {
          if (i >= keys.length) return afterLock();
          const { g, r, k } = parseKey(keys[i]);
          const sql = `
            SELECT jumlah_stok FROM stok_darah
            WHERE golongan_darah = ? AND rhesus = ? AND komponen_id = ?
            FOR UPDATE
          `;
          conn.query(sql, [g, r, k], (eL, rows) => {
            if (eL) return conn.rollback(() => selesai('err', { code: 500, success:false, message:'Gagal kunci stok' }));
            if (!rows.length) return conn.rollback(() => selesai('err', { code: 404, success:false, message:`Data stok tidak ditemukan untuk ${g} ${r} (komponen ${k})` }));
            stok[keys[i]] = Number(rows[0].jumlah_stok || 0);
            lockStock(i + 1);
          });
        };

        const afterLock = () => {
          // 3) Revert efek transaksi lama pada stok lama
          const curOld = stok[oldKey];
          const revertDelta = (String(oldTr.tipe_transaksi).toLowerCase() === 'masuk')
            ? -Number(oldTr.jumlah || 0)
            : +Number(oldTr.jumlah || 0);
          const afterRevert = curOld + revertDelta;
          if (afterRevert < 0) {
            return conn.rollback(() => selesai('err', { code: 409, success:false, message:'Inkonsistensi stok saat revert' }));
          }

          const { g: og, r: orh, k: ok } = parseKey(oldKey);
          conn.query(
            `UPDATE stok_darah SET jumlah_stok = ?, tanggal_update = NOW()
             WHERE golongan_darah = ? AND rhesus = ? AND komponen_id = ?`,
            [afterRevert, og, orh, ok],
            (eR) => {
              if (eR) return conn.rollback(() => selesai('err', { code: 500, success:false, message:'Gagal revert stok' }));

              // 4) Update baris transaksi ke data baru
              const tipeBaru = String(tipe_transaksi).toLowerCase();
              conn.query(
                `UPDATE transaksi_darah
                 SET golongan_darah = ?, rhesus = ?, komponen_id = ?, jumlah = ?, tipe_transaksi = ?, keterangan = ?
                 WHERE id_transaksi = ?`,
                [golongan_darah, rhesus, komponen_id, Number(jumlah), tipeBaru, keterangan || null, id_transaksi],
                (eU) => {
                  if (eU) return conn.rollback(() => selesai('err', { code: 500, success:false, message:'Gagal update transaksi' }));

                  // 5) Validasi stok cukup bila tipe baru = keluar
                  const baseNew = (newKey === oldKey) ? afterRevert : stok[newKey];
                  if (tipeBaru === 'keluar' && baseNew < Number(jumlah)) {
                    return conn.rollback(() => selesai('err', { code: 400, success:false, message:`Stok tidak cukup. Stok: ${baseNew}, diminta: ${jumlah}` }));
                  }

                  // 6) Terapkan efek transaksi baru
                  const deltaNew = (tipeBaru === 'masuk') ? +Number(jumlah) : -Number(jumlah);
                  const finalStok = baseNew + deltaNew;
                  if (finalStok < 0) {
                    return conn.rollback(() => selesai('err', { code: 409, success:false, message:'Operasi membuat stok negatif' }));
                  }

                  const { g: ng, r: nrh, k: nk } = parseKey(newKey);
                  conn.query(
                    `UPDATE stok_darah SET jumlah_stok = ?, tanggal_update = NOW()
                     WHERE golongan_darah = ? AND rhesus = ? AND komponen_id = ?`,
                    [finalStok, ng, nrh, nk],
                    (eA) => {
                      if (eA) return conn.rollback(() => selesai('err', { code: 500, success:false, message:'Gagal apply stok baru' }));

                      conn.commit((eC) => {
                        if (eC) return conn.rollback(() => selesai('err', { code: 500, success:false, message:'Gagal commit transaksi' }));
                        return selesai('ok', { success:true, message:'Transaksi darah berhasil diperbarui dan stok diperbarui ulang.' });
                      });
                    }
                  );
                }
              );
            }
          );
        };

        lockStock();
      });
    });
  });
});


  // ===================================================
// 🔹 DELETE: Hapus transaksi -> revert stok sesuai transaksi lama, lalu hapus transaksi
// ===================================================
router.delete('/delete/:id', (req, res) => {
    const { id } = req.params;
  
    // 1) ambil transaksi yang akan dihapus
    const getSql = `SELECT * FROM transaksi_darah WHERE id_transaksi = ?`;
    db.query(getSql, [id], (err, rows) => {
      if (err) {
        console.error('Error ambil transaksi untuk hapus:', err);
        return res.status(500).json({ success: false, message: 'Gagal ambil data transaksi' });
      }
      if (!rows || rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Transaksi tidak ditemukan' });
      }
  
      const tr = rows[0];
  
      // 2) revert stok sesuai tipe transaksi lama
      // jika tipe = 'masuk' -> kurangi stok
      // jika tipe = 'keluar' -> tambah stok
      let revertSql = '';
      let params = [];
  
      if ((tr.tipe_transaksi || '').toLowerCase() === 'masuk') {
        revertSql = `
          UPDATE stok_darah
          SET jumlah_stok = GREATEST(jumlah_stok - ?, 0), tanggal_update = NOW()
          WHERE golongan_darah = ? AND rhesus = ? AND komponen_id = ?
        `;
        params = [tr.jumlah, tr.golongan_darah, tr.rhesus, tr.komponen_id];
      } else if ((tr.tipe_transaksi || '').toLowerCase() === 'keluar') {
        revertSql = `
          UPDATE stok_darah
          SET jumlah_stok = jumlah_stok + ?, tanggal_update = NOW()
          WHERE golongan_darah = ? AND rhesus = ? AND komponen_id = ?
        `;
        params = [tr.jumlah, tr.golongan_darah, tr.rhesus, tr.komponen_id];
      } else {
        // tipe tidak dikenali, tapi tetap hapus transaksi tanpa revert
        console.warn('Tipe transaksi tidak dikenali saat hapus:', tr.tipe_transaksi);
      }
  
      // jalankan revert (jika ada), lalu hapus transaksi
      const doRevert = (cb) => {
        if (!revertSql) return cb(null);
        db.query(revertSql, params, (err2) => {
          if (err2) {
            console.error('Error revert stok saat hapus transaksi:', err2);
            return cb(err2);
          }
          cb(null);
        });
      };
  
      doRevert((revertErr) => {
        if (revertErr) {
          return res.status(500).json({ success: false, message: 'Gagal ubah stok saat hapus transaksi' });
        }
  
        // 3) hapus transaksi
        const delSql = `DELETE FROM transaksi_darah WHERE id_transaksi = ?`;
        db.query(delSql, [id], (err3) => {
          if (err3) {
            console.error('Error hapus transaksi:', err3);
            return res.status(500).json({ success: false, message: 'Gagal hapus data transaksi' });
          }
          return res.json({ success: true, message: 'Transaksi berhasil dihapus dan stok diperbarui.' });
        });
      });
    });
  });
  

module.exports = router;
