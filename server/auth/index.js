const express = require('express');
const Joi = require('joi');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
var uniqid = require('uniqid');

// var admin = require("firebase-admin");
const fetch = require('node-fetch')

var dbs = require('../db/MySql/umum');
const util = require('util');
const query = util.promisify(dbs.query).bind(dbs);



const router = express.Router();

const schema = Joi.object().keys({
  username: Joi.string().regex(/^[a-zA-Z0-9_]*$/).min(3).max(13).required(),
  password: Joi.string().min(6).required(),
});



router.get('/', (req, res) => {
  res.json({
    message: 'kiken-login'
  });
});

function respondError422(res, next, text) {
  res.status(422);
  const error = new Error(text);
  next(error);
}

router.post('/login', async (req, res, next) => {
  try {
    console.log("ADA YG LOGIN", req.body);

    const { error } = schema.validate(req.body);
    if (error) {
      return respondError422(res, next, "Gagal Login: periksa username/password");
    }

    const username = req.body.username;

    const viewSql = `
        SELECT u.*
        FROM stokdarah_konut.users u
        WHERE u.username = ?
        LIMIT 1
      `;
    const rows = await query(viewSql, [username]);

    // pastikan rows ada dan array
    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      return respondError422(res, next, "Username Salah");
    }

    const user = rows[0];

    if (!process.env.TOKEN_SECRET) {
      console.warn('TOKEN_SECRET not set in env!');
      // jangan berikan detail sensitif ke client; hanya error internal
      res.status(500);
      return next(new Error('Server configuration error'));
    }

    const match = await bcrypt.compare(req.body.password, user.password);
    if (!match) {
      return respondError422(res, next, "Password salah");
    }

    let ruanganData = null;
    try {
      const sqlRuangan = `
        SELECT id AS ruangan_id, nama_ruangan
        FROM stokdarah_konut.tenaga_medis
        WHERE users_id = ?
        LIMIT 1
      `;
      const ruanganRows = await query(sqlRuangan, [user.id]);
      if (ruanganRows && ruanganRows.length > 0) {
        ruanganData = ruanganRows[0];
      }
    } catch (e) {
      console.warn("Gagal mengambil data ruangan:", e);
    }

    const payload = {
      _id: user.id,
      username: user.username,
      profile: {
        nama: user.nama || user.nama_nip || '',
        stokdarah_konut: user.stokdarah_konut || null, // role user (admin ruangan, upd, admin)
        ...(ruanganData ? ruanganData : {}), // merge ruangan_id & nama_ruangan kalau ada
        [process.env.MAIN_DB_MYSQL || 'main_db']: user[process.env.MAIN_DB_MYSQL] || null
      }
    };

    const token = jwt.sign(payload, process.env.TOKEN_SECRET, { expiresIn: '24h' });
    res.json({ token, profile: payload });
  } catch (err) {
    console.error('LOGIN ERROR', err);
    res.status(500);
    next(err);
  }
});

module.exports = router;