const express = require('express');
var db = require('../../db/MySql/umum');

const fs = require('fs');
const path = require('path');

var multer = require("multer");
var upload = require('../../db/multer/image');

var uniqid = require('uniqid');
const { log } = require('console');
const router = express.Router();

// Asumsi tabel database bernama 'jadwal_donor' dengan kolom:
// id (primary key, auto increment), nama_kegiatan, tanggal_mulai, tanggal_selesai, jam, lokasi, map_link, keterangan, file_name, jumlah_terdaftar, status

// Helper function untuk format tanggal ke 'YYYY-MM-DD'
function formatDate(dateString) {
    if (!dateString) return null;
    try {
        const date = new Date(dateString);
        return date.toISOString().split('T')[0]; // 'YYYY-MM-DD'
    } catch (e) {
        return null;
    }
}

// Route untuk getview (mengambil data jadwal donor dengan pagination dan pencarian)
router.post('/getview', (req, res) => {
    const { data_ke, cari_value, page_limit } = req.body;
    const offset = (data_ke - 1) * page_limit;
    let query = `SELECT * FROM jadwal_donor WHERE 1=1`;
    let params = [];
    let totalQuery = `SELECT COUNT(*) as total FROM jadwal_donor WHERE 1=1`;

    if (cari_value) {
        query += ` AND (lokasi LIKE ? OR keterangan LIKE ?)`;
        totalQuery += ` AND (lokasi LIKE ? OR keterangan LIKE ?)`;
        params.push(`%${cari_value}%`, `%${cari_value}%`);
    }

    query += ` ORDER BY tanggal_mulai DESC LIMIT ? OFFSET ?`;
    params.push(page_limit, offset);

    db.query(totalQuery, params.slice(0, cari_value ? 2 : 0), (err, totalResult) => {
        if (err) {
            console.error('Error fetching total:', err);
            return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
        }

        const total = totalResult[0].total;

        db.query(query, params, (err, results) => {
            if (err) {
                console.error('Error fetching data:', err);
                return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
            }

            res.json({
                success: true,
                data: results,
                total: total
            });
        });
    });
});

// Route untuk addData (menambah jadwal donor baru)
router.post('/addData', upload.single('file_name'), (req, res) => {
    const { nama_kegiatan, tanggal_mulai, tanggal_selesai, jam, lokasi, map_link, keterangan, jumlah_terdaftar, status } = req.body;
    let file_name = null;

    if (req.file) {
        file_name = req.file.filename; // Asumsi multer menyimpan file dengan nama unik
    }

    const tanggal_mulai_formatted = formatDate(tanggal_mulai);
    const tanggal_selesai_formatted = formatDate(tanggal_selesai);

    if (!tanggal_mulai_formatted || !tanggal_selesai_formatted) {
        return res.status(400).json({ success: false, message: 'Format tanggal tidak valid' });
    }

    const query = `INSERT INTO jadwal_donor (nama_kegiatan, tanggal_mulai, tanggal_selesai, jam, lokasi, map_link, keterangan, file_name, jumlah_terdaftar, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const params = [nama_kegiatan, tanggal_mulai_formatted, tanggal_selesai_formatted, jam, lokasi, map_link || '', keterangan || '', file_name, jumlah_terdaftar || null, status || 1];

    db.query(query, params, (err, result) => {
        if (err) {
            console.error('Error adding data:', err);
            return res.status(500).json({ success: false, message: 'Gagal menambah jadwal' });
        }

        res.json({ success: true, message: 'Jadwal donor berhasil ditambahkan' });
    });
});

// Route untuk editData (mengupdate jadwal donor)
router.post('/editData', upload.single('file_name'), (req, res) => {
    const { id, nama_kegiatan, tanggal_mulai, tanggal_selesai, jam, lokasi, map_link, keterangan, jumlah_terdaftar, status, file_name: existingFile } = req.body;
    let file_name = existingFile; // Default ke file lama

    if (req.file) {
        // Jika ada file baru, hapus file lama jika ada
        if (existingFile) {
            const oldFilePath = path.join(__dirname, '../../uploads', existingFile);
            if (fs.existsSync(oldFilePath)) {
                fs.unlinkSync(oldFilePath);
            }
        }
        file_name = req.file.filename;
    }

    const tanggal_mulai_formatted = formatDate(tanggal_mulai);
    const tanggal_selesai_formatted = formatDate(tanggal_selesai);

    if (!tanggal_mulai_formatted || !tanggal_selesai_formatted) {
        return res.status(400).json({ success: false, message: 'Format tanggal tidak valid' });
    }

    const query = `UPDATE jadwal_donor SET nama_kegiatan = ?, tanggal_mulai = ?, tanggal_selesai = ?, jam = ?, lokasi = ?, map_link = ?, keterangan = ?, file_name = ?, jumlah_terdaftar = ?, status = ? WHERE id = ?`;
    const params = [nama_kegiatan, tanggal_mulai_formatted, tanggal_selesai_formatted, jam, lokasi, map_link || '', keterangan || '', file_name, jumlah_terdaftar || null, status || 1, id];

    db.query(query, params, (err, result) => {
        if (err) {
            console.error('Error updating data:', err);
            return res.status(500).json({ success: false, message: 'Gagal update jadwal' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Data tidak ditemukan' });
        }

        res.json({ success: true, message: 'Jadwal donor berhasil diupdate' });
    });
});

// Route untuk removeData (menghapus jadwal donor)
router.post('/removeData', (req, res) => {
    const { id } = req.body;

    // Ambil file_name dulu untuk menghapus file
    const selectQuery = `SELECT file_name FROM jadwal_donor WHERE id = ?`;
    db.query(selectQuery, [id], (err, results) => {
        if (err) {
            console.error('Error fetching file_name:', err);
            return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
        }

        if (results.length === 0) {
            return res.status(404).json({ success: false, message: 'Data tidak ditemukan' });
        }

        const file_name = results[0].file_name;

        // Hapus file jika ada
        if (file_name) {
            const filePath = path.join(__dirname, '../../uploads', file_name);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        // Hapus data dari database
        const deleteQuery = `DELETE FROM jadwal_donor WHERE id = ?`;
        db.query(deleteQuery, [id], (err, result) => {
            if (err) {
                console.error('Error deleting data:', err);
                return res.status(500).json({ success: false, message: 'Gagal menghapus jadwal' });
            }

            res.json({ success: true, message: 'Jadwal donor berhasil dihapus' });
        });
    });
});

module.exports = router;
