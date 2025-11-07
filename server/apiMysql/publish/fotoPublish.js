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
    const page_limit = parseInt(body.page_limit) || 12;

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

module.exports = router;
