const express = require('express');
var db = require('../../db/MySql/umum');

const fs = require('fs');
const path = require('path');

var multer = require("multer");
var upload = require('../../db/multer/image');

var uniqid = require('uniqid');
const { log } = require('console');
const router = express.Router();
const UPLOADS_DIR = path.join(__dirname, '..', '..', 'public', 'uploads');

// ---------- GETVIEW (POST) ----------
router.post('/getview', (req, res) => {
    const body = req.body || {};
    const data_ke = parseInt(body.data_ke) || 1;
    const cari_value = (body.cari_value || '').toString().trim();
    const page_limit = parseInt(body.page_limit) || 9;

    const offset = (data_ke - 1) * page_limit;

    let where = ' WHERE 1=1 ';
    const params = [];

    if (cari_value !== '') {
        where += ' AND nama_kegiatan LIKE ? ';
        params.push('%' + cari_value + '%');
    }

    // total count
    const countSql = `SELECT COUNT(*) as total FROM foto ${where}`;
    db.query(countSql, params, (err, countRows) => {
        if (err) {
            console.error('❌ getview count error:', err);
            return res.status(500).json({ success: false, message: 'Terjadi kesalahan server', error: String(err) });
        }

        const total = (countRows && countRows[0]) ? countRows[0].total : 0;

        // ambil data dengan limit/offset
        const sql = `SELECT id, nama_kegiatan, file_name, created_by, created_at, updated_at
                     FROM foto
                     ${where}
                     ORDER BY id DESC
                     LIMIT ? OFFSET ?`;
        const dataParams = params.slice();
        dataParams.push(page_limit, offset);

        db.query(sql, dataParams, (err2, rows) => {
            if (err2) {
                console.error('❌ getview data error:', err2);
                return res.status(500).json({ success: false, message: 'Terjadi kesalahan server', error: String(err2) });
            }

            return res.json({
                success: true,
                data: rows || [],
                total: total,
                message: 'Berhasil mengambil data'
            });
        });
    });
});

// ---------- ADDDATA (multipart/form-data) ----------
// middleware multer: gunakan upload.single('file_name') sesuai konfigurasi Anda
router.post('/addData', upload.single('file_name'), (req, res) => {
    try {
        const nama_kegiatan = req.body.nama_kegiatan || '';
        const created_by = null; // jika mau isi dari token, lakukan decode sendiri

        // baca nama file dari multer (beberapa konfigurasi menaruh di req.file.filename / req.file.path / req.file.originalname)
        let file_name = null;
        if (req.file) {
            file_name = req.file.filename || (req.file.path ? path.basename(req.file.path) : req.file.originalname);
        }

        const sql = `INSERT INTO foto (nama_kegiatan, file_name, created_by, created_at, updated_at)
                     VALUES (?, ?, ?, NOW(), NOW())`;
        const params = [nama_kegiatan, file_name, created_by];

        db.query(sql, params, (err, result) => {
            if (err) {
                console.error('❌ addData error:', err);
                return res.status(500).json({ success: false, message: 'Gagal menambah foto', error: String(err) });
            }

            return res.json({ success: true, message: 'Sukses menambah foto', insertId: result.insertId || null });
        });
    } catch (e) {
        console.error('❌ addData unexpected error:', e);
        return res.status(500).json({ success: false, message: 'Terjadi kesalahan server', error: String(e) });
    }
});

// ---------- EDITDATA (multipart/form-data) ----------
router.post('/editData', upload.single('file_name'), (req, res) => {
    try {
        const id = req.body.id;
        if (!id) return res.status(400).json({ success: false, message: 'ID diperlukan' });

        db.query('SELECT * FROM foto WHERE id = ?', [id], (err, rows) => {
            if (err) {
                console.error('❌ editData select error:', err);
                return res.status(500).json({ success: false, message: 'Terjadi kesalahan server', error: String(err) });
            }

            if (!rows || rows.length === 0) {
                return res.json({ success: false, message: 'Data tidak ditemukan' });
            }

            const old = rows[0];
            const nama_kegiatan = req.body.nama_kegiatan || old.nama_kegiatan || '';

            let new_file_name = old.file_name || null;

            if (req.file) {
                // file baru diupload
                new_file_name = req.file.filename || (req.file.path ? path.basename(req.file.path) : req.file.originalname);

                // hapus file lama fisik jika ada
                if (old.file_name) {
                    const oldPath = path.join(UPLOADS_DIR, old.file_name);
                    fs.unlink(oldPath, (unlinkErr) => {
                        if (unlinkErr && unlinkErr.code !== 'ENOENT') {
                            console.warn('Gagal menghapus file lama:', oldPath, unlinkErr);
                        }
                    });
                }
            } else {
                // frontend mengirimkan file_name string nama file lama (atau 'null')
                if (req.body.file_name && req.body.file_name !== 'null') {
                    new_file_name = req.body.file_name;
                } else {
                    new_file_name = old.file_name || null;
                }
            }

            const updateSql = `UPDATE foto SET nama_kegiatan = ?, file_name = ?, updated_at = NOW() WHERE id = ?`;
            db.query(updateSql, [nama_kegiatan, new_file_name, id], (updErr, updRes) => {
                if (updErr) {
                    console.error('❌ editData update error:', updErr);
                    return res.status(500).json({ success: false, message: 'Gagal update foto', error: String(updErr) });
                }

                return res.json({ success: true, message: 'Sukses update foto' });
            });
        });
    } catch (e) {
        console.error('❌ editData unexpected error:', e);
        return res.status(500).json({ success: false, message: 'Terjadi kesalahan server', error: String(e) });
    }
});

// ---------- REMOVEDATA (application/json) ----------
router.post('/removeData', (req, res) => {
    try {
        const id = req.body.id;
        if (!id) return res.status(400).json({ success: false, message: 'ID diperlukan' });

        db.query('SELECT * FROM foto WHERE id = ?', [id], (err, rows) => {
            if (err) {
                console.error('❌ removeData select error:', err);
                return res.status(500).json({ success: false, message: 'Terjadi kesalahan server', error: String(err) });
            }

            if (!rows || rows.length === 0) {
                return res.json({ success: false, message: 'Data tidak ditemukan' });
            }

            const row = rows[0];

            db.query('DELETE FROM foto WHERE id = ?', [id], (delErr, delRes) => {
                if (delErr) {
                    console.error('❌ removeData delete error:', delErr);
                    return res.status(500).json({ success: false, message: 'Gagal menghapus foto', error: String(delErr) });
                }

                // hapus file fisik jika ada
                if (row.file_name) {
                    const filePath = path.join(UPLOADS_DIR, row.file_name);
                    fs.unlink(filePath, (unlinkErr) => {
                        if (unlinkErr && unlinkErr.code !== 'ENOENT') {
                            console.warn('Gagal menghapus file saat removeData:', filePath, unlinkErr);
                        }
                    });
                }

                return res.json({ success: true, message: 'Sukses menghapus foto' });
            });
        });
    } catch (e) {
        console.error('❌ removeData unexpected error:', e);
        return res.status(500).json({ success: false, message: 'Terjadi kesalahan server', error: String(e) });
    }
});

module.exports = router;
