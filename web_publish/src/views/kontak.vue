<template>
  <div>
    <!-- :: Breadcrumb Header -->
    <section class="breadcrumb-header" style="background-image: url(assets/images/header/bgheader.png)">
      <div class="overlay"></div>
      <div class="container">
        <div class="row">
          <div class="col-lg-12">
            <div class="banner">
              <h1>Kontak Kami</h1>
              <ul>
                <li>
                  <a href="javascript:void(0);">Hubungi Kami untuk Keterlibatan dan Informasi.</a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>

    <div class="contact-us py-100">
      <div class="container">
        <div class="contact-info-content">
          <div class="row">
            <div class="col-md-6 col-lg-4">
              <div class="contact-box">
                <i class="flaticon-call"></i>
                <div class="box">
                  <a class="phone" href="https://wa.me/6285345432016">+6285345432016 (WA)</a>
                  <a class="phone" href="https://wa.me/6282291662895">+6282291662895 (WA)</a>
                </div>
              </div>
            </div>
            <div class="col-md-6 col-lg-4">
              <div class="contact-box">
                <i class="flaticon-email"></i>
                <div class="box">
                  <a class="mail" href="mailto:pindara@konaweutarkab.go.id">pindara@konaweutarkab.go.id</a>
                  <a class="mail" href="mailto:rsudkonaweutara@gmail.com">rsudkonaweutara@gmail.com</a>
                </div>
              </div>
            </div>
            <div class="col-md-6 col-lg-4">
              <div class="contact-box">
                <i class="flaticon-location"></i>
                <div class="box">
                  <p>Desa Lahimbua, Kel. Andowia, Kec. Andowia, Kab. Konawe Utara.</p>
              
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col-lg-12">
            <div class="map-box">
              <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3982.1865636142948!2d122.13645941018915!3d-3.5443987964149453!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2d99bb0515e73e7d%3A0x80090f1afb060961!2sBLUD%20RS%20Kabupaten%20Konawe%20Utara!5e0!3m2!1sid!2sid!4v1764433755982!5m2!1sid!2sid" height="800" style="border:0;" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
            </div>
          </div>
          
        </div>

        
      </div>
    </div>
  </div>
</template>


<style scoped>
/* Gallery card */
.gallery-item-card {
  margin: 12px 0;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}

.gallery-item-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 10px 22px rgba(0, 0, 0, 0.09);
}

.img-box {
  width: 100%;
  aspect-ratio: 1 / 1;
  /* membuat kotak persegi responsif */
  overflow: hidden;
  background: #f2f2f2;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.gallery-item-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  /* crop dan isi area tanpa distorsi */
  display: block;
  transition: transform 0.4s ease;
}

.gallery-item-card:hover .gallery-item-img {
  transform: scale(1.05);
}

/* card body */
.card-body {
  padding: 12px;
}

.card-title {
  margin: 6px 0 4px;
  font-size: 14px;
  line-height: 1.3;
  color: #1a2b4a;
}

.tags a {
  font-size: 12px;
  color: #13ade5;
  text-transform: capitalize;
  text-decoration: none;
}

/* pagination */
.pagination-wrap {
  display: flex;
  gap: 8px;
  justify-content: center;
  align-items: center;
  margin-top: 28px;
  flex-wrap: wrap;
}

.page-btn,
.page-number {
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid #e6e6e6;
  background: #fff;
  cursor: pointer;
  min-width: 44px;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-number.active {
  background: #13ade5;
  color: white;
  border-color: #13ade5;
}

/* no data */
.no-data {
  text-align: center;
  padding: 40px 0;
  color: #777;
}

/* modal */
.modal-overlay {
  position: fixed;
  z-index: 1200;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 8px;
  width: 95%;
  max-width: 900px;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.35);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #ff6565;
  color: #fff;
}

.modal-body {
  padding: 16px;
  text-align: center;
  background: #fff;
}

.modal-img {
  max-width: 100%;
  max-height: 75vh;
  object-fit: contain;
}

.close-btn {
  background: transparent;
  border: none;
  font-size: 24px;
  color: #fff;
  cursor: pointer;
}
</style>