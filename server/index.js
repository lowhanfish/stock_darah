const express = require('express');
// const volleyball = require('volleyball');
const cors = require('cors');
var path = require("path");

require('dotenv').config();



const app = express();

const middleware = require('./auth/middlewares');
const auth = require('./auth');


// app.use(volleyball);

app.use(cors({
  // origin : 'http://localhost:8081'
  origin: '*'
}));
app.use(express.json());

app.use(middleware.checkTokenSeetUser);


app.get('/', (req, res) => {
  res.json({
    message: '🦄🌈✨Hello pengunjung,,, Anda mengunjugi alamat yg salah... mungkin maksud anda http://konaweselatankab.go.id ! 🌈✨🦄',
    user: req.user
  });
});


app.use('/auth', auth);
app.use('/uploads', express.static(path.join(__dirname, './uploads')))

// ================================== BATAS =====================================================


// =================== SERVER =====================

const dm_menuList = require('./apiMysql/client/dataMaster/authorization/menuList');
app.use('/api/v1/dm_menuList', middleware.isLoggedIn, middleware.sideMenuMidleware, dm_menuList);

const dm_kelompokUsers = require('./apiMysql/client/dataMaster/authorization/kelompokUsers');
app.use('/api/v1/dm_kelompokUsers', middleware.isLoggedIn, middleware.sideMenuMidleware, dm_kelompokUsers);



const checkAuth = require('./apiMysql/checkAuth');
app.use('/api/v1/checkAuth', middleware.isLoggedIn, checkAuth);
// =================== SERVER =====================

// =================== CLIENT =====================

const berita = require('./apiMysql/client/berita');
app.use('/api/v1/berita', middleware.isLoggedIn, berita);
const dashboard = require('./apiMysql/client/dashboard');
app.use('/api/v1/dashboard', middleware.isLoggedIn, dashboard);


const reg_tenagamedis = require('./apiMysql/client/dataMaster/authorization/reg_tenagamedis');
app.use('/api/v1/reg_tenagamedis', reg_tenagamedis);
const reg_pendonor = require('./apiMysql/client/dataMaster/authorization/reg_pendonor');
app.use('/api/v1/reg_pendonor', reg_pendonor);
const reg_admin = require('./apiMysql/client/dataMaster/authorization/reg_admin');
app.use('/api/v1/reg_admin', reg_admin);
const reg_masyarakat = require('./apiMysql/client/dataMaster/authorization/reg_masyarakat');
app.use('/api/v1/reg_masyarakat', reg_masyarakat);

const jadwal_donor = require('./apiMysql/client/jadwal_donor');
app.use('/api/v1/jadwal_donor', middleware.isLoggedIn, jadwal_donor);
const komponen = require('./apiMysql/client/dataMaster/komponen');
app.use('/api/v1/komponen', middleware.isLoggedIn, komponen);
const stok_darah = require('./apiMysql/client/stok_darah');
app.use('/api/v1/stok_darah', middleware.isLoggedIn, stok_darah);
const transaksi_darah = require('./apiMysql/client/manajemen_darah/transaksi_darah');
app.use('/api/v1/transaksi_darah', middleware.isLoggedIn, transaksi_darah);

// =================== CLIENT =====================




// =================== PUBLISH =====================

const homeDarah = require('./apiMysql/publish/homeDarah');
app.use('/api/v1/publish/homeDarah', homeDarah);

const beritaPublish = require('./apiMysql/publish/beritaPublish');
app.use('/api/v1/publish/beritaPublish', beritaPublish);

const jadwalPublish = require('./apiMysql/publish/jadwalPublish');
app.use('/api/v1/publish/jadwalPublish', jadwalPublish);

const pendonorPublish = require('./apiMysql/publish/pendonorPublish');
app.use('/api/v1/publish/pendonorPublish', pendonorPublish);

const stokPublish = require('./apiMysql/publish/stokPublish');
app.use('/api/v1/publish/stokPublish', stokPublish);




// =================== ENDPUBLISH =====================



// ================================== BATAS =====================================================

// >>>>>>> d3108e8369f9f0f379270f0f6f53f5b9ef7abde6

// const checkAbsenOtomatis = require('./apiMysql/library/checkAbsenOtomatis');
// checkAbsenOtomatis.checkKehadiranOtomatis();

function notFound(req, res, next) {
  res.status(404);
  const error = new Error('Not Found data - ' + req.originalUrl);
  next(error);
}

function errorHandler(err, req, res, next) {
  res.status(res.statusCode || 500);
  res.json({
    message: err.message,
    stack: err.stack
  });
}

app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT || 5088;
const server = app.listen(port, '0.0.0.0', () => {
  console.log('Listening on port', port);
});