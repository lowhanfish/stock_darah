const express = require('express');
var db = require('../../../db/MySql/umum');

const fs = require('fs');

var multer = require("multer");

var uniqid = require('uniqid');
const { log } = require('console');
const router = express.Router();

// POST /komponen_darah/view
router.post('/view', (req, res) => {
    let cari = req.body.cari_value || "";
  
    // Ambil semua data tanpa paginasi
    let view = `
        SELECT *
        FROM komponen_darah
        WHERE nama_komponen LIKE '%` + cari + `%'
        ORDER BY nama_komponen ASC
    `;
  
    db.query(view, (err, result) => {
        if (err) {
            console.log('Error View:', err);
            return res.json(err);
        }
        res.json({
            data: result,
            total_data: result.length
        });
    });
});

// POST /komponen_darah/addData
router.post('/addData', (req, res) => {
    var id = uniqid();
    var data = req.body;

    let insert = `INSERT INTO komponen_darah (id, nama_komponen)
    VALUES (
        '` + id + `',
        '` + data.nama_komponen + `'
    )`;

    db.query(insert, (err, row) => {
        if (err) {
            console.log('Error Insert Komponen Darah:', err);
            res.send(err);
        } else {
            console.log('Insert Success:', row);
            res.send(row);
        }
    });
});

// POST /komponen_darah/editData
router.post('/editData', (req, res) => {
    var data = req.body;

    let query = `
        UPDATE komponen_darah SET
        nama_komponen = '` + data.nama_komponen + `'
        WHERE id = '` + data.id + `'
    `;

    db.query(query, (err, row) => {
        if (err) {
            console.log('Error Update Komponen Darah:', err);
            res.send(err);
        } else {
            res.send(row);
        }
    });
});

// POST /komponen_darah/removeData
router.post('/removeData', (req, res) => {
    var query = `
        DELETE FROM komponen_darah WHERE id = '` + req.body.id + `';
    `;
    db.query(query, (err, row) => {
        if (err) {
            res.send(err);
        } else {
            res.send(row);
        }
    });
});

module.exports = router;
