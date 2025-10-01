// Membuat verifikasi token yang dikirimkan melalui headers client

const jwt = require('jsonwebtoken');
var dbUmum = require('../db/MySql/umum');

function checkTokenSeetUser(req, res, next){
     const authHeader = req.get('authorization');
     if (authHeader) {
          // jika ada authorization yang dikirim client melalui headers
          // dan karena token yang dikirim dipisahkan spasi maka kita pisahkan bagiannya
          const token = authHeader.split(' ')[1];
          if (token) {
               // jika tokennya ada
               // maka lakukan verifikasi terhadap token tersebut
               jwt.verify(token, process.env.TOKEN_SECRET, function(error, user) {
                    if (error) {
                         console.log(error);
                    }

                    // Jika tidak ada error selanjutnya token di dapatkan
                    // akan di terjemakan ke identitas user clien
                    req.user = user;
                    next()
               });
          }else{
               next();
          }

     }else{

          next();
     }
}

function isLoggedIn(req, res, next){
     if (req.user) {
          // jika login maka lanjutkan ke tahap berikutnya
          next();
     }else {
          // kalau tidak login berikan respon error
          const error = new Error('SSILAHKAN LOGIN DULU..!!!');
          res.status(401);
          next(error);
     }
}

function sideMenuMidleware(req, res, next){
     try {
 
         const profile = (req.user && req.user.profile) ? req.user.profile : {};
         const menuKlpId = parseInt(profile.stokdarah_konut, 10);
 
     
 
         if (!Number.isFinite(menuKlpId) || menuKlpId <= 0) {
             // validasi gagal: jangan error, kasih empty menu agar UI tetap jalan
             req.menu_akses = [];
             return next();
         }
 
         const sql = `
             SELECT
               menu_klp_list.*,
               menu.route
             FROM menu_klp_list
             JOIN menu ON menu_klp_list.menu_id = menu.id
             WHERE menu_klp_list.menu_klp_id = ?
         `;
 
         dbUmum.query(sql, [menuKlpId], (err, rows) => {
             if (err) {
                 console.error('sideMenuMidleware - DB ERROR:', err);
                 req.menu_akses = [];
                 return next();
             }
             req.menu_akses = Array.isArray(rows) ? rows : [];
             next();
         });
     } catch (err) {
         console.error('sideMenuMidleware - CATCH ERROR:', err);
         req.menu_akses = [];
         next();
     }
 }
 
module.exports = {
     checkTokenSeetUser,
     isLoggedIn,
     sideMenuMidleware,
     // checkUserProfile,
}