// auth/middlewares.js
const jwt = require('jsonwebtoken');
var dbUmum = require('../db/MySql/umum');

function checkTokenSeetUser(req, res, next){
  try {
    // 1) Ambil dari header Authorization bila ada (format: "Scheme token")
    const authHeader = req.get('authorization');

    let token = null;
    if (authHeader) {
      const parts = authHeader.split(' ');
      token = parts.length > 1 ? parts[1] : parts[0];
    }

    // 2) Jika tidak ada di header, coba ambil dari query param `token`
    if (!token && req.query && req.query.token) {
      token = req.query.token;
      // opsional: set header supaya kode lain yang mengandalkan header tetap bekerja
      req.headers = req.headers || {};
      req.headers.authorization = 'kikensbatara ' + token;
    }

    // 3) Jika tidak ada token, lanjutkan tanpa user (seperti pola Anda sekarang)
    if (!token) {
      return next();
    }

    // 4) Verifikasi JWT
    jwt.verify(token, process.env.TOKEN_SECRET, function(error, user) {
      if (error) {
        console.warn('JWT verify failed:', error && error.message ? error.message : error);
        // jangan throw — pola lama Anda melanjutkan meski error
        req.user = null;
        return next();
      }

      // sukses -> isi req.user
      req.user = user;
      return next();
    });

  } catch (ex) {
    console.error('checkTokenSeetUser unexpected error:', ex);
    // tetap lanjutkan supaya route bisa memutuskan akses memakai isLoggedIn jika perlu
    next();
  }
}

function isLoggedIn(req, res, next){
  if (req.user) {
    next();
  } else {
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
};
