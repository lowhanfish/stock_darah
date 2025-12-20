<template>
    <div>
      <!-- :: Breadcrumb Header -->
      <section
        class="breadcrumb-header"
        style="background-image: url(assets/images/header/bgheader.png)"
      >
        <div class="overlay"></div>
        <div class="container">
          <div class="row">
            <div class="col-lg-12">
              <div class="banner text-center">
                <h1>Registrasi Belum Tersedia</h1>
                <ul>
                  <li>
                    <a href="javascript:void(0);">
                      Halaman pendaftaran masih dalam tahap pengembangan
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
  
      <!-- :: Error / Maintenance Area -->
      <section class="page-404-area py-100-70">
        <div class="container">
          <div class="row">
            <div class="col-md-8 offset-md-2 text-center">
              <h2 class="error-code">🚧</h2>
              <h4 class="mb-15">Fitur Registrasi Sedang Dikembangkan</h4>
  
              <p class="error-desc">
                Mohon maaf, halaman <strong>Registrasi Pengguna</strong> saat ini
                masih dalam proses pengembangan dan belum dapat diakses.
                <br />
                Silakan kembali lagi dalam waktu dekat atau hubungi admin untuk
                informasi lebih lanjut.
              </p>
  
              <a href="/" class="btn-1 mt-20">
                Kembali ke Beranda
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  </template>
  
  <script>
  export default {
    name: "regis",
  };
  </script>
  
  <style scoped>
  .error-code {
    font-size: 72px;
    font-weight: 700;
    color: #13ade5;
    margin-bottom: 10px;
  }
  
  .error-desc {
    font-size: 15px;
    line-height: 1.8;
    color: #555;
  }
  </style>
  