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

// router.post('/signup', (req, res, next) => {

//     const request = {
//         username : req.body.username,
//         password : req.body.password,
//     }

//     const result = Joi.validate(request, schema);

//     if (result.error === null) {

//         let view = `SELECT * FROM users where id = '`+req.body.username+`' `;


//         dbs.query(view, (err, row)=>{
//             if(row.length <= 0) {
//                 bcrypt.hash(req.body.password.trim(), 12).then(hashedPassword => {

//                     const id = uniqid();
//                     const username = req.body.username;
//                     const password = hashedPassword;
//                     const nama_nip = req.body.nama_nip;
//                     const email = nama_nip+'@konaweselatankab.go.id';
//                     const unit_kerja = req.body.unit_kerja_id;
//                     const Office = 0;
//                     const Planing = 0;
//                     const Aset = 0;
//                     const Monev = 0;
//                     const Berita = 0;
//                     const Pengaduan = 0;
//                     const Sakip = 0;
//                     const Bhumie = 0;
//                     const CCTV = 0;
//                     const Simpeg = 0;
//                     const Linja = 0;
//                     const Registrasi = 0;
//                     const absensi = 0;
                    
//                     // const createdAt = new Date(); 
//                     // const editedAt = new Date(); 

//                     let insert = `
//                         INSERT INTO users (id, username, password, email, unit_kerja, nama_nip, Office, Planing, Aset, Monev, Berita, Pengaduan, Sakip, Bhumie, CCTV, Simpeg, Linja, Registrasi, absensi, createdAt, editedAt)
//                         VALUES ('`+id+`', '`+username+`', '`+password+`', '`+email+`', '`+unit_kerja+`', '`+nama_nip+`', `+Office+`, '`+Planing+`', `+Aset+`, `+Monev+`, `+Berita+`, `+Pengaduan+`, '`+Sakip+`', `+Bhumie+`, `+CCTV+`, '`+Simpeg+`', `+Linja+`, `+Registrasi+`, `+absensi+`, NOW(), NOW());
//     `;
//                     dbs.query(insert, (err, row)=>{
//                         if(err) {
//                             res.send('Gagal dalam meregistrasi ');
//                         }else{
//                             res.send(row);
//                         }
//                     })

//                 });
//             }else{
//                 const error = new Error('Username sudah terpakai oleh user lain');
                
//                 res.status(409);
//                 next(error);
//             }
//         })
//     } else {
//         res.status(422);
//         next(result.error);
//     }
// });


function respondError422(res, next, text){
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
  
      const payload = {
        _id: user.id,
        username: user.username,
        profile: {
          nama: user.nama || user.nama_nip || '',
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