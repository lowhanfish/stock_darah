<template>
    <footer class="footer">
      <div class="newsletter">
        <div class="container">
          <div class="row">
            <div class="col-md-6 d-flex align-items-center justify-content-between">
              <h5>Subscribe to our newsletter</h5>
            </div>
            <div class="col-md-6">
              <form>
                <input type="email" name="email" placeholder="Your Email Address...." />
                <a href="01_contact.html">Subscribe</a>
              </form>
            </div>
          </div>
        </div>
      </div>
  
      <div class="footer-content">
        <div class="container">
          <div class="row">
            <div class="col-sm-12 col-md-6 col-lg-3">
              <div class="logo">
                <!-- gunakan path absolut agar diakses dari public/assets -->
                <img class="img-fluid" src="/assets/images/logo/02_logo.png" alt="Footer Logo" />
                <p>MedDoctors Are A Medical And Health Department Provider Institutions. Suitable For Healthcare, Medical, Doctor, Dental, Dentist, Pharmacy, Health And Any Related Medical Care Field.</p>
                <ul class="footer-icon">
                  <li><a><i class="fab fa-facebook-f"></i></a></li>
                  <li><a><i class="fab fa-twitter"></i></a></li>
                  <li><a><i class="fab fa-instagram"></i></a></li>
                  <li><a><i class="fab fa-dribbble"></i></a></li>
                </ul>
              </div>
            </div>
  
            <div class="col-sm-6 col-md-6 col-lg-2">
              <div class="footer-title"><h4>Quick Link</h4></div>
              <ul class="links">
                <li><a href="01_about-us.html">About Us</a></li>
                <li><a href="01_doctors.html">Our Doctors</a></li>
                <li><a href="01_testimonial.html">Testimonial</a></li>
                <li><a href="01_gallery.html">Gallery</a></li>
                <li><a href="02_blog">Blog</a></li>
                <li><a href="01_contact.html">Contact</a></li>
                <li><a href="01_appointment.html">Appointment</a></li>
              </ul>
            </div>
  
            <div class="col-sm-6 col-md-6 col-lg-2">
              <div class="footer-title"><h4>Help Links</h4></div>
              <ul class="links">
                <li><a href="01_department.html">Departments</a></li>
                <li><a href="01_sponsors.html">Sponsors</a></li>
                <li><a href="01_faqs.html">FAQs</a></li>
                <li><a href="01_shop.html">Shop</a></li>
                <li><a href="error-page.html">Error Page</a></li>
              </ul>
            </div>
  
            <div class="col-sm-12 col-md-6 col-lg-4">
              <div class="footer-title"><h4>Open - Closed Time</h4></div>
              <ul class="opening-hours">
                <li>Monday<span>8.00 - 21.00</span></li>
                <li>Tuesday<span>8.00 - 21.00</span></li>
                <li>Wednesday<span>8.00 - 21.00</span></li>
                <li>Thursday<span>8.00 - 21.00</span></li>
                <li>Friday<span>8.00 - 21.00</span></li>
                <li>Saturday/Sunday<span>8.00 - 21.00</span></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
  
      <div class="copyright">
        <div class="container">
          <p>@ 2022 MedDoctors. With Love by <a href="https://themeforest.net/user/ar-coder/portfolio" target="_blank" rel="noopener noreferrer">AR-Coder</a></p>
          <ul>
            <li><a href="#">Terms &amp; Conditions</a></li>
            <li><a href="#">Privacy Policy</a></li>
            <li><a href="#">Sitemap</a></li>
          </ul>
        </div>
      </div>
    </footer>
  </template>
  
  <script>
  export default {
    name: 'Footer'
  }
  </script>
  
  <style scoped>
  /* tambahkan override kecil jika perlu; biarkan kosong jika style global template sudah cukup */
  </style>
  