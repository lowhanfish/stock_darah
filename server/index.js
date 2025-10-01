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
  origin : '*'
}));
app.use(express.json());

app.use(middleware.checkTokenSeetUser);


app.get('/', (req, res) => {
  res.json({
    message: '🦄🌈✨Hello pengunjung,,, Anda mengunjugi alamat yg salah... mungkin maksud anda http://konaweselatankab.go.id ! 🌈✨🦄',
    user : req.user
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

    const dm_bid = require('./apiMysql/client/dataMaster/dm_bid');
    app.use('/api/v1/dm_bid', middleware.isLoggedIn, middleware.sideMenuMidleware, dm_bid);

    const data_mitra = require('./apiMysql/client/dataMaster/data_mitra');
    app.use('/api/v1/data_mitra', middleware.isLoggedIn, middleware.sideMenuMidleware, data_mitra);


    const checkAuth = require('./apiMysql/checkAuth');
    app.use('/api/v1/checkAuth', middleware.isLoggedIn, checkAuth);
    // =================== SERVER =====================

    // =================== CLIENT =====================
      const berita = require('./apiMysql/client/berita');
      app.use('/api/v1/berita', middleware.isLoggedIn, berita);
      const kegiatan_csr = require('./apiMysql/client/kegiatan_csr');
      app.use('/api/v1/kegiatan_csr', middleware.isLoggedIn, kegiatan_csr);

      const list_pengajuan = require('./apiMysql/client/list_pengajuan');
      app.use('/api/v1/list_pengajuan', middleware.isLoggedIn, list_pengajuan);
      const list_pengajuan_force = require('./apiMysql/client/list_pengajuan_force');
      app.use('/api/v1/list_pengajuan_force', middleware.isLoggedIn, list_pengajuan_force);

      const forceMajeure = require('./apiMysql/client/forceMajeure');
      app.use('/api/v1/forceMajeure', middleware.isLoggedIn, forceMajeure);
      const dashboard = require('./apiMysql/client/dashboard');
      app.use('/api/v1/dashboard', middleware.isLoggedIn, dashboard);


      const reg_tenagamedis = require('./apiMysql/client/dataMaster/authorization/reg_tenagamedis');
      app.use('/api/v1/reg_tenagamedis', reg_tenagamedis);







    // =================== CLIENT =====================




    // =================== PUBLISH =====================


    const publish_bidang_usaha = require('./apiMysql/publish/bidang_usaha');
    app.use('/api/v1/publish_bidang_usaha', publish_bidang_usaha);

    const registrasiMitra = require('./apiMysql/publish/registrasiMitra');
    app.use('/api/v1/publish/registrasiMitra', registrasiMitra);

    const homeCSR = require('./apiMysql/publish/homeCSR');
    app.use('/api/v1/publish/homeCSR', homeCSR);

    const kegiatanCSR = require('./apiMysql/publish/kegiatanCSR');
    app.use('/api/v1/publish/kegiatanCSR', kegiatanCSR);
    const kegiatan_fmCSR = require('./apiMysql/publish/kegiatan_fmCSR');
    app.use('/api/v1/publish/kegiatan_fmCSR', kegiatan_fmCSR);
    const beritaCSR = require('./apiMysql/publish/beritaCSR');
    app.use('/api/v1/publish/beritaCSR', beritaCSR);

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