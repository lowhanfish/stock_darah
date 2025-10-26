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
        // Kalau formatnya sudah 'YYYY-MM-DD', langsung kembalikan saja
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
    const {
        id,
        nama_kegiatan,
        tanggal_mulai,
        tanggal_selesai,
        jam,
        lokasi,
        map_link,
        keterangan,
        jumlah_terdaftar,
        status,
        file_name: existingFile
    } = req.body;

    let file_name = existingFile;

    // 🔹 Pastikan status dikonversi jadi angka (kalau dari object atau string)
    let status_value = 1;
    try {
        if (typeof status === 'object') {
            status_value = Number(status.value || status.id || 1);
        } else {
            // jika dikirim sebagai string (termasuk JSON string)
            status_value = Number(JSON.parse(status)) || Number(status) || 1;
        }
    } catch {
        status_value = Number(status) || 1;
    }

    // 🔹 Format tanggal seperti semula
    const tanggal_mulai_formatted = formatDate(tanggal_mulai);
    const tanggal_selesai_formatted = formatDate(tanggal_selesai);

    if (!tanggal_mulai_formatted || !tanggal_selesai_formatted) {
        return res.status(400).json({ success: false, message: 'Format tanggal tidak valid' });
    }

    // 🔹 Query tetap sama, hanya ganti variabel `status_value`
    const query = `
        UPDATE jadwal_donor
        SET nama_kegiatan = ?, tanggal_mulai = ?, tanggal_selesai = ?, jam = ?, lokasi = ?, map_link = ?, keterangan = ?, file_name = ?, jumlah_terdaftar = ?, status = ?
        WHERE id = ?`;
    const params = [
        nama_kegiatan,
        tanggal_mulai_formatted,
        tanggal_selesai_formatted,
        jam,
        lokasi,
        map_link || '',
        keterangan || '',
        file_name,
        jumlah_terdaftar || null,
        status_value, // 👈 ini diganti
        id
    ];

    db.query(query, params, (err, result) => {
        if (err) {
            console.error('Error updating data:', err);
            return res.status(500).json({ success: false, message: 'Gagal update jadwal' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Data tidak ditemukan' });
        }

        res.json({ success: true, message: 'Status berhasil diubah' });
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

router.post('/getParticipants', (req, res) => {
    const { jadwal_id } = req.body;
    if (!jadwal_id) return res.status(400).json({ success: false, message: 'jadwal_id diperlukan' });

    const query = `
        SELECT jp.id as id, p.id as pendonor_id, p.nama_lengkap, p.jenis_kelamin, p.golongan_darah, p.rhesus, p.no_hp, jp.created_at
        FROM jadwal_peserta jp
        LEFT JOIN pendonor_darah p ON p.id = jp.pendonor_id
        WHERE jp.jadwal_id = ?
        ORDER BY jp.created_at DESC
    `;
    db.query(query, [jadwal_id], (err, results) => {
        if (err) {
            console.error('Error getParticipants:', err);
            return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
        }
        return res.json({ success: true, data: results || [] });
    });
});

// Tambah peserta ke jadwal (mengaitkan pendonor_darah ke jadwal)
// POST { jadwal_id, pendonor_id }
router.post('/addParticipant', (req, res) => {
    const { jadwal_id, pendonor_id } = req.body;
    if (!jadwal_id || !pendonor_id) return res.status(400).json({ success: false, message: 'jadwal_id dan pendonor_id diperlukan' });

    // cek apakah pendonor ada
    db.query('SELECT id, nama_lengkap FROM pendonor_darah WHERE id = ?', [pendonor_id], (err, pendRes) => {
        if (err) {
            console.error('Error checking pendonor:', err);
            return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
        }
        if (!pendRes || pendRes.length === 0) {
            return res.status(404).json({ success: false, message: 'Pendonor tidak ditemukan' });
        }

        // cek apakah sudah terdaftar di jadwal ini
        db.query('SELECT id FROM jadwal_peserta WHERE jadwal_id = ? AND pendonor_id = ?', [jadwal_id, pendonor_id], (err, existRes) => {
            if (err) {
                console.error('Error checking existing peserta:', err);
                return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
            }
            if (existRes && existRes.length > 0) {
                return res.status(400).json({ success: false, message: 'Pendonor sudah terdaftar pada jadwal ini' });
            }

            // insert relasi
            const insertQuery = 'INSERT INTO jadwal_peserta (jadwal_id, pendonor_id, created_at) VALUES (?, ?, NOW())';
            db.query(insertQuery, [jadwal_id, pendonor_id], (err, insertResult) => {
                if (err) {
                    console.error('Error addParticipant:', err);
                    return res.status(500).json({ success: false, message: 'Gagal menambah peserta' });
                }
                return res.json({ success: true, message: 'Peserta berhasil ditambahkan' });
            });
        });
    });
});

// Hapus peserta dari jadwal (berdasarkan id di jadwal_peserta)
// POST { id }
router.post('/removeParticipant', (req, res) => {
    const { id } = req.body;
    if (!id) return res.status(400).json({ success: false, message: 'id peserta diperlukan' });

    const delQuery = 'DELETE FROM jadwal_peserta WHERE id = ?';
    db.query(delQuery, [id], (err, result) => {
        if (err) {
            console.error('Error removeParticipant:', err);
            return res.status(500).json({ success: false, message: 'Gagal menghapus peserta' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Peserta tidak ditemukan' });
        }
        return res.json({ success: true, message: 'Peserta berhasil dihapus' });
    });
});

module.exports = router;
