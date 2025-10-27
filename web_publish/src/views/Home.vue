<template>
    <!-- :: Header -->
    <section class="header">
        <div ref="heroCarousel" class="header-carousel owl-carousel owl-theme">
            <div class="sec-hero display-table" style="background-image: url(/assets/images/header/01_header.jpg)">
                <div class="table-cell">
                    <div class="overlay"></div>
                    <div class="container">
                        <div class="row">
                            <div class="col-lg-6">
                                <div class="banner">
                                    <h1 class="handline">We Take Care Your Healthy Life</h1>
                                    <p class="about-website">
                                        MedDoctors Are A Medical And Health Department Provider Institutions.
                                        Suitable For Healthcare, Medical, Doctor, Dental, Dentist, Pharmacy,
                                        Health And Any Related Medical Care Field.
                                    </p>
                                    <a class="btn-1 move-section" href="#start">Let's Start</a>
                                    <a class="btn-1 btn-2 ml-30" href="01_department.html">Our Department</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="sec-hero display-table" style="background-image: url(/assets/images/header/02_header.jpg)">
                <div class="table-cell">
                    <div class="overlay"></div>
                    <div class="container">
                        <div class="row">
                            <div class="col-lg-6">
                                <div class="banner">
                                    <h1 class="handline">Best Doctor &amp; Medical Care</h1>
                                    <p class="about-website">
                                        MedDoctors Are A Medical And Health Department Provider Institutions.
                                        Suitable For Healthcare, Medical, Doctor, Dental, Dentist, Pharmacy,
                                        Health And Any Related Medical Care Field.
                                    </p>
                                    <a class="btn-1 btn-2" href="01_doctors-timetable.html">Find A Doctor</a>
                                    <a class="btn-1 btn-3 ml-30" href="01_about-us.html">Discover More</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="sec-hero display-table" style="background-image: url(/assets/images/header/03_header.jpg)">
                <div class="table-cell">
                    <div class="overlay"></div>
                    <div class="container">
                        <div class="row">
                            <div class="col-lg-6">
                                <div class="banner">
                                    <h1 class="handline">Care Whenever You Need It</h1>
                                    <p class="about-website">
                                        MedDoctors Are A Medical And Health Department Provider Institutions.
                                        Suitable For Healthcare, Medical, Doctor, Dental, Dentist, Pharmacy,
                                        Health And Any Related Medical Care Field.
                                    </p>
                                    <a class="btn-1 btn-2" href="01_about-us.html">More About Us</a>
                                    <span class="header-video ml-30">
                                        <a href="https://youtu.be/TKnufs85hXk" class="pulse" data-lity="">
                                            <i class="fas fa-play"></i>
                                        </a>
                                        <span class="video-name">Watch Our <br>Video!</span>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- :: Features -->
    <section class="features" style="background-color: #F8F8F8;">
        <div class="container">
            <div class="row all-features-item">

                <div class="col-lg-4">
                    <div class="features-item one card-style">
                        <div class="card-content">
                            <div class="card-left">
                                <h4 class="card-title">Pendonor Aktif</h4>
                                <div class="card-number">1.025</div>
                                <div class="card-sub">Pendonor Terdaftar</div>
                            </div>

                            <div class="card-illustration">
                                <img class="features-icon" src="/assets/images/donor1.png" alt="Donor" />
                            </div>
                        </div>
                    </div>
                </div>

                <div class="col-lg-4">
                    <div class="features-item two card-style">
                        <div class="card-content">
                            <div class="card-left">
                                <h4 class="card-title">Total Stock Darah</h4>
                                <div class="card-number">24/7</div>
                                <div class="card-sub">Kantong Tersedia</div>
                            </div>

                            <div class="card-illustration">
                                <img class="features-icon" src="/assets/images/darah.png" alt="Appointment" />
                            </div>
                        </div>
                    </div>
                </div>

                <div class="col-lg-4">
                    <div class="features-item three card-style">
                        <div class="card-content">
                            <div class="card-left">
                                <h4 class="card-title">Permintaan Darah</h4>
                                <div class="card-number">150+</div>
                                <div class="card-sub">Kantong Darah</div>
                            </div>

                            <div class="card-illustration">
                                <img class="features-icon" src="/assets/images/Permintaan.png" alt="Doctor" />
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </section>

    <!-- :: Stok darah -->
    <section class="doctors py-100-70">
        <img src="/assets/images/virus.png" alt="dekor virus" class="decor decor-right" />
        <img src="/assets/images/cells.png" alt="dekor sel darah" class="decor decor-left" />


        <div class="container">
            <div class="sec-title">
                <div class="row">
                    <div class="col-lg-5">
                        <h2>STOK DARAH</h2>
                        <h3>Ketersediaan Darah &amp; yang Aman dan Terjamin</h3>

                    </div>
                    <div class="col-lg-5">
                        <p class="sec-explain">Pantau status ketersediaan darah di wilayah Anda secara real-time. Kami
                            menyediakan
                            data terkini mengenai semua golongan darah untuk layanan medis darurat.</p>

                        <a class="btn-1 sec-btn" href="01_doctors.html">Cek Ketersediaan Golongan Darah</a>
                    </div>
                </div>
            </div>
            <div class="provide-content">
                <div class="row">
                    <div class="row">
                        <div class="col-md-6 col-lg-3" v-for="(b, idx) in bloods" :key="idx">
                            <div class="blood-card">
                                <div class="blood-card-header">
                                    <div class="blood-type">
                                        <img :src="b.image" :alt="'Golongan ' + b.type" class="blood-icon" />
                                        <div class="blood-stats">
                                            <div class="count">{{ b.count }}</div>
                                            <div class="unit">Kantong</div>
                                        </div>

                                        <div class="blood-label">
                                            <div class="type-text">{{ b.type }}</div>
                                            <div :class="['badge',
                            b.status === 'Tersedia' ? 'badge-available' :
                                b.status === 'Rendah' ? 'badge-low' :
                                    b.status === 'Kritis' ? 'badge-critical' : 'badge-default']">
                                                {{ b.status }}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div class="blood-card-footer">
                                    <div class="divider"></div>
                                    <div class="meta">Terakhir diperbarui: <span class="time">{{ b.updated }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </section>

    <!-- :: Blog (DIUBAH: tampilkan 3 berita terakhir dari backend) -->
    <section class="blog py-100-70">
        <div class="container">
            <div class="sec-title">
                <div class="row">
                    <div class="col-lg-4">
                        <h2>Artikel Terbaru</h2>
                        <h3>Kegiatan dan Edukasi Kesehatan Terkini</h3>
                    </div>
                    <div class="col-lg-4">
                        <p class="sec-explain">Ikuti berita tentang seminar medis, kampanye kesehatan masyarakat, dan
                            tips lifestyle dari tim dokter berpengalaman kami. Selalu update demi hidup sehat Anda..</p>
                        <a class="btn-1 sec-btn" href="02_blog.html">Jelajahi Artikel Kami</a>
                    </div>
                    <div class="col-lg-4">
                        <div class="features-opening-hours" style="position: relative;">
                            <div class="status-badge status-aktif">Aktif</div>
                            <div class="header-icon-title">
                                <img src="/assets/images/donasi.png" alt="Donor Icon" style="height: 100px;"
                                    class="flaticon-globe" />
                                <h4>Jadwal Donor Darah</h4>
                            </div>

                            <div class="content-row">
                                <div class="schedule">
                                    <p><strong>Nama Kegiatan:</strong><br> Donor Darah Peduli Sesama</p>
                                    <p><strong>Tanggal:</strong><br> 1 – 3 November 2025</p>
                                    <p><strong>Waktu:</strong><br> 08.00 – 15.00 WITA</p>
                                    <p><strong>Lokasi:</strong><br> RSUD KONUT</p>
                                    <a href="https://www.google.com/maps?q=RSUD+Konawe+Utara" target="_blank"
                                        class="btn-map">
                                        📍 Google Maps
                                    </a>
                                </div>
                                <div class="poster">
                                    <img src="/assets/images/poster-donor.jpg" class="poster-img"
                                        @click="openModal('/assets/images/poster-donor.jpg')" />
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

            </div>

            <div class="row">
                <!-- Skeleton / placeholder saat loading -->
                <template v-if="loadingArticles">
                  <div class="col-md-6 col-lg-4" v-for="n in 3" :key="'sk-'+n">
                    <div class="blog-item">
                      <div class="img-box" style="background:#eee;height:180px;border-radius:6px"></div>
                      <div class="text-box">
                        <span class="blog-date">&nbsp;</span>
                        <div class="title-blog"><h5 style="background:#eee;height:22px;width:80%;border-radius:4px"></h5></div>
                        <p style="background:#f5f5f5;height:48px;width:100%;border-radius:4px;margin-top:8px"></p>
                      </div>
                    </div>
                  </div>
                </template>

                <!-- Tampilkan 3 artikel terakhir -->
                <template v-else>
                  <div class="col-md-6 col-lg-4" v-for="item in articles" :key="item.id">
                    <div class="blog-item">
                      <div class="img-box">
                        <a :href="articleLink(item)" class="open-post" @click.prevent="openArticle(item)">
                          <img class="img-fluid" :src="item.image_url" :alt="item.judul" style="max-height:180px;object-fit:cover;width:100%" />
                        </a>
                      </div>
                      <div class="text-box">
                        <span class="blog-date">{{ formatDate(item.createAt) }}</span>
                        <a href="#" class="title-blog" @click.prevent="openArticle(item)">
                          <h5 v-html="item.judul"></h5>
                        </a>
                        <p>{{ excerpt(item.isi) }}</p>
                        <a href="#" class="link" @click.prevent="openArticle(item)">Discover More</a>
                      </div>
                    </div>
                  </div>

                  <div class="col-12" v-if="articles.length === 0">
                    <p>Tidak ada artikel terbaru.</p>
                  </div>
                </template>
            </div>
        </div>
    </section>

    <!-- :: Gallery -->
    <div class="gallery py-100-70" style="background-color: #F8F8F8;">
        <div class="container">
            <div class="sec-title">
                <div class="row">
                    <div class="col-lg-5">
                        <h2>Feature's Gallery</h2>
                        <h3>Momen Pelayanan dan Aksi Sosial Terbaik Kami</h3>
                    </div>
                    <div class="col-lg-5">
                        <p class="sec-explain">Kami mengabadikan setiap momen komitmen kami, mulai dari bakti sosial,
                            kampanye kesehatan masyarakat, hingga event edukasi medis yang kami selenggarakan.</p>
                        <a class="btn-1 sec-btn" href="01_gallery.html">View All Gallery</a>
                    </div>
                </div>
            </div>
            <div class="row">
                <!-- gallery items tetap seperti semula (tidak diubah) -->
                <div class="col-md-6 col-lg-4">
                    <div class="gallery-item">
                        <span></span>
                        <div class="img-box">
                            <img class="img-fluid gallery-item-img" src="/assets/images/gallery/01_gallery.jpg"
                                alt="01 Gallery">
                        </div>
                        <div class="hover-box">
                            <div class="text-box">
                                <div class="tags"><a href="01_single-gallery.html">surgery</a></div>
                                <h4><a href="01_single-gallery.html">Complete surgery</a></h4>
                            </div>
                            <ul class="gallery-icon">
                                <li><a href="01_single-gallery.html"><i class="fas fa-link"></i></a></li>
                                <li><a class="popup" href="/assets/images/gallery/01_gallery.jpg"><i
                                            class="far fa-eye"></i></a></li>
                            </ul>
                        </div>
                    </div>
                </div>
                <!-- ... sisa gallery tetap sama ... -->
            </div>
        </div>
    </div>

    <!-- Modal Gambar -->
    <div id="imageModal" ref="imageModal" :class="['modal', { show: isModalOpen }]" @click.self="closeModal"
        aria-hidden="true">
        <span class="close" id="modalClose" aria-label="Tutup" @click="closeModal">&times;</span>
        <img class="modal-content" ref="modalImage" :src="modalSrc" alt="Poster besar" />
    </div>

</template>

<script>
import { nextTick } from 'vue'

export default {
    data() {
        return {
            bloods: [
                { type: 'A', count: 45, status: 'Tersedia', image: '/assets/images/aa.png', updated: '21/9/2025, 01.45.34' },
                { type: 'AB', count: 2, status: 'Kritis', image: '/assets/images/abab.png', updated: '21/9/2025, 01.45.34' },
                { type: 'B', count: 10, status: 'Rendah', image: '/assets/images/bb.png', updated: '21/9/2025, 01.45.34' },
                { type: 'O', count: 10, status: 'Rendah', image: '/assets/images/oo.png', updated: '21/9/2025, 01.45.34' },
                // ... dst
            ],
            isModalOpen: false,
            modalSrc: '',
            // berita
            articles: [],
            loadingArticles: false,
        }
    },
    name: 'Home',
    async mounted() {
        await nextTick()
        const el = this.$refs.heroCarousel
        if (!el) {
            console.warn('heroCarousel ref tidak ditemukan')
            return
        }
        if (window.$ && typeof window.$.fn.owlCarousel === 'function') {
            const $el = window.$(el)
            // hindari double init
            if (!$el.hasClass('owl-loaded')) {
                $el.owlCarousel({
                    items: 1,
                    loop: true,
                    nav: true,
                    dots: true,
                    autoplay: true,
                    autoplayTimeout: 5000,
                    navText: [
                        '<i class="flaticon-back"></i>',
                        '<i class="flaticon-next"></i>'
                    ]
                })
                // paksa refresh ukuran
                setTimeout(() => $el.trigger('refresh.owl.carousel'), 200)
            }
        } else {
            console.error('jQuery / owlCarousel tidak tersedia')
        }

        // ambil 3 berita terakhir saat mounted (fokus: berita saja)
        this.loadLatestNews()
    },
    methods: {
        openModal(src) {
            this.modalSrc = src
            this.isModalOpen = true
            document.body.style.overflow = 'hidden'
        },
        closeModal() {
            this.isModalOpen = false
            this.modalSrc = ''
            document.body.style.overflow = '' // reset
        },

        /* ------------------ Berita: ambil 3 terakhir ------------------ */
       /* ------------------ Berita: ambil 3 terakhir (perbaikan agar safe jika this.$store undefined) ------------------ */
async loadLatestNews() {
  this.loadingArticles = true
  try {
    // safe access ke this.$store (fallback ke defaults)
    const storeFallback = {
      berita: 'http://localhost:5088/api/v1/berita',
      url: { URL_APP: 'http://localhost:5088/' },
      UPLOADS: 'http://localhost:5088/uploads/',
      auth: { token: null }
    }
    const store = (this && this.$store) ? this.$store : { state: storeFallback }

    // tentukan base endpoint berita
    const base = (store.state.berita) ? store.state.berita : (store.state.url && store.state.url.URL_APP ? store.state.url.URL_APP + 'api/v1/berita' : storeFallback.berita)
    const url = base.replace(/\/$/, '') + '/getview'
    const payload = { data_ke: 1, cari_value: '', page_limit: 3 }

    const headers = { 'Content-Type': 'application/json' }
    const token = store.state.auth && store.state.auth.token
    if (token) headers['Authorization'] = `Bearer ${token}`

    const resp = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    })

    if (!resp.ok) {
      // coba ambil body message jika ada
      let errBody = null
      try { errBody = await resp.json() } catch(e){ /* ignore */ }
      console.error('Gagal ambil berita (HTTP):', resp.status, resp.statusText, errBody)
      this.articles = []
      return
    }

    const result = await resp.json()
    if (!(result && result.success && Array.isArray(result.data))) {
      console.warn('Response tidak mengandung data berita yang diharapkan:', result)
      this.articles = []
      return
    }

    // siapkan base uploads (fallback)
    const baseUploads = (store.state.UPLOADS)
                      ? String(store.state.UPLOADS).replace(/\/$/, '')
                      : (store.state.url && store.state.url.URL_APP ? (store.state.url.URL_APP + 'uploads').replace(/\/$/, '') : storeFallback.UPLOADS.replace(/\/$/, ''))

    // untuk setiap berita, coba cari path gambar yang valid (HEAD request). Jika HEAD diblokir oleh CORS,
    // kita fallback langsung ke path pertama (browser mungkin gagal dengan 404).
    const mapPromises = result.data.map(async r => {
      const fileName = r.file_name || ''
      let image_url = '/assets/images/blog/placeholder.jpg' // fallback

      if (fileName) {
        const fn = encodeURIComponent(fileName)
        const tryPaths = [
          `${baseUploads}/berita/${fn}`,
          `${baseUploads}/${fn}`
        ]

        for (let p of tryPaths) {
          try {
            // HEAD request untuk cek ada atau tidak; jika gagal karena CORS, kita lanjutkan dan tidak pilih path itu
            const check = await fetch(p, { method: 'HEAD' })
            if (check && check.ok) {
              image_url = p
              break
            }
            // jika check.status === 405 (method not allowed) atau 403/401/0, skip dan coba path berikutnya
          } catch (err) {
            // HEAD request error (mungkin CORS) — jangan crash, coba path berikutnya
            // console.debug('HEAD check failed for', p, err)
          }
        }

        // jika semua HEAD gagal, setlah ke first try path (agar browser tetap mencoba men-load gambar; mungkin 200)
        if (image_url === '/assets/images/blog/placeholder.jpg') {
          image_url = tryPaths[0]
        }
      }

      return {
        id: r.id,
        judul: r.judul,
        sumber: r.sumber,
        isi: r.isi,
        file_name: r.file_name,
        createAt: r.createAt || r.create_at || r.createdAt || null,
        image_url
      }
    })

    this.articles = await Promise.all(mapPromises)
  } catch (e) {
    console.error('Exception loadLatestNews:', e)
    this.articles = []
  } finally {
    this.loadingArticles = false
  }
},
/* ------------------ akhir berita ------------------ */


        formatDate(dt) {
          if (!dt) return ''
          // DB kamu sudah memberikan createAt seperti "2025-10-25 11:20:10" atau "2025-10-25"
          const d = new Date(dt)
          if (isNaN(d)) {
            // fallback: tampilkan apa adanya
            return dt
          }
          const opts = { year: 'numeric', month: 'short', day: 'numeric' }
          return d.toLocaleDateString('id-ID', opts)
        },

        excerpt(html, len = 120) {
          if (!html) return ''
          // bersihkan tag html
          const plain = html.replace(/(<([^>]+)>)/gi, "")
          return plain.length > len ? plain.slice(0, len).trim() + '...' : plain
        },

        articleLink(item) {
          // kamu bisa sesuaikan route nama 'BeritaDetail' jika ada
          if (this.$router) {
            try {
              return this.$router.resolve({ name: 'BeritaDetail', params: { id: item.id } }).href
            } catch (e) {
              // fallback ke list
            }
          }
          return '02_blog.html'
        },

        openArticle(item) {
          // jika pakai vue-router, navigasi ke halaman detail (sesuaikan name route jika perlu)
          if (this.$router) {
            try {
              this.$router.push({ name: 'BeritaDetail', params: { id: item.id } })
              return
            } catch (e) {
              // fallback
            }
          }
          // default: ke halaman blog list
          window.location.href = `02_blog.html?id=${encodeURIComponent(item.id)}`
        }
        /* ------------------ akhir berita ------------------ */
    }
}
</script>

<style scoped>
/* Modal backdrop */
.modal {
    display: none;
    position: fixed;
    z-index: 9999;
    /* tingkat tinggi supaya di atas elemen lain */
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    padding: 60px;
    box-sizing: border-box;
    background-color: rgba(0, 0, 0, 0.85);
    align-items: center;
    justify-content: center;
    -webkit-tap-highlight-color: transparent;
}

/* Toggle tampil */
.modal.show {
    display: flex;
}

/* Gambar modal */
.modal-content {
    display: block;
    width: auto;
    height: auto;
    max-width: 90vw;
    max-height: 90vh;
    object-fit: contain;
    border-radius: 8px;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.6);
    z-index: 10000;
    pointer-events: auto;
}

/* Tombol close */
.close {
    position: absolute;
    top: 18px;
    right: 22px;
    color: #ff0000;
    font-size: 36px;
    font-weight: bold;
    cursor: pointer;
    z-index: 10001;
    /* harus lebih tinggi dari gambar */
    user-select: none;
    pointer-events: auto;
    /* pastikan menerima klik */
    background: transparent;
    padding: 6px 10px;
    border-radius: 6px;
}

/* Jika ada plugin yg mengatur pointer-events: none atau overlay di dalam modal,
   pastikan close tetap menerima klik (pointer-events:auto sudah di atas) */

/* Responsive */
@media (max-width: 480px) {
    .close {
        font-size: 30px;
        right: 14px;
        top: 12px;
    }
}

/* Tombol Maps */
.btn-map {
    display: inline-block;
    margin-top: 8px;
    padding: 8px 14px;
    background-color: #ffd4d4;
    color: #f70505;
    border-radius: 6px;
    text-decoration: none;
    font-size: 14px;
    transition: background-color 0.3s ease;
}

.btn-map:hover {
    background-color: #c62828;
    color: #ffffff;
}

/* Badge Status */
.status-badge {
    position: absolute;
    top: 10px;
    right: 10px;
    padding: 6px 12px;
    border-radius: 12px;
    color: #fff;
    font-size: 13px;
    font-weight: 600;
    z-index: 10;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
}

/* Warna berdasarkan status */
.status-aktif {
    background-color: #28a745;
    /* Hijau */
}

.status-selesai {
    background-color: #007bff;
    /* Biru */
}

.status-batal {
    background-color: #dc3545;
    /* Merah */
}
</style>
